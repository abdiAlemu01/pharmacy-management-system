import React, { useState } from 'react';
import { Flame, AlertCircle } from 'lucide-react';

export const TopAndLessSellingSection = ({ analytics = {}, isLoading = false }) => {
  const [period, setPeriod] = useState('daily'); // 'daily' | 'monthly'

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const currentData = period === 'daily' ? analytics.daily || {} : analytics.monthly || {};
  const mostSelling = currentData.mostSelling || [];

  // Cumulative totals for Qty Sold, Total Sell, and Profit at end of day / month
  const totalQtySold =
    currentData.unitsSold !== undefined && currentData.unitsSold !== null
      ? currentData.unitsSold
      : mostSelling.reduce((acc, med) => acc + (parseInt(med.quantitySold, 10) || 0), 0);

  const totalSell =
    currentData.totalSell !== undefined && currentData.totalSell !== null
      ? parseFloat(currentData.totalSell || 0)
      : mostSelling.reduce((acc, med) => acc + (parseFloat(med.totalRevenue) || 0), 0);

  const totalProfit =
    currentData.totalProfit !== undefined && currentData.totalProfit !== null
      ? parseFloat(currentData.totalProfit || 0)
      : mostSelling.reduce((acc, med) => acc + (parseFloat(med.totalProfit) || 0), 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Period Selection Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Most Selling Medicines Analytics
          </h3>
          
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

      {/* Most Selling Medicines Table (Full Width) */}
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
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 uppercase font-bold text-slate-500 tracking-wider text-xs border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Medicine Name</th>
                <th className="px-4 py-3.5 text-center">Qty Sold</th>
                <th className="px-4 py-3.5 text-right">Purchase Price</th>
                <th className="px-4 py-3.5 text-right">Selling Price</th>
                <th className="px-4 py-3.5 text-right">Total Sell</th>
                <th className="px-5 py-3.5 text-right bg-emerald-50/40 text-emerald-800 font-extrabold">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
                    <p className="mt-2 text-xs font-medium">Loading most selling medicines...</p>
                  </td>
                </tr>
              ) : mostSelling.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No sales recorded for this period yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Complete sales using POS to view top selling medicines.
                    </p>
                  </td>
                </tr>
              ) : (
                mostSelling.map((med, i) => (
                  <tr key={med.medicineId || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{med.medicineName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                        {med.quantitySold} units
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap text-xs text-slate-500">
                      {formatBirr(med.purchasePrice)}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap font-medium text-slate-800">
                      {formatBirr(med.sellingPrice)}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap font-bold text-slate-900">
                      {formatBirr(med.totalRevenue)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap bg-emerald-50/20 font-black text-emerald-700">
                      +{formatBirr(med.totalProfit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* End of Day / End of Month Totals Table Footer */}
            {!isLoading && mostSelling.length > 0 && (
              <tfoot className="bg-slate-100/90 border-t-2 border-slate-300">
                <tr>
                  <td className="px-5 py-4 font-black text-slate-900 text-sm tracking-wide">
                    TOTAL ({period === 'daily' ? 'END OF DAY' : 'END OF MONTH'})
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg text-xs">
                      {totalQtySold} units
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-400 font-semibold text-xs">—</td>
                  <td className="px-4 py-4 text-right text-slate-400 font-semibold text-xs">—</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap font-black text-slate-900 text-sm">
                    {formatBirr(totalSell)}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-black text-emerald-700 bg-emerald-100/60 text-sm">
                    +{formatBirr(totalProfit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Admin End of Day / End of Month Summary Panel */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-black text-xs uppercase tracking-wider">
                {period === 'daily' ? 'End of Day Total' : 'End of Month Total'}
              </span>
              <span className="text-xs text-slate-700 font-bold">
                Admin Sales Analysis
              </span>
            </div>
            
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-start gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-medium">Total Qty Sold:</span>
              <span className="font-black text-slate-900 text-sm">{totalQtySold} units</span>
            </div>

            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-start gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-medium">Total Sell:</span>
              <span className="font-black text-slate-900 text-sm">{formatBirr(totalSell)}</span>
            </div>

            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-start gap-2 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-emerald-700 font-medium">Total Profit:</span>
              <span className="font-black text-emerald-700 text-sm">+{formatBirr(totalProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MostSellingSection = TopAndLessSellingSection;

