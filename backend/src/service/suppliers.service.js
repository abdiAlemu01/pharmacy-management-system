import { db } from '../database/client.js';
import crypto from 'crypto';

export class SuppliersService {
  /**
   * 1. Get all suppliers with search, filter, pagination, and purchase metrics
   */
  async getSuppliers({ search = '', status = '', page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(`(
        s.name ILIKE $${idx} OR 
        s."contactPerson" ILIKE $${idx} OR 
        s.phone ILIKE $${idx} OR 
        s."stockSupplied" ILIKE $${idx} OR 
        s.address ILIKE $${idx} OR
        s.email ILIKE $${idx}
      )`);
    }

    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total filtered count
    const countQuery = `SELECT COUNT(*)::int as total FROM "Supplier" s ${whereClause};`;
    const countRes = await db.query(countQuery, params);
    const total = countRes.rows[0]?.total || 0;

    // Fetch suppliers with aggregated purchase statistics
    const query = `
      SELECT 
        s.id,
        s.name,
        s."contactPerson",
        s.phone,
        s.email,
        s.address,
        s."stockSupplied",
        s.status,
        s."taxNumber",
        s."paymentTerms",
        s.notes,
        s."createdAt",
        s."updatedAt",
        COUNT(p.id)::int as "totalPurchases",
        COALESCE(SUM(p."totalCost"), 0)::numeric as "totalSpend",
        MAX(p."createdAt") as "lastPurchaseDate"
      FROM "Supplier" s
      LEFT JOIN "Purchase" p ON s.id = p."supplierId"
      ${whereClause}
      GROUP BY s.id
      ORDER BY s."updatedAt" DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    const result = await db.query(query, [...params, limitNum, offset]);

    // Overall summary metrics across all suppliers
    const summaryRes = await db.query(`
      SELECT 
        COUNT(*)::int as "totalSuppliers",
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::int as "activeSuppliers",
        COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END)::int as "inactiveSuppliers",
        COALESCE((SELECT COUNT(*)::int FROM "Purchase"), 0) as "totalPurchasesCount",
        COALESCE((SELECT SUM("totalCost")::numeric FROM "Purchase"), 0) as "totalPurchasesAmount"
      FROM "Supplier";
    `);

    const summaryRow = summaryRes.rows[0] || {};

    return {
      suppliers: result.rows.map((r) => ({
        ...r,
        totalPurchases: parseInt(r.totalPurchases, 10) || 0,
        totalSpend: parseFloat(r.totalSpend || 0),
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      summary: {
        totalSuppliers: parseInt(summaryRow.totalSuppliers, 10) || 0,
        activeSuppliers: parseInt(summaryRow.activeSuppliers, 10) || 0,
        inactiveSuppliers: parseInt(summaryRow.inactiveSuppliers, 10) || 0,
        totalPurchasesCount: parseInt(summaryRow.totalPurchasesCount, 10) || 0,
        totalPurchasesAmount: parseFloat(summaryRow.totalPurchasesAmount || 0),
      },
    };
  }

  /**
   * 2. Get single supplier details by ID with stats and recent purchase orders
   */
  async getSupplierById(id) {
    const res = await db.query(
      `
      SELECT 
        s.*,
        COUNT(p.id)::int as "totalPurchases",
        COALESCE(SUM(p."totalCost"), 0)::numeric as "totalSpend",
        MAX(p."createdAt") as "lastPurchaseDate"
      FROM "Supplier" s
      LEFT JOIN "Purchase" p ON s.id = p."supplierId"
      WHERE s.id = $1
      GROUP BY s.id;
    `,
      [id]
    );

    if (res.rows.length === 0) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const supplier = res.rows[0];

    // Fetch up to 5 recent purchases
    const recentPurchasesRes = await db.query(
      `
      SELECT 
        p.id,
        p."purchaseOrderNo",
        p."invoiceNo",
        p."totalCost"::numeric as "totalCost",
        COALESCE(p."amountPaid", CASE WHEN p."paymentStatus" = 'PAID' THEN p."totalCost" ELSE 0 END)::numeric as "amountPaid",
        COALESCE(p."amountDue", CASE WHEN p."paymentStatus" = 'PAID' THEN 0 ELSE p."totalCost" END)::numeric as "amountDue",
        p.status,
        p."paymentStatus",
        p.notes,
        p."createdAt",
        COUNT(pi.id)::int as "itemCount"
      FROM "Purchase" p
      LEFT JOIN "PurchaseItem" pi ON p.id = pi."purchaseId"
      WHERE p."supplierId" = $1
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
      LIMIT 5;
    `,
      [id]
    );

    return {
      ...supplier,
      totalPurchases: parseInt(supplier.totalPurchases, 10) || 0,
      totalSpend: parseFloat(supplier.totalSpend || 0),
      recentPurchases: recentPurchasesRes.rows.map((p) => ({
        ...p,
        totalCost: parseFloat(p.totalCost || 0),
        amountPaid: parseFloat(p.amountPaid || 0),
        amountDue: parseFloat(p.amountDue || 0),
        itemCount: parseInt(p.itemCount, 10) || 0,
      })),
    };
  }

  /**
   * 3. Register a new Supplier
   */
  async createSupplier(data) {
    const id = crypto.randomUUID();
    const {
      name,
      contactPerson = null,
      phone,
      email = null,
      address = null,
      stockSupplied,
      status = 'ACTIVE',
      taxNumber = null,
      paymentTerms = 'Net 30 Days',
      notes = null,
    } = data;

    const query = `
      INSERT INTO "Supplier" (
        "id", "name", "contactPerson", "phone", "email", 
        "address", "stockSupplied", "status", "taxNumber", 
        "paymentTerms", "notes", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const res = await db.query(query, [
      id,
      name.trim(),
      contactPerson ? contactPerson.trim() : null,
      phone.trim(),
      email && email.trim() ? email.trim() : null,
      address ? address.trim() : null,
      stockSupplied ? stockSupplied.trim() : null,
      status || 'ACTIVE',
      taxNumber ? taxNumber.trim() : null,
      paymentTerms ? paymentTerms.trim() : 'Net 30 Days',
      notes ? notes.trim() : null,
    ]);

    return res.rows[0];
  }

  /**
   * 4. Update an existing supplier
   */
  async updateSupplier(id, data) {
    // Check if supplier exists
    const check = await db.query(`SELECT id FROM "Supplier" WHERE id = $1;`, [id]);
    if (check.rows.length === 0) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const fields = [];
    const values = [];

    const allowedFields = [
      'name',
      'contactPerson',
      'phone',
      'email',
      'address',
      'stockSupplied',
      'status',
      'taxNumber',
      'paymentTerms',
      'notes',
    ];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        values.push(data[key]);
        fields.push(`"${key}" = $${values.length}`);
      }
    }

    if (fields.length === 0) {
      return this.getSupplierById(id);
    }

    values.push(id);
    const query = `
      UPDATE "Supplier"
      SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *;
    `;

    const res = await db.query(query, values);
    return res.rows[0];
  }

  /**
   * 5. Delete a supplier (or soft-delete if purchases exist)
   */
  async deleteSupplier(id) {
    const check = await db.query(`SELECT id FROM "Supplier" WHERE id = $1;`, [id]);
    if (check.rows.length === 0) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    // Check if purchases exist
    const pCheck = await db.query(`SELECT COUNT(*)::int as count FROM "Purchase" WHERE "supplierId" = $1;`, [id]);
    const purchaseCount = pCheck.rows[0]?.count || 0;

    if (purchaseCount > 0) {
      // Soft-delete to preserve accounting and inventory history
      await db.query(`UPDATE "Supplier" SET status = 'INACTIVE', "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1;`, [id]);
      return {
        message: 'Supplier has existing purchase records. Status was set to Inactive to preserve financial audit history.',
        softDeleted: true,
      };
    }

    await db.query(`DELETE FROM "Supplier" WHERE id = $1;`, [id]);
    return {
      message: 'Supplier deleted successfully.',
      softDeleted: false,
    };
  }

  /**
   * 6. Get complete purchase history for a specific supplier
   * Returns PO details, invoice number, status, total cost, and item breakdowns
   */
  async getSupplierPurchaseHistory(supplierId) {
    const sCheck = await db.query(
      `SELECT id, name, "contactPerson", phone, email, "stockSupplied", status FROM "Supplier" WHERE id = $1;`,
      [supplierId]
    );

    if (sCheck.rows.length === 0) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const supplier = sCheck.rows[0];

    // Fetch all purchases
    const purchasesRes = await db.query(
      `
      SELECT 
        p.id,
        p."purchaseOrderNo",
        p."invoiceNo",
        p."totalCost"::numeric as "totalCost",
        COALESCE(p."amountPaid", CASE WHEN p."paymentStatus" = 'PAID' THEN p."totalCost" ELSE 0 END)::numeric as "amountPaid",
        COALESCE(p."amountDue", CASE WHEN p."paymentStatus" = 'PAID' THEN 0 ELSE p."totalCost" END)::numeric as "amountDue",
        p.status,
        p."paymentStatus",
        p.notes,
        p."createdAt",
        p."updatedAt"
      FROM "Purchase" p
      WHERE p."supplierId" = $1
      ORDER BY p."createdAt" DESC;
    `,
      [supplierId]
    );

    const purchaseIds = purchasesRes.rows.map((p) => p.id);
    let itemsMap = {};

    if (purchaseIds.length > 0) {
      const itemsRes = await db.query(
        `
        SELECT 
          pi.id,
          pi."purchaseId",
          pi."medicineName",
          pi."batchNumber",
          pi.quantity,
          pi."unitCost"::numeric as "unitCost",
          pi."totalCost"::numeric as "totalCost",
          pi."expiryDate"
        FROM "PurchaseItem" pi
        WHERE pi."purchaseId" = ANY($1)
        ORDER BY pi."medicineName" ASC;
      `,
        [purchaseIds]
      );

      for (const item of itemsRes.rows) {
        if (!itemsMap[item.purchaseId]) {
          itemsMap[item.purchaseId] = [];
        }
        itemsMap[item.purchaseId].push({
          ...item,
          unitCost: parseFloat(item.unitCost || 0),
          totalCost: parseFloat(item.totalCost || 0),
        });
      }
    }

    const purchases = purchasesRes.rows.map((p) => ({
      ...p,
      totalCost: parseFloat(p.totalCost || 0),
      amountPaid: parseFloat(p.amountPaid || 0),
      amountDue: parseFloat(p.amountDue || 0),
      items: itemsMap[p.id] || [],
    }));

    const totalOrders = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaid = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDue = purchases.reduce((sum, p) => sum + p.amountDue, 0);
    const totalItemsPurchased = purchases.reduce(
      (sum, p) => sum + p.items.reduce((iSum, i) => iSum + (i.quantity || 0), 0),
      0
    );

    return {
      supplier,
      purchases,
      summary: {
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalDue: parseFloat(totalDue.toFixed(2)),
        totalItemsPurchased,
        lastPurchaseDate: purchases[0]?.createdAt || null,
      },
    };
  }

  /**
   * 7. Record a new purchase from a supplier (Add to purchase history & stock)
   */
  async createSupplierPurchase(supplierId, purchaseData) {
    const sCheck = await db.query(`SELECT id, name FROM "Supplier" WHERE id = $1;`, [supplierId]);
    if (sCheck.rows.length === 0) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const purchaseId = crypto.randomUUID();
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    const invoiceNo = purchaseData.invoiceNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = purchaseData.items || [];
    const notes = purchaseData.notes || null;
    const paymentStatus = purchaseData.paymentStatus || 'PAID';

    // Calculate total cost from items
    const calculatedTotal = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
    const totalCost = purchaseData.totalCost !== undefined ? parseFloat(purchaseData.totalCost) : calculatedTotal;

    // Calculate amountPaid and amountDue
    let amountPaid = 0;
    let amountDue = 0;
    if (paymentStatus === 'PAID') {
      amountPaid = totalCost;
      amountDue = 0;
    } else if (paymentStatus === 'PENDING') {
      amountPaid = 0;
      amountDue = totalCost;
    } else if (paymentStatus === 'PARTIAL') {
      amountPaid = parseFloat(purchaseData.amountPaid || 0);
      if (amountPaid > totalCost) amountPaid = totalCost;
      amountDue = Math.max(0, parseFloat((totalCost - amountPaid).toFixed(2)));
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert Purchase
      await client.query(
        `
        INSERT INTO "Purchase" (
          "id", "purchaseOrderNo", "invoiceNo", "supplierId", 
          "totalCost", "amountPaid", "amountDue", "status", "paymentStatus", "notes", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'RECEIVED', $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `,
        [purchaseId, poNumber, invoiceNo, supplierId, totalCost, amountPaid, amountDue, paymentStatus, notes]
      );

      // 2. Insert PurchaseItems
      for (const item of items) {
        const itemId = crypto.randomUUID();
        const itemTotal = parseFloat((item.quantity * item.unitCost).toFixed(2));
        await client.query(
          `
          INSERT INTO "PurchaseItem" (
            "id", "purchaseId", "medicineId", "medicineName", 
            "batchNumber", "quantity", "unitCost", "totalCost", "expiryDate"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `,
          [
            itemId,
            purchaseId,
            item.medicineId || null,
            item.medicineName,
            item.batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
            item.quantity,
            item.unitCost,
            itemTotal,
            item.expiryDate ? new Date(item.expiryDate) : null,
          ]
        );
      }

      await client.query('COMMIT');

      return this.getSupplierPurchaseHistory(supplierId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 8. Delete a purchase record from supplier history
   */
  async deleteSupplierPurchase(supplierId, purchaseId) {
    const pCheck = await db.query(
      `SELECT id, "purchaseOrderNo" FROM "Purchase" WHERE id = $1 AND "supplierId" = $2;`,
      [purchaseId, supplierId]
    );

    if (pCheck.rows.length === 0) {
      const err = new Error('Purchase record not found for this supplier');
      err.statusCode = 404;
      throw err;
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      // Delete child line items
      await client.query(`DELETE FROM "PurchaseItem" WHERE "purchaseId" = $1;`, [purchaseId]);
      // Delete purchase record
      await client.query(`DELETE FROM "Purchase" WHERE id = $1;`, [purchaseId]);
      await client.query('COMMIT');

      return {
        success: true,
        message: 'Purchase record deleted successfully',
        id: purchaseId,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export const suppliersService = new SuppliersService();
