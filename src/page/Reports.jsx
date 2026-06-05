import React, { useState, useEffect, useMemo } from "react";
import { FiPieChart, FiTrendingUp, FiActivity, FiDownload, FiPrinter, FiFilter, FiCalendar } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('This Month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          parties ( name )
        `)
        .eq('type', 'Sale')
        .order('date', { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterType === 'Today') {
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === today.getTime();
      });
    } else if (filterType === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === yesterday.getTime();
      });
    } else if (filterType === 'This Week') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      filtered = filtered.filter(t => new Date(t.date) >= firstDay);
    } else if (filterType === 'This Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = filtered.filter(t => new Date(t.date) >= firstDay);
    } else if (filterType === 'This Year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      filtered = filtered.filter(t => new Date(t.date) >= firstDay);
    } else if (filterType === 'Custom') {
      if (customDates.start) {
        filtered = filtered.filter(t => new Date(t.date) >= new Date(customDates.start));
      }
      if (customDates.end) {
        filtered = filtered.filter(t => new Date(t.date) <= new Date(customDates.end));
      }
    }
    return filtered;
  }, [transactions, filterType, customDates]);

  const stats = useMemo(() => {
    const totalSales = filteredTransactions.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    const totalReceived = filteredTransactions.filter(t => t.status === 'Paid').reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    return {
      totalSales,
      totalReceived,
      invoiceCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No data to export");
      return;
    }
    
    const headers = ['Date', 'Invoice #', 'Customer', 'Status', 'Payment Mode', 'Subtotal', 'Tax', 'Total Amount'];
    
    const csvRows = [headers.join(',')];
    
    filteredTransactions.forEach(t => {
      // Extract payment mode from notes if exists
      let paymentMode = 'Unpaid';
      if (t.status === 'Paid') {
        paymentMode = 'Paid'; // Default fallback
        if (t.notes && t.notes.includes('Payment Mode:')) {
          const match = t.notes.match(/Payment Mode:\s*([^\n]+)/);
          if (match) paymentMode = match[1].trim();
        }
      }

      const row = [
        new Date(t.date).toLocaleDateString(),
        `"${t.transaction_number}"`,
        `"${t.parties?.name || t.customer_name || 'Walk-in'}"`,
        t.status,
        paymentMode,
        t.subtotal || 0,
        t.tax_amount || 0,
        t.total_amount || 0
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales_Report_${filterType.replace(' ', '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiPieChart className="text-teal-500" /> Business Reports
          </h2>
          <p className="text-gray-500 text-sm mt-1">Detailed overview of your sales and financial metrics.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold flex items-center gap-2 transition-colors border border-gray-200">
            <FiPrinter /> Print
          </button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl font-semibold flex items-center gap-2 transition-colors">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="flex items-center gap-2 text-gray-500 font-semibold min-w-[max-content]">
          <FiFilter /> Filter by:
        </div>
        
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-2.5 outline-none font-bold min-w-[150px]"
        >
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
          <option value="All Time">All Time</option>
          <option value="Custom">Custom Range</option>
        </select>
        
        {filterType === 'Custom' && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <FiCalendar className="text-gray-400" />
              <input 
                type="date" 
                value={customDates.start}
                onChange={e => setCustomDates({...customDates, start: e.target.value})}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 outline-none"
              />
            </div>
            <span className="text-gray-400 font-bold">to</span>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <FiCalendar className="text-gray-400" />
              <input 
                type="date" 
                value={customDates.end}
                onChange={e => setCustomDates({...customDates, end: e.target.value})}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-6 text-center">
        <h1 className="text-3xl font-black text-gray-900">Sales Report</h1>
        <p className="text-gray-600 text-lg mt-2">Period: {filterType} {filterType === 'Custom' ? `(${customDates.start || 'Start'} to ${customDates.end || 'End'})` : ''}</p>
        <p className="text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 print:border-gray-300 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-500 rounded-xl print:bg-transparent print:p-0">
              <FiTrendingUp size={24} />
            </div>
            <span className="font-semibold text-gray-600">Total Sales</span>
          </div>
          <span className="text-3xl font-black text-gray-800">
            {loading ? "..." : `₹${stats.totalSales.toFixed(2)}`}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 print:border-gray-300 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl print:bg-transparent print:p-0">
              <FiActivity size={24} />
            </div>
            <span className="font-semibold text-gray-600">Total Invoices</span>
          </div>
          <span className="text-3xl font-black text-gray-800">
            {loading ? "..." : stats.invoiceCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 print:border-gray-300 print:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-500 rounded-xl print:bg-transparent print:p-0">
              <FiPieChart size={24} />
            </div>
            <span className="font-semibold text-gray-600">Amount Received</span>
          </div>
          <span className="text-3xl font-black text-gray-800">
            {loading ? "..." : `₹${stats.totalReceived.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print:shadow-none print:border-gray-300 mt-6">
        <div className="p-5 border-b border-gray-100 print:border-gray-300">
          <h3 className="font-bold text-gray-800 text-lg">Sales Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100 print:bg-transparent print:border-gray-300 print:text-black">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Invoice #</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading data...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No transactions found for this period.</td></tr>
              ) : (
                filteredTransactions.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors print:border-gray-200">
                    <td className="p-4 text-gray-600 print:text-black">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-gray-800 print:text-black">{inv.transaction_number}</td>
                    <td className="p-4 font-semibold text-gray-700 print:text-black">{inv.parties?.name || inv.customer_name || 'Walk-in'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700 print:border print:border-green-300' :
                        inv.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 print:border print:border-yellow-300' :
                        'bg-red-100 text-red-700 print:border print:border-red-300'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800 print:text-black">
                      ₹{Number(inv.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
