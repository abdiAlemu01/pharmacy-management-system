import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const POSTerminal = ({ medicines = [], isLoading = false, onCheckout, isCheckingOut = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]); // [{ medicine, quantity }]

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  // Filter medicines by search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return medicines;
    const term = searchTerm.toLowerCase().trim();
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.barcode && m.barcode.toLowerCase().includes(term))
    );
  }, [medicines, searchTerm]);

  // Cart operations
  const addToCart = (medicine) => {
    if (medicine.quantity <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.quantity) return prevCart; // cannot exceed stock
        return prevCart.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (medicineId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.medicine.id === medicineId) {
          const maxStock = item.medicine.quantity;
          const clampedQty = Math.min(qty, maxStock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((prevCart) => prevCart.filter((item) => item.medicine.id !== medicineId));
  };

  const clearCart = () => setCart([]);

  // Live Cart Calculations
  const cartTotals = useMemo(() => {
    let totalSell = 0;
    let totalCost = 0;
    let totalUnits = 0;

    cart.forEach((item) => {
      const sell = item.quantity * item.medicine.sellingPrice;
      const cost = item.quantity * item.medicine.purchaseCost;
      totalSell += sell;
      totalCost += cost;
      totalUnits += item.quantity;
    });

    const totalProfit = totalSell - totalCost;
    const profitMargin = totalSell > 0 ? ((totalProfit / totalSell) * 100).toFixed(1) : '0.0';

    return {
      totalSell: parseFloat(totalSell.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalUnits,
      profitMargin,
    };
  }, [cart]);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    const payload = {
      items: cart.map((i) => ({
        medicineId: i.medicine.id,
        quantity: i.quantity,
        unitPrice: i.medicine.sellingPrice,
      })),
    };
    onCheckout(payload, () => {
      // callback on success to clear cart
      clearCart();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
      {/* Left Column: Search & Medicine Selection (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine by name or barcode for POS sale..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
            {filteredMedicines.length} in stock
          </span>
        </div>

        {/* Medicine Items List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Available Medicines Catalog
            </h4>
            <span className="text-[11px] text-slate-400">Click &quot;Add&quot; to put into POS cart</span>
          </div>

          <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Loading medicines for POS...
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-300 mb-2" />
                <p className="font-semibold text-slate-700">No medicines found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try another search query or check inventory stock.
                </p>
              </div>
            ) : (
              filteredMedicines.map((med) => {
                const inCart = cart.find((i) => i.medicine.id === med.id);
                const isOutOfStock = med.quantity <= 0;
                const isLowStock = med.quantity > 0 && med.quantity <= 10;

                return (
                  <div
                    key={med.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Low: {med.quantity} left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Stock: {med.quantity}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          Purchase: <strong className="text-slate-700">{formatBirr(med.purchaseCost)}</strong>
                        </span>
                        <span>
                          Selling: <strong className="text-slate-900 font-bold">{formatBirr(med.sellingPrice)}</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          Profit: +{formatBirr(med.profitPerUnit)} / unit
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {inCart && (
                        <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                          {inCart.quantity} in cart
                        </span>
                      )}
                      <Button
                        type="button"
                        variant={isOutOfStock ? 'outline' : 'primary'}
                        disabled={isOutOfStock || (inCart && inCart.quantity >= med.quantity)}
                        onClick={() => addToCart(med)}
                        className="text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: POS Cart & Checkout Terminal (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">POS Checkout Cart</h3>
              <p className="text-[11px] text-slate-300">
                {cart.length} unique items ({cartTotals.totalUnits} units)
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-300 hover:text-rose-100 font-semibold cursor-pointer underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 max-h-[380px] overflow-y-auto space-y-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600 text-sm">Cart is empty</p>
              <p className="mt-1">Add medicines from the catalog on the left to start checkout.</p>
            </div>
          ) : (
            cart.map((item) => {
              const med = item.medicine;
              const itemTotal = item.quantity * med.sellingPrice;
              const itemProfit = item.quantity * (med.sellingPrice - med.purchaseCost);

              return (
                <div key={med.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5 space-x-2">
                        <span>Unit Sell: {formatBirr(med.sellingPrice)}</span>
                        <span>•</span>
                        <span>Unit Cost: {formatBirr(med.purchaseCost)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(med.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Item Total */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(med.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={med.quantity}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(med.id, e.target.value)}
                        className="w-14 text-center py-1 text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={() => updateQuantity(med.id, item.quantity + 1)}
                        disabled={item.quantity >= med.quantity}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400">/ {med.quantity} in stock</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatBirr(itemTotal)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        Profit: +{formatBirr(itemProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Totals & Checkout Button */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Total Inventory Purchase Cost:</span>
              <span className="font-semibold text-slate-800">{formatBirr(cartTotals.totalCost)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Expected Profit on this Sale ({cartTotals.profitMargin}%):</span>
              <span>+{formatBirr(cartTotals.totalProfit)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-extrabold text-slate-800 uppercase">
              Total Sale Amount:
            </span>
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatBirr(cartTotals.totalSell)}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleCompleteSale}
            className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            {isCheckingOut ? 'Processing POS Sale...' : `Complete Sale (${formatBirr(cartTotals.totalSell)})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

