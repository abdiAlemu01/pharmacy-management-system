import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, AlertTriangle, X, Package, Calculator, ArrowRight } from 'lucide-react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';

export const POSTerminal = ({ medicines = [], isLoading = false, onCheckout, isCheckingOut = false }) => {
  const [cart, setCart] = useState([]); // [{ medicine, quantity }]

  // Single modal for selecting stock by scrolling
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [selectedStockMed, setSelectedStockMed] = useState(null);
  const [addQuantity, setAddQuantity] = useState(1);

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  // Filter medicines inside the scrollable stock selector modal
  const filteredStock = useMemo(() => {
    if (!stockSearch.trim()) return medicines;
    const term = stockSearch.toLowerCase().trim();
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.barcode && m.barcode.toLowerCase().includes(term))
    );
  }, [medicines, stockSearch]);

  // Open the single modal and preselect the first available in-stock medicine
  const handleOpenSelectModal = () => {
    setStockSearch('');
    const firstInStock = medicines.find((m) => m.quantity > 0) || medicines[0] || null;
    setSelectedStockMed(firstInStock);
    setAddQuantity(1);
    setIsSelectModalOpen(true);
  };

  // Add selected medicine with chosen quantity to cart
  const handleConfirmAddStock = () => {
    if (!selectedStockMed || selectedStockMed.quantity <= 0) return;

    const qtyToAdd = Math.max(1, Math.min(parseInt(addQuantity, 10) || 1, selectedStockMed.quantity));

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.medicine.id === selectedStockMed.id);
      if (existing) {
        const newTotalQty = Math.min(existing.quantity + qtyToAdd, selectedStockMed.quantity);
        return prevCart.map((item) =>
          item.medicine.id === selectedStockMed.id
            ? { ...item, quantity: newTotalQty }
            : item
        );
      }
      return [...prevCart, { medicine: selectedStockMed, quantity: qtyToAdd }];
    });

    setIsSelectModalOpen(false);
    setSelectedStockMed(null);
    setAddQuantity(1);
  };

  const updateQuantity = (medicineId, newQty) => {
    // If the input is temporarily cleared, allow empty string so user can type a new number
    if (newQty === '') {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.medicine.id === medicineId ? { ...item, quantity: '' } : item
        )
      );
      return;
    }

    const qty = parseInt(newQty, 10);
    if (isNaN(qty)) return;

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.medicine.id === medicineId) {
          const maxStock = item.medicine.quantity;
          // Clamp quantity between 1 and maxStock (Never delete the item on number edit!)
          const clampedQty = Math.max(1, Math.min(qty, maxStock));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const handleQuantityBlur = (medicineId, currentQty) => {
    const qty = parseInt(currentQty, 10);
    if (isNaN(qty) || qty < 1) {
      updateQuantity(medicineId, 1);
    }
  };

  const removeFromCart = (medicineId) => {
    setCart((prevCart) => prevCart.filter((item) => item.medicine.id !== medicineId));
  };

  const clearCart = () => setCart([]);

  // Live Cart Totals Calculations
  const cartTotals = useMemo(() => {
    let totalSell = 0;
    let totalCost = 0;
    let totalUnits = 0;

    cart.forEach((item) => {
      const q = parseInt(item.quantity, 10) || 0;
      const sell = q * item.medicine.sellingPrice;
      const cost = q * item.medicine.purchaseCost;
      totalSell += sell;
      totalCost += cost;
      totalUnits += q;
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
        quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
        unitPrice: i.medicine.sellingPrice,
      })),
    };
    onCheckout(payload, () => {
      clearCart();
    });
  };

  // Dynamic preview for the selected medicine inside the modal
  const selectedUnitCost = selectedStockMed ? parseFloat(selectedStockMed.purchaseCost || 0) : 0;
  const selectedUnitSell = selectedStockMed ? parseFloat(selectedStockMed.sellingPrice || 0) : 0;
  const safeQty = selectedStockMed
    ? Math.max(1, Math.min(parseInt(addQuantity, 10) || 1, selectedStockMed.quantity))
    : 1;
  const previewTotalSell = (safeQty * selectedUnitSell).toFixed(2);
  const previewTotalProfit = (safeQty * (selectedUnitSell - selectedUnitCost)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top POS Action Bar with Single Add Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Point of Sale (POS) Workstation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {cart.length === 0
                  ? ''
                  : ``}
              </p>
            </div>
          </div>
        </div>

        {/* Single Add Button & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          )}

          {/* THE ONLY ONE ADD BUTTON */}
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenSelectModal}
            className="flex items-center gap-2 text-sm py-2.5 px-5 shadow-sm"
          >
            <span>Sell Medicine from Stock</span>
          </Button>
        </div>
      </div>

      {/* Main POS Cart Table & Financial Summary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Sale Items Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                Items in Current Sale
              </h4>
            </div>
            
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Medicine Name</th>
                  <th className="px-3 py-3.5 text-center">Available Stock</th>
                  <th className="px-3 py-3.5 text-right">Unit Cost</th>
                  <th className="px-3 py-3.5 text-right">Unit Price</th>
                  <th className="px-4 py-3.5 text-center">Quantity to Sell</th>
                  <th className="px-3 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Package className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-slate-700 text-base">Your POS cart is empty</p>
                     
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleOpenSelectModal}
                          className="text-xs py-2 px-4 inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-emerald-600" />
                          <span>Select Stock Item</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => {
                    const med = item.medicine;

                    return (
                      <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 block text-sm">{med.name}</span>
                          <span className="text-[11px] text-slate-400">ID: {med.id.slice(0, 8)}...</span>
                        </td>

                        <td className="px-4 py-6 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {med.quantity} 
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                          {formatBirr(med.purchaseCost)}
                        </td>

                        <td className="px-3 py-4 text-right font-medium text-slate-800 whitespace-nowrap">
                          {formatBirr(med.sellingPrice)}
                        </td>

                        {/* Interactive Quantity Stepper */}
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => updateQuantity(med.id, Math.max(1, (parseInt(item.quantity, 10) || 1) - 1))}
                              disabled={(parseInt(item.quantity, 10) || 1) <= 1}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={med.quantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(med.id, e.target.value)}
                              onBlur={(e) => handleQuantityBlur(med.id, e.target.value)}
                              className="w-12 text-center text-sm font-black bg-transparent focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => updateQuantity(med.id, (parseInt(item.quantity, 10) || 1) + 1)}
                              disabled={(parseInt(item.quantity, 10) || 1) >= med.quantity}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeFromCart(med.id)}
                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                            title="Delete item from cart"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Financial Summary & Checkout Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              Sale Financial Summary
            </h4>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>Total Units to Dispense</span>
              <span className="font-bold text-slate-900 text-sm">{cartTotals.totalUnits} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Stock purchase Cost</span>
              <span className="font-semibold text-slate-800">{formatBirr(cartTotals.totalCost)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="font-bold">Estimated Profit </span>
              <span className="font-black text-sm">{formatBirr(cartTotals.totalProfit)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Grand Total Sale
            </span>
            <div className="text-3xl font-black text-emerald-700 tracking-tight mt-1">
              {formatBirr(cartTotals.totalSell)}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleCompleteSale}
            className="w-full py-3.5 text-base font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isCheckingOut ? 'Processing Checkout...' : `Confirm Sale (${formatBirr(cartTotals.totalSell)})`}</span>
          </Button>
        </div>
      </div>

      {/* SINGLE MODAL: Scrollable Stock Selector Dialog */}
      <Dialog
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Select Medicine from Stock"
      >
        <div className="space-y-4 text-xs">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              placeholder="Filter stock by medicine name or barcode..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {stockSearch && (
              <button
                type="button"
                onClick={() => setStockSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scrollable Stock List */}
          <div className="border border-slate-200 rounded-xl max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading stock medicines...</div>
            ) : filteredStock.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <AlertTriangle className="w-6 h-6 mx-auto text-amber-400 mb-1" />
                <p className="font-semibold text-slate-700">No stock found</p>
              </div>
            ) : (
              filteredStock.map((med) => {
                const isSelected = selectedStockMed?.id === med.id;
                const isOutOfStock = med.quantity <= 0;
                const inCart = cart.find((i) => i.medicine.id === med.id);

                return (
                  <div
                    key={med.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        setSelectedStockMed(med);
                        setAddQuantity(1);
                      }
                    }}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                        : isOutOfStock
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                        {isOutOfStock ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Out of Stock
                          </span>
                        ) : med.quantity <= 10 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Low Stock: {med.quantity} left
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Stock: {med.quantity}
                          </span>
                        )}
                        {inCart && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            ({inCart.quantity} in cart)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Sell: <strong className="text-slate-800">{formatBirr(med.sellingPrice)}</strong></span>
                        <span>•</span>
                        <span>Cost: <strong className="text-slate-600">{formatBirr(med.purchaseCost)}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Profit: +{formatBirr(med.profitPerUnit)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        isSelected ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-100'
                      }`}>
                        {isSelected ? 'Selected' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Medicine Quantity & Financial Preview */}
          {selectedStockMed && selectedStockMed.quantity > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Selected Medicine:
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {selectedStockMed.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Available in stock: <strong>{selectedStockMed.quantity} units</strong>
                  </span>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600 text-xs">Qty:</span>
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setAddQuantity((q) => Math.max(1, q - 1))}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-600 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedStockMed.quantity}
                      value={addQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setAddQuantity(val);
                      }}
                      className="w-10 text-center font-bold text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAddQuantity((q) => Math.min(selectedStockMed.quantity, q + 1))}
                      disabled={addQuantity >= selectedStockMed.quantity}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-600 font-bold disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Total Sell Value:</span>
                  <span className="font-extrabold text-slate-900 text-xs">{previewTotalSell} Birr</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-emerald-700 block text-[10px]">Total Profit:</span>
                  <span className="font-extrabold text-emerald-800 text-xs">+{previewTotalProfit} Birr</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSelectModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!selectedStockMed || selectedStockMed.quantity <= 0}
              onClick={handleConfirmAddStock}
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Add to Sale Cart</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
