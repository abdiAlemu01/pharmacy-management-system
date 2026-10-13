import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Flame, AlertCircle } from 'lucide-react';

export const TopAndLessSellingSection = ({ analytics = {}, isLoading = false }) => {
  const [period, setPeriod] = useState('daily'); // 'daily' | 'monthly'

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const currentData = period === 'daily' ? analytics.daily || {} : analytics.monthly || {};
  const mostSelling = currentData.mostSelling || [];
  const lessSelling = currentData.lessSelling || [];

  return (
    <div className="space-y-4 mb-6">
      {/* Period Selection Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Medicine Turnover Analytics: Most Selling vs. Less Selling
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare high-demand medicines against low-turnover medicines based on units sold, purchase price, selling price, and profit.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              period === 'daily'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Performance (Today)
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              period === 'monthly'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Performance (This Month)
          </button>
        </div>
      </div>

      {/* Two-Column Grid: Most Selling & Less Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Most Selling Medicines */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-linear-to-r from-emerald-50 to-white border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Most Selling Medicines ({period === 'daily' ? 'Daily' : 'Monthly'})
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              High Turnover
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Medicine Name</th>
                  <th className="px-3 py-2.5 text-center">Qty Sold</th>
                  <th className="px-3 py-2.5 text-right">Purchase Price</th>
                  <th className="px-3 py-2.5 text-right">Selling Price</th>
                  <th className="px-3 py-2.5 text-right">Total Sell</th>
                  <th className="px-4 py-2.5 text-right bg-emerald-50/40 text-emerald-800">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Loading most selling medicines...
                    </td>
                  </tr>
                ) : mostSelling.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                      No sales recorded for this period yet.
                    </td>
                  </tr>
                ) : (
                  mostSelling.map((med, i) => (
                    <tr key={med.medicineId || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            #{i + 1}
                          </span>
                          <span className="font-bold text-slate-800">{med.medicineName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {med.quantitySold} units
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        {formatBirr(med.purchasePrice)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap font-medium text-slate-800">
                        {formatBirr(med.sellingPrice)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap font-bold text-slate-900">
                        {formatBirr(med.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap bg-emerald-50/20 font-black text-emerald-700">
                        +{formatBirr(med.totalProfit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Less Selling Medicines */}
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-linear-to-r from-amber-50 to-white border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Less Selling Medicines ({period === 'daily' ? 'Daily' : 'Monthly'})
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
              Low Turnover
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Medicine Name</th>
                  <th className="px-3 py-2.5 text-center">Qty Sold</th>
                  <th className="px-3 py-2.5 text-center">Current Stock</th>
                  <th className="px-3 py-2.5 text-right">Selling Price</th>
                  <th className="px-3 py-2.5 text-right">Total Sell</th>
                  <th className="px-4 py-2.5 text-right bg-amber-50/40 text-amber-800">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Loading less selling medicines...
                    </td>
                  </tr>
                ) : lessSelling.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                      No sales recorded for this period yet.
                    </td>
                  </tr>
                ) : (
                  lessSelling.map((med, i) => (
                    <tr key={med.medicineId || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{med.medicineName}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          {med.quantitySold} units
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-500">
                        {med.currentStock} in stock
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap font-medium text-slate-800">
                        {formatBirr(med.sellingPrice)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap font-bold text-slate-900">
                        {formatBirr(med.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap bg-amber-50/20 font-black text-amber-700">
                        +{formatBirr(med.totalProfit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

