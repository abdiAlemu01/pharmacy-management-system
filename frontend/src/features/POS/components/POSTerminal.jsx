import React, { useState, useMemo } from 'react';
import { useAppDate } from '@/shared/lib/date-utils';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  X,
  Package,
  Star,
  Heart,
  SlidersHorizontal,
  Pill,
  ShoppingBag,
  Camera,
} from 'lucide-react';

export const POSTerminal = ({
  medicines = [],
  isLoading = false,
  onCheckout,
  isCheckingOut = false,
}) => {
  // ── Cart State ──
  const [cart, setCart] = useState([]); // [{ medicine, quantity }]

  // ── Search & Filter State ──
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'inStock' | 'lowStock'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [favorites, setFavorites] = useState(() => new Set());

  // ── Custom Medicine Images (Persistent & Safe) ──
  const [customImages, setCustomImages] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_medicine_images');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleImageUpload = (medId, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result;
      if (!base64) return;
      setCustomImages((prev) => {
        const updated = { ...prev, [medId]: base64 };
        try {
          localStorage.setItem('pos_medicine_images', JSON.stringify(updated));
        } catch (err) {
          console.warn('Failed to save medicine image to localStorage:', err);
        }
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (medId, e) => {
    e.stopPropagation();
    setCustomImages((prev) => {
      const updated = { ...prev };
      delete updated[medId];
      try {
        localStorage.setItem('pos_medicine_images', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save medicine image to localStorage:', err);
      }
      return updated;
    });
  };

  // ── Financial Modifiers ──
  const [discountPercent, setDiscountPercent] = useState(0); // 0%, 5%, 10%, etc.

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Birr`;
  };

  const { formatDate, formatDateTime, calendarType } = useAppDate();

  // ── Formatted Date for Top Banner (Numeric format) ──
  const formattedDate = useMemo(() => {
    const today = new Date();
    return formatDate(today, { showMonthName: false, showSuffix: false });
  }, [formatDate, calendarType]);

  // ── Filter Medicines ──
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = med.name?.toLowerCase().includes(q);
        const matchGeneric = med.genericName?.toLowerCase().includes(q);
        const matchBarcode = med.barcode?.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBarcode) return false;
      }

      // 2. Stock Level Filter
      if (stockFilter === 'inStock' && med.quantity <= 0) return false;
      if (stockFilter === 'lowStock' && (med.quantity <= 0 || med.quantity > 10)) return false;

      return true;
    });
  }, [medicines, searchQuery, stockFilter]);

  // ── Cart Interactions ──
  const addToCart = (med) => {
    if (med.quantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === med.id);
      if (existing) {
        if (existing.quantity >= med.quantity) return prev; // Cannot exceed available stock
        return prev.map((item) =>
          item.medicine.id === med.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine: med, quantity: 1 }];
    });
  };

  const updateQuantity = (medicineId, newQty) => {
    if (newQty === '') {
      setCart((prev) =>
        prev.map((item) =>
          item.medicine.id === medicineId ? { ...item, quantity: '' } : item
        )
      );
      return;
    }

    const qty = parseInt(newQty, 10);
    if (isNaN(qty)) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.medicine.id === medicineId) {
          const clamped = Math.max(1, Math.min(qty, item.medicine.quantity));
          return { ...item, quantity: clamped };
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
    setCart((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Cart Totals Calculation ──
  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let totalCost = 0;
    let totalUnits = 0;

    cart.forEach((item) => {
      const q = parseInt(item.quantity, 10) || 0;
      subtotal += q * (parseFloat(item.medicine.sellingPrice) || 0);
      totalCost += q * (parseFloat(item.medicine.purchaseCost) || 0);
      totalUnits += q;
    });

    const discountAmount = (subtotal * discountPercent) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const totalProfit = finalTotal - totalCost;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalUnits,
    };
  }, [cart, discountPercent]);

  // ── Checkout Handler ──
  const handleCompleteSale = () => {
    if (cart.length === 0 || isCheckingOut) return;

    const payload = {
      items: cart.map((i) => ({
        medicineId: i.medicine.id,
        quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
        unitPrice: parseFloat(i.medicine.sellingPrice) || 0,
      })),
      discount: cartTotals.discountAmount,
    };

    onCheckout(payload, () => {
      clearCart();
    });
  };

  // ── Visual Tint for Product Illustration ──
  const getProductArtwork = (name = '', idx = 0) => {
    const colorThemes = [
      { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40' },
      { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/40' },
      { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/40' },
      { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/40' },
      { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/40' },
    ];
    const theme = colorThemes[idx % colorThemes.length];
    return theme;
  };

  return (
    <div className="relative">
      {/* ── Main POS Layout (Left Products Grid + Right "My Order" Panel) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ══════════════════════════════════════════════════════════════════════
            LEFT SECTION: Header, Category Pills, Product Cards Grid (8 cols)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Header: Date + Title + Search Bar & Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 block tracking-tight">
                  {formattedDate}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Pharmacy Dispensary
              </h2>
            </div>

            {/* Search Input & Filter Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto relative">
              <div className="relative flex-1 sm:w-64 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterMenu((prev) => !prev)}
                  title="Filter inventory"
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    stockFilter !== 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setStockFilter('all');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        stockFilter === 'all'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      All Stock Items
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStockFilter('inStock');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        stockFilter === 'inStock'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      In-Stock Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStockFilter('lowStock');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        stockFilter === 'lowStock'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Low Stock Alert (≤ 10)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Product Catalog Grid */}
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Package className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="font-bold text-sm">Loading pharmacy inventory...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No medicines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMedicines.map((med, idx) => {
                const artwork = getProductArtwork(med.name, idx);
                const isOutOfStock = med.quantity <= 0;
                const isFav = favorites.has(med.id);
                const inCart = cart.find((i) => i.medicine.id === med.id);
                const medImage = customImages[med.id] || med.imageUrl || med.image;

                return (
                  <div
                    key={med.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                  >
                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(med.id)}
                      className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors z-20 cursor-pointer"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isFav ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>

                    <div>
                      {/* Product Visual Centerpiece: Displays Image or Icon, with Take/Upload action */}
                      <div className="py-2 flex items-center justify-center">
                        <div
                          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-2xs relative overflow-hidden ${
                            medImage
                              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              : `${artwork.bg} ${artwork.border}`
                          }`}
                        >
                          {medImage ? (
                            <img
                              src={medImage}
                              alt={med.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <Pill className={`w-9 h-9 sm:w-10 sm:h-10 ${artwork.text}`} />
                          )}

                          {inCart && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs z-10">
                              {inCart.quantity}
                            </span>
                          )}

                          {/* Take / Upload Image Trigger */}
                          <label
                            title={medImage ? 'Change medicine image' : 'Take or upload medicine image'}
                            className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full z-10"
                          >
                            <Camera className="w-5 h-5 text-white drop-shadow" />
                            <span className="text-[9px] font-bold text-white mt-0.5 drop-shadow">
                              {medImage ? 'Change' : 'Add photo'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(med.id, file);
                              }}
                            />
                          </label>

                          {medImage && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(med.id, e)}
                              title="Remove image"
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Product Title & Price Header */}
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <h4
                          className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate flex-1"
                          title={med.name}
                        >
                          {med.name}
                        </h4>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base whitespace-nowrap">
                          {formatBirr(med.sellingPrice)}
                        </span>
                      </div>

                      {/* Generic Name (displayed only when available) */}
                      {med.genericName ? (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          Generic: {med.genericName}
                        </p>
                      ) : null}
                    </div>

                    {/* Bottom Row: Stock Status + Add to Cart Button */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      {/* Stock Indicator */}
                      <div className="flex items-center gap-1.5">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                            Out of stock
                          </span>
                        ) : med.quantity <= 10 ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                            {med.quantity} left
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {med.quantity} in stock
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={() => addToCart(med)}
                        disabled={isOutOfStock}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : inCart
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCart ? 'Add More' : 'Add to cart'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT SECTION: "My Order" Panel (4 cols) — Matches Reference Image
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 lg:sticky lg:top-20">
          <div>
            {/* 1. Header: "My Order" Title & Clear Cart Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  My Order
                </h3>
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    {cart.length}
                  </span>
                )}
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  title="Clear order cart"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 2. Ordered Items List */}
            <div className="mt-3.5 max-h-[360px] overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Your order is empty</p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const med = item.medicine;
                  const artwork = getProductArtwork(med.name, idx);
                  const safeQty = parseInt(item.quantity, 10) || 1;
                  const medImage = customImages[med.id] || med.imageUrl || med.image;

                  return (
                    <div key={med.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      {/* Thumbnail */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 overflow-hidden ${
                          medImage
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            : `${artwork.bg} ${artwork.border}`
                        }`}
                      >
                        {medImage ? (
                          <img src={medImage} alt={med.name} className="w-full h-full object-cover" />
                        ) : (
                          <Pill className={`w-5 h-5 ${artwork.text}`} />
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {med.name}
                          </h5>
                          <button
                            type="button"
                            onClick={() => removeFromCart(med.id)}
                            className="text-slate-300 hover:text-rose-500 p-0.5 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {formatBirr(med.sellingPrice)}
                        </span>

                        {/* Stepper Control: [ - ] [ 01 ] [ + ] */}
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Subtotal: {(safeQty * med.sellingPrice).toFixed(2)} Birr
                          </span>

                          <div className="inline-flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => {
                                if (safeQty <= 1) removeFromCart(med.id);
                                else updateQuantity(med.id, safeQty - 1);
                              }}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={med.quantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(med.id, e.target.value)}
                              onBlur={(e) => handleQuantityBlur(med.id, e.target.value)}
                              className="w-8 text-center text-xs font-black bg-transparent focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => updateQuantity(med.id, safeQty + 1)}
                              disabled={safeQty >= med.quantity}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. Financial Order Totals */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Items ({cartTotals.totalUnits})</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatBirr(cartTotals.subtotal)}
              </span>
            </div>

            {/* Discount Row */}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span>Discount</span>
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
                  className="bg-slate-100 dark:bg-slate-800 rounded px-1 text-[10px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                </select>
              </div>
              <span className="font-bold text-rose-600">
                -{formatBirr(cartTotals.discountAmount)}
              </span>
            </div>

            {/* Total Profit (Pharmacy internal insight) */}
            <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
              <span className="font-bold">Estimated Profit</span>
              <span className="font-black">+{formatBirr(cartTotals.totalProfit)}</span>
            </div>

            {/* Total Amount (Prominent display) */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Total Amount
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {formatBirr(cartTotals.finalTotal)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || isCheckingOut}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5" />
            <span>
              {isCheckingOut ? 'Processing Checkout...' : `Checkout (${formatBirr(cartTotals.finalTotal)})`}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile Sticky Cart Bar (Shown on small screens when cart has items) ── */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold">{cart.length} medicines in cart</span>
            </div>
            <span className="text-base font-black text-emerald-400 block mt-0.5">
              {formatBirr(cartTotals.finalTotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Order</span>
          </button>
        </div>
      )}
    </div>
  );
};

