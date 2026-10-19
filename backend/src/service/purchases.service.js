import { db } from '../database/client.js';
import crypto from 'crypto';

export class PurchasesService {
  /**
   * 1. Add Purchase Order
   * The owner records a new medicine purchase from a registered supplier.
   */
  async createPurchase(data, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const {
        supplierId,
        orderDate,
        invoiceNo,
        items = [],
        discount = 0,
        additionalCharges = 0,
        amountPaid = 0,
        paymentMethod = 'CASH',
        notes,
      } = data;

      // Verify supplier exists
      const supRes = await client.query('SELECT * FROM "Supplier" WHERE id = $1', [supplierId]);
      if (supRes.rows.length === 0) {
        const error = new Error('Selected supplier does not exist');
        error.statusCode = 404;
        throw error;
      }

      // Generate formatted PO number: PO-YYYYMMDD-XXXX
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const purchaseOrderNo = `PO-${todayStr}-${randSuffix}`;

      // Calculate subtotal
      let subtotal = 0;
      const formattedItems = items.map((it) => {
        const qty = parseInt(it.quantity, 10);
        const unit = parseFloat(it.unitCost);
        const itemTotal = parseFloat((qty * unit).toFixed(2));
        subtotal += itemTotal;
        return {
          ...it,
          quantity: qty,
          unitCost: unit,
          totalCost: itemTotal,
        };
      });

      const numDiscount = Math.max(0, parseFloat(discount) || 0);
      const numCharges = Math.max(0, parseFloat(additionalCharges) || 0);
      const totalCost = parseFloat((subtotal - numDiscount + numCharges).toFixed(2));
      const initialPaid = Math.max(0, parseFloat(amountPaid) || 0);
      const amountDue = Math.max(0, parseFloat((totalCost - initialPaid).toFixed(2)));

      let paymentStatus = 'UNPAID';
      if (initialPaid >= totalCost && totalCost > 0) {
        paymentStatus = 'PAID';
      } else if (initialPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      const purchaseId = crypto.randomUUID();
      const pOrderDate = orderDate || new Date();

      // Insert Purchase record
      await client.query(
        `INSERT INTO "Purchase" (
          "id", "purchaseOrderNo", "invoiceNo", "supplierId", "orderDate",
          "subtotal", "discount", "additionalCharges", "totalCost",
          "amountPaid", "amountDue", "status", "paymentStatus", "notes",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, 'ORDERED', $12, $13,
          NOW(), NOW()
        )`,
        [
          purchaseId,
          purchaseOrderNo,
          invoiceNo || null,
          supplierId,
          pOrderDate,
          subtotal,
          numDiscount,
          numCharges,
          totalCost,
          initialPaid,
          amountDue,
          paymentStatus,
          notes || null,
        ]
      );

      // Insert Purchase items
      for (const it of formattedItems) {
        const itemId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "PurchaseItem" (
            "id", "purchaseId", "medicineId", "medicineName", "batchNumber",
            "quantity", "quantityReceived", "quantityRejected", "unitCost", "totalCost", "expiryDate"
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, 0, 0, $7, $8, $9
          )`,
          [
            itemId,
            purchaseId,
            it.medicineId || null,
            it.medicineName.trim(),
            it.batchNumber || null,
            it.quantity,
            it.unitCost,
            it.totalCost,
            it.expiryDate || null,
          ]
        );
      }

      // If initial payment was provided, record it in PurchasePayment
      if (initialPaid > 0) {
        const paymentId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "PurchasePayment" (
            "id", "purchaseId", "amount", "paymentDate", "paymentMethod", "notes", "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            paymentId,
            purchaseId,
            initialPaid,
            pOrderDate,
            paymentMethod || 'CASH',
            'Initial payment upon order creation',
          ]
        );
      }

      await client.query('COMMIT');
      return this.getPurchaseById(purchaseId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 2. Receive Medicines
   * Record actual quantities delivered. Update Inventory ONLY for accepted quantities.
   */
  async receiveMedicines(purchaseId, data, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { receivedDate, receivingNotes, items = [] } = data;
      const actualReceivedDate = receivedDate || new Date().toISOString().split('T')[0];

      // Fetch purchase
      const pRes = await client.query('SELECT * FROM "Purchase" WHERE id = $1 FOR UPDATE', [purchaseId]);
      if (pRes.rows.length === 0) {
        const error = new Error('Purchase order not found');
        error.statusCode = 404;
        throw error;
      }
      const purchase = pRes.rows[0];

      // Fetch existing items for this purchase
      const existingItemsRes = await client.query('SELECT * FROM "PurchaseItem" WHERE "purchaseId" = $1', [purchaseId]);
      const existingItemsMap = new Map(existingItemsRes.rows.map((row) => [row.id, row]));

      let totalOrderedQty = 0;
      let totalAcceptedQty = 0;

      for (const it of items) {
        const existingItem = existingItemsMap.get(it.purchaseItemId);
        if (!existingItem) continue;

        const orderedQty = parseInt(existingItem.quantity, 10);
        const acceptedQty = parseInt(it.quantityReceived, 10) || 0;
        const rejectedQty = parseInt(it.quantityRejected, 10) || 0;
        const batchNo = (it.batchNumber || existingItem.batchNumber || '').trim();
        const expiry = it.expiryDate || existingItem.expiryDate || null;
        const reason = it.rejectionReason || null;

        totalOrderedQty += orderedQty;
        totalAcceptedQty += acceptedQty;

        // Update PurchaseItem
        await client.query(
          `UPDATE "PurchaseItem"
           SET "quantityReceived" = $1,
               "quantityRejected" = $2,
               "batchNumber" = $3,
               "expiryDate" = $4,
               "rejectionReason" = $5
           WHERE id = $6`,
          [acceptedQty, rejectedQty, batchNo || null, expiry, reason, it.purchaseItemId]
        );

        // Update Inventory ONLY for accepted quantities
        if (acceptedQty > 0) {
          const medName = existingItem.medicineName.trim();
          let targetMedId = existingItem.medicineId;

          // Check if medicine exists by ID or by case-insensitive name
          let medRow = null;
          if (targetMedId) {
            const mRes = await client.query('SELECT * FROM "Medicine" WHERE id = $1 FOR UPDATE', [targetMedId]);
            if (mRes.rows.length > 0) medRow = mRes.rows[0];
          }

          if (!medRow) {
            const mRes = await client.query('SELECT * FROM "Medicine" WHERE LOWER(TRIM(name)) = LOWER($1) LIMIT 1 FOR UPDATE', [medName]);
            if (mRes.rows.length > 0) medRow = mRes.rows[0];
          }

          const unitCost = parseFloat(existingItem.unitCost);
          let prevStock = 0;
          let newStock = acceptedQty;

          if (medRow) {
            targetMedId = medRow.id;
            prevStock = parseInt(medRow.quantity, 10) || 0;
            newStock = prevStock + acceptedQty;

            await client.query(
              `UPDATE "Medicine"
               SET quantity = $1,
                   "purchaseCost" = $2,
                   "purchaseDate" = $3,
                   "updatedAt" = NOW()
               WHERE id = $4`,
              [newStock, unitCost, actualReceivedDate, targetMedId]
            );
          } else {
            targetMedId = crypto.randomUUID();
            const defaultSelling = parseFloat((unitCost * 1.25).toFixed(2));
            await client.query(
              `INSERT INTO "Medicine" ("id", "name", "quantity", "purchaseCost", "sellingPrice", "price", "purchaseDate", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $5, $6, NOW())`,
              [targetMedId, medName, acceptedQty, unitCost, defaultSelling, actualReceivedDate]
            );
          }

          // Link updated medicine ID back to purchase item if null
          if (!existingItem.medicineId) {
            await client.query('UPDATE "PurchaseItem" SET "medicineId" = $1 WHERE id = $2', [targetMedId, it.purchaseItemId]);
          }

          // Record Inventory Transaction
          const transId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "InventoryTransaction"
             ("id", "type", "medicineId", "quantity", "previousQuantity", "newQuantity", "purchaseCost", "sellingPrice", "totalPrice", "purchaseDate", "reason", "userId", "userName", "createdAt")
             VALUES ($1, 'ADD', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
            [
              transId,
              targetMedId,
              acceptedQty,
              prevStock,
              newStock,
              unitCost,
              parseFloat((unitCost * 1.25).toFixed(2)),
              parseFloat((acceptedQty * unitCost).toFixed(2)),
              actualReceivedDate,
              `Received from Supplier (PO: ${purchase.purchaseOrderNo})`,
              user?.id || null,
              user?.name || user?.email || 'Storekeeper',
            ]
          );

          // Update or create Batch record if batch number provided
          if (batchNo) {
            const bRes = await client.query('SELECT * FROM "Batch" WHERE "batchNo" = $1', [batchNo]);
            if (bRes.rows.length > 0) {
              const bPrev = parseInt(bRes.rows[0].quantity, 10) || 0;
              await client.query(
                `UPDATE "Batch" SET quantity = $1, "expiryDate" = COALESCE($2, "expiryDate"), "updatedAt" = NOW() WHERE id = $3`,
                [bPrev + acceptedQty, expiry, bRes.rows[0].id]
              );
            } else {
              const batchId = crypto.randomUUID();
              await client.query(
                `INSERT INTO "Batch" ("id", "batchNo", "medicineId", "quantity", "expiryDate", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, COALESCE($5, NOW() + INTERVAL '1 year'), NOW(), NOW())`,
                [batchId, batchNo, targetMedId, acceptedQty, expiry]
              );
            }
          }
        }
      }

      // Determine delivery status
      let newDeliveryStatus = 'RECEIVED';
      if (totalAcceptedQty === 0) {
        newDeliveryStatus = 'ORDERED';
      } else if (totalAcceptedQty < totalOrderedQty) {
        newDeliveryStatus = 'PARTIALLY_RECEIVED';
      }

      await client.query(
        `UPDATE "Purchase"
         SET "status" = $1,
             "receivedDate" = $2,
             "receivingNotes" = $3,
             "updatedAt" = NOW()
         WHERE id = $4`,
        [newDeliveryStatus, actualReceivedDate, receivingNotes || null, purchaseId]
      );

      await client.query('COMMIT');
      return this.getPurchaseById(purchaseId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 3. Record Supplier Payment
   * Track money paid to the supplier with support for full, partial, and unpaid balances.
   */
  async recordPayment(purchaseId, data, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { amount, paymentDate, paymentMethod = 'CASH', notes } = data;
      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        const error = new Error('Payment amount must be greater than 0');
        error.statusCode = 400;
        throw error;
      }

      const pRes = await client.query('SELECT * FROM "Purchase" WHERE id = $1 FOR UPDATE', [purchaseId]);
      if (pRes.rows.length === 0) {
        const error = new Error('Purchase order not found');
        error.statusCode = 404;
        throw error;
      }

      const purchase = pRes.rows[0];
      const totalCost = parseFloat(purchase.totalCost || 0);
      const currentPaid = parseFloat(purchase.amountPaid || 0);

      const newPaid = parseFloat((currentPaid + paymentAmount).toFixed(2));
      const newDue = parseFloat((Math.max(0, totalCost - newPaid)).toFixed(2));

      let paymentStatus = 'PARTIAL';
      if (newDue <= 0.001) {
        paymentStatus = 'PAID';
      } else if (newPaid <= 0) {
        paymentStatus = 'UNPAID';
      }

      // Insert payment log
      const paymentId = crypto.randomUUID();
      const pDate = paymentDate || new Date();
      await client.query(
        `INSERT INTO "PurchasePayment" (
          "id", "purchaseId", "amount", "paymentDate", "paymentMethod", "notes", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [paymentId, purchaseId, paymentAmount, pDate, paymentMethod, notes || null]
      );

      // Update purchase
      await client.query(
        `UPDATE "Purchase"
         SET "amountPaid" = $1,
             "amountDue" = $2,
             "paymentStatus" = $3,
             "updatedAt" = NOW()
         WHERE id = $4`,
        [newPaid, newDue, paymentStatus, purchaseId]
      );

      await client.query('COMMIT');
      return this.getPurchaseById(purchaseId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 4. Return Medicines to Supplier
   * Record returns due to damage, defects, incorrect delivery, and deduct from inventory & finances.
   */
  async returnMedicines(purchaseId, data, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { returnDate, notes, items = [] } = data;
      const actualReturnDate = returnDate || new Date().toISOString().split('T')[0];

      const pRes = await client.query('SELECT * FROM "Purchase" WHERE id = $1 FOR UPDATE', [purchaseId]);
      if (pRes.rows.length === 0) {
        const error = new Error('Purchase order not found');
        error.statusCode = 404;
        throw error;
      }
      const purchase = pRes.rows[0];

      let totalReturnRefund = 0;

      for (const it of items) {
        const returnQty = parseInt(it.returnQuantity, 10);
        if (isNaN(returnQty) || returnQty <= 0) continue;

        // Fetch purchase item
        const piRes = await client.query('SELECT * FROM "PurchaseItem" WHERE id = $1', [it.purchaseItemId]);
        if (piRes.rows.length === 0) continue;
        const pi = piRes.rows[0];

        const receivedQty = parseInt(pi.quantityReceived, 10) || 0;
        if (returnQty > receivedQty) {
          const error = new Error(`Cannot return ${returnQty} units of "${pi.medicineName}". Only ${receivedQty} units were accepted into inventory.`);
          error.statusCode = 400;
          throw error;
        }

        const unitCost = parseFloat(pi.unitCost);
        const itemReturnAmount = parseFloat((returnQty * unitCost).toFixed(2));
        totalReturnRefund += itemReturnAmount;

        // Deduct from Inventory if medicine is known
        if (pi.medicineId) {
          const medRes = await client.query('SELECT * FROM "Medicine" WHERE id = $1 FOR UPDATE', [pi.medicineId]);
          if (medRes.rows.length > 0) {
            const med = medRes.rows[0];
            const currentStock = parseInt(med.quantity, 10) || 0;
            if (currentStock < returnQty) {
              const error = new Error(`Cannot return ${returnQty} units of "${pi.medicineName}". Current inventory has only ${currentStock} units.`);
              error.statusCode = 400;
              throw error;
            }

            const newStock = currentStock - returnQty;
            await client.query('UPDATE "Medicine" SET quantity = $1, "updatedAt" = NOW() WHERE id = $2', [newStock, med.id]);

            // Record negative InventoryTransaction
            const transId = crypto.randomUUID();
            await client.query(
              `INSERT INTO "InventoryTransaction"
               ("id", "type", "medicineId", "quantity", "previousQuantity", "newQuantity", "purchaseCost", "sellingPrice", "totalPrice", "purchaseDate", "reason", "userId", "userName", "createdAt")
               VALUES ($1, 'REDUCE', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
              [
                transId,
                med.id,
                returnQty,
                currentStock,
                newStock,
                unitCost,
                parseFloat(med.sellingPrice || 0),
                itemReturnAmount,
                actualReturnDate,
                `Supplier Return: ${it.returnReason || 'Defect/Damage'} (PO: ${purchase.purchaseOrderNo})`,
                user?.id || null,
                user?.name || user?.email || 'Storekeeper',
              ]
            );

            // Deduct from batch if exists
            if (pi.batchNumber) {
              await client.query(
                `UPDATE "Batch"
                 SET quantity = GREATEST(0, quantity - $1), "updatedAt" = NOW()
                 WHERE "batchNo" = $2 AND "medicineId" = $3`,
                [returnQty, pi.batchNumber, med.id]
              );
            }
          }
        }

        // Insert PurchaseReturn record
        const returnId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "PurchaseReturn" (
            "id", "purchaseId", "purchaseItemId", "medicineId", "medicineName",
            "batchNumber", "returnQuantity", "unitCost", "totalAmount",
            "returnReason", "returnDate", "refundStatus", "notes", "createdAt"
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13, NOW()
          )`,
          [
            returnId,
            purchaseId,
            pi.id,
            pi.medicineId,
            pi.medicineName,
            pi.batchNumber,
            returnQty,
            unitCost,
            itemReturnAmount,
            it.returnReason || 'Damaged / Incorrect delivery',
            actualReturnDate,
            it.refundStatus || 'CREDITED',
            notes || null,
          ]
        );
      }

      // Adjust purchase financials
      const oldTotalCost = parseFloat(purchase.totalCost || 0);
      const oldAmountPaid = parseFloat(purchase.amountPaid || 0);
      const newTotalCost = Math.max(0, parseFloat((oldTotalCost - totalReturnRefund).toFixed(2)));
      const newAmountDue = Math.max(0, parseFloat((newTotalCost - oldAmountPaid).toFixed(2)));

      let paymentStatus = purchase.paymentStatus;
      if (newAmountDue <= 0.001) {
        paymentStatus = 'PAID';
      } else if (oldAmountPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      await client.query(
        `UPDATE "Purchase"
         SET "totalCost" = $1,
             "amountDue" = $2,
             "status" = 'RETURNED',
             "paymentStatus" = $3,
             "updatedAt" = NOW()
         WHERE id = $4`,
        [newTotalCost, newAmountDue, paymentStatus, purchaseId]
      );

      await client.query('COMMIT');
      return this.getPurchaseById(purchaseId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 5. Get Purchase List with Search & Advanced Filters
   */
  async getPurchases({ search = '', supplierId = '', status = '', paymentStatus = '', startDate = '', endDate = '', page = 1, limit = 15 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(`(
        p."purchaseOrderNo" ILIKE $${idx} OR 
        p."invoiceNo" ILIKE $${idx} OR 
        s.name ILIKE $${idx} OR
        p.notes ILIKE $${idx} OR
        EXISTS (
          SELECT 1 FROM "PurchaseItem" pi 
          WHERE pi."purchaseId" = p.id AND pi."medicineName" ILIKE $${idx}
        )
      )`);
    }

    if (supplierId && supplierId.trim()) {
      params.push(supplierId.trim());
      conditions.push(`p."supplierId" = $${params.length}`);
    }

    if (status && status.trim()) {
      params.push(status.trim().toUpperCase());
      conditions.push(`p."status" = $${params.length}`);
    }

    if (paymentStatus && paymentStatus.trim()) {
      params.push(paymentStatus.trim().toUpperCase());
      conditions.push(`p."paymentStatus" = $${params.length}`);
    }

    if (startDate && startDate.trim()) {
      params.push(startDate.trim());
      conditions.push(`p."orderDate" >= $${params.length}::timestamp`);
    }

    if (endDate && endDate.trim()) {
      params.push(`${endDate.trim()} 23:59:59`);
      conditions.push(`p."orderDate" <= $${params.length}::timestamp`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countSql = `
      SELECT COUNT(*)::int as total 
      FROM "Purchase" p
      LEFT JOIN "Supplier" s ON p."supplierId" = s.id
      ${whereClause}
    `;
    const countRes = await db.query(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    // Data query
    const dataSql = `
      SELECT 
        p.id,
        p."purchaseOrderNo",
        p."invoiceNo",
        p."supplierId",
        s.name as "supplierName",
        s.phone as "supplierPhone",
        p."orderDate",
        p."subtotal",
        p."discount",
        p."additionalCharges",
        p."totalCost",
        p."amountPaid",
        p."amountDue",
        p.status,
        p."paymentStatus",
        p."receivedDate",
        p."receivingNotes",
        p.notes,
        p."createdAt",
        p."updatedAt",
        COUNT(pi.id)::int as "itemCount",
        COALESCE(SUM(pi.quantity), 0)::int as "totalQuantityOrdered",
        COALESCE(SUM(pi."quantityReceived"), 0)::int as "totalQuantityReceived",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pi.id,
              'purchaseId', pi."purchaseId",
              'medicineId', pi."medicineId",
              'medicineName', pi."medicineName",
              'quantity', pi.quantity,
              'quantityReceived', pi."quantityReceived",
              'quantityRejected', pi."quantityRejected",
              'unitCost', pi."unitCost",
              'totalCost', pi."totalCost",
              'batchNumber', pi."batchNumber",
              'expiryDate', pi."expiryDate",
              'rejectionReason', pi."rejectionReason"
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM "Purchase" p
      LEFT JOIN "Supplier" s ON p."supplierId" = s.id
      LEFT JOIN "PurchaseItem" pi ON p.id = pi."purchaseId"
      ${whereClause}
      GROUP BY p.id, s.id
      ORDER BY p."orderDate" DESC, p."createdAt" DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataRes = await db.query(dataSql, [...params, limitNum, offset]);

    return {
      purchases: dataRes.rows.map((row) => ({
        ...row,
        subtotal: parseFloat(row.subtotal || 0),
        discount: parseFloat(row.discount || 0),
        additionalCharges: parseFloat(row.additionalCharges || 0),
        totalCost: parseFloat(row.totalCost || 0),
        amountPaid: parseFloat(row.amountPaid || 0),
        amountDue: parseFloat(row.amountDue || 0),
        itemCount: parseInt(row.itemCount, 10) || 0,
        totalQuantityOrdered: parseInt(row.totalQuantityOrdered, 10) || 0,
        totalQuantityReceived: parseInt(row.totalQuantityReceived, 10) || 0,
        items: (row.items || []).map((it) => ({
          ...it,
          quantity: parseInt(it.quantity, 10) || 0,
          quantityReceived: parseInt(it.quantityReceived, 10) || 0,
          quantityRejected: parseInt(it.quantityRejected, 10) || 0,
          unitCost: parseFloat(it.unitCost || 0),
          totalCost: parseFloat(it.totalCost || 0),
        })),
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * 6. Get Single Purchase Details with Items, Payments, and Returns
   */
  async getPurchaseById(id) {
    const pSql = `
      SELECT 
        p.*,
        s.name as "supplierName",
        s."contactPerson" as "supplierContactPerson",
        s.phone as "supplierPhone",
        s.email as "supplierEmail",
        s.address as "supplierAddress"
      FROM "Purchase" p
      LEFT JOIN "Supplier" s ON p."supplierId" = s.id
      WHERE p.id = $1
    `;
    const pRes = await db.query(pSql, [id]);
    if (pRes.rows.length === 0) {
      const error = new Error('Purchase order not found');
      error.statusCode = 404;
      throw error;
    }
    const purchase = pRes.rows[0];

    // Items
    const itemsRes = await db.query(
      `SELECT * FROM "PurchaseItem" WHERE "purchaseId" = $1 ORDER BY "medicineName" ASC`,
      [id]
    );

    // Payments
    const paymentsRes = await db.query(
      `SELECT * FROM "PurchasePayment" WHERE "purchaseId" = $1 ORDER BY "paymentDate" DESC, "createdAt" DESC`,
      [id]
    );

    // Returns
    const returnsRes = await db.query(
      `SELECT * FROM "PurchaseReturn" WHERE "purchaseId" = $1 ORDER BY "returnDate" DESC, "createdAt" DESC`,
      [id]
    );

    return {
      ...purchase,
      subtotal: parseFloat(purchase.subtotal || 0),
      discount: parseFloat(purchase.discount || 0),
      additionalCharges: parseFloat(purchase.additionalCharges || 0),
      totalCost: parseFloat(purchase.totalCost || 0),
      amountPaid: parseFloat(purchase.amountPaid || 0),
      amountDue: parseFloat(purchase.amountDue || 0),
      items: itemsRes.rows.map((it) => ({
        ...it,
        quantity: parseInt(it.quantity, 10) || 0,
        quantityReceived: parseInt(it.quantityReceived, 10) || 0,
        quantityRejected: parseInt(it.quantityRejected, 10) || 0,
        unitCost: parseFloat(it.unitCost || 0),
        totalCost: parseFloat(it.totalCost || 0),
      })),
      payments: paymentsRes.rows.map((pm) => ({
        ...pm,
        amount: parseFloat(pm.amount || 0),
      })),
      returns: returnsRes.rows.map((rt) => ({
        ...rt,
        returnQuantity: parseInt(rt.returnQuantity, 10) || 0,
        unitCost: parseFloat(rt.unitCost || 0),
        totalAmount: parseFloat(rt.totalAmount || 0),
      })),
    };
  }

  /**
   * 7. Purchase Summary and Reports
   * Computes today, monthly, yearly stats, supplier spend breakdown, and top purchased medicines.
   */
  async getPurchasesSummary() {
    // 1. Time-based totals & cash obligations
    const statsSql = `
      SELECT 
        COUNT(*)::int as "totalPurchasesCount",
        COALESCE(SUM("totalCost"), 0)::numeric as "totalPurchasesCost",
        COALESCE(SUM("amountPaid"), 0)::numeric as "totalAmountPaid",
        COALESCE(SUM("amountDue"), 0)::numeric as "totalOutstandingBalance",

        -- Today
        COALESCE(SUM(CASE WHEN DATE("orderDate") = CURRENT_DATE THEN "totalCost" ELSE 0 END), 0)::numeric as "purchasesTodayAmount",
        COUNT(CASE WHEN DATE("orderDate") = CURRENT_DATE THEN 1 END)::int as "purchasesTodayCount",

        -- This Month
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', "orderDate") = DATE_TRUNC('month', CURRENT_DATE) THEN "totalCost" ELSE 0 END), 0)::numeric as "purchasesThisMonthAmount",
        COUNT(CASE WHEN DATE_TRUNC('month', "orderDate") = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as "purchasesThisMonthCount",

        -- This Year
        COALESCE(SUM(CASE WHEN DATE_TRUNC('year', "orderDate") = DATE_TRUNC('year', CURRENT_DATE) THEN "totalCost" ELSE 0 END), 0)::numeric as "purchasesThisYearAmount",
        COUNT(CASE WHEN DATE_TRUNC('year', "orderDate") = DATE_TRUNC('year', CURRENT_DATE) THEN 1 END)::int as "purchasesThisYearCount"
      FROM "Purchase";
    `;
    const statsRes = await db.query(statsSql);
    const stats = statsRes.rows[0] || {};

    // 2. Spending by supplier
    const supplierSpendSql = `
      SELECT 
        s.id as "supplierId",
        s.name as "supplierName",
        s.phone as "supplierPhone",
        COUNT(p.id)::int as "orderCount",
        COALESCE(SUM(p."totalCost"), 0)::numeric as "totalSpent",
        COALESCE(SUM(p."amountPaid"), 0)::numeric as "totalPaid",
        COALESCE(SUM(p."amountDue"), 0)::numeric as "outstandingBalance",
        MAX(p."orderDate") as "lastOrderDate"
      FROM "Supplier" s
      INNER JOIN "Purchase" p ON s.id = p."supplierId"
      GROUP BY s.id
      ORDER BY "totalSpent" DESC
      LIMIT 10;
    `;
    const supplierSpendRes = await db.query(supplierSpendSql);

    // 3. Most frequently purchased medicines
    const topMedicinesSql = `
      SELECT 
        pi."medicineName",
        COUNT(DISTINCT pi."purchaseId")::int as "purchaseCount",
        COALESCE(SUM(pi.quantity), 0)::int as "totalUnitsPurchased",
        COALESCE(SUM(pi."totalCost"), 0)::numeric as "totalSpend",
        COALESCE(AVG(pi."unitCost"), 0)::numeric as "averageUnitCost"
      FROM "PurchaseItem" pi
      GROUP BY pi."medicineName"
      ORDER BY "totalUnitsPurchased" DESC, "totalSpend" DESC
      LIMIT 10;
    `;
    const topMedicinesRes = await db.query(topMedicinesSql);

    return {
      overview: {
        totalPurchasesCount: parseInt(stats.totalPurchasesCount, 10) || 0,
        totalPurchasesCost: parseFloat(stats.totalPurchasesCost || 0),
        totalAmountPaid: parseFloat(stats.totalAmountPaid || 0),
        totalOutstandingBalance: parseFloat(stats.totalOutstandingBalance || 0),
        purchasesTodayAmount: parseFloat(stats.purchasesTodayAmount || 0),
        purchasesTodayCount: parseInt(stats.purchasesTodayCount, 10) || 0,
        purchasesThisMonthAmount: parseFloat(stats.purchasesThisMonthAmount || 0),
        purchasesThisMonthCount: parseInt(stats.purchasesThisMonthCount, 10) || 0,
        purchasesThisYearAmount: parseFloat(stats.purchasesThisYearAmount || 0),
        purchasesThisYearCount: parseInt(stats.purchasesThisYearCount, 10) || 0,
      },
      spendingBySupplier: supplierSpendRes.rows.map((r) => ({
        ...r,
        orderCount: parseInt(r.orderCount, 10) || 0,
        totalSpent: parseFloat(r.totalSpent || 0),
        totalPaid: parseFloat(r.totalPaid || 0),
        outstandingBalance: parseFloat(r.outstandingBalance || 0),
      })),
      mostPurchasedMedicines: topMedicinesRes.rows.map((r) => ({
        ...r,
        purchaseCount: parseInt(r.purchaseCount, 10) || 0,
        totalUnitsPurchased: parseInt(r.totalUnitsPurchased, 10) || 0,
        totalSpend: parseFloat(r.totalSpend || 0),
        averageUnitCost: parseFloat(r.averageUnitCost || 0),
      })),
    };
  }

  /**
   * 8. Delete Purchase
   */
  async deletePurchase(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const pRes = await client.query('SELECT * FROM "Purchase" WHERE id = $1', [id]);
      if (pRes.rows.length === 0) {
        const error = new Error('Purchase order not found');
        error.statusCode = 404;
        throw error;
      }

      await client.query('DELETE FROM "Purchase" WHERE id = $1', [id]);
      await client.query('COMMIT');
      return { success: true, message: 'Purchase deleted successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export const purchasesService = new PurchasesService();
