import React, { useState, useEffect } from "react";
import { FiPieChart, FiTrendingUp, FiActivity, FiDownload } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Reports = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalReceived: 0,
    invoiceCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('total_amount, amount_paid')
        .eq('type', 'Sale');

      if (!error && data) {
        const totalSales = data.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
        const totalReceived = data.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);
        setStats({
          totalSales,
          totalReceived,
          invoiceCount: data.length
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiPieChart className="text-teal-500" /> Business Reports
          </h2>
          <p className="text-gray-500 text-sm mt-1">Overview of your sales and financial metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-500 rounded-xl">
              <FiTrendingUp size={24} />
            </div>
            <span className="font-semibold text-gray-600">Total Sales</span>
          </div>
          <span className="text-3xl font-black text-gray-800">
            {loading ? "..." : `₹${stats.totalSales.toFixed(2)}`}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
              <FiActivity size={24} />
            </div>
            <span className="font-semibold text-gray-600">Total Invoices</span>
          </div>
          <span className="text-3xl font-black text-gray-800">
            {loading ? "..." : stats.invoiceCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-500 rounded-xl">
              <FiPieChart size={24} />
            </div>
            <span className="font-semibold text-gray-600">Amount Received</span>
          </div>
          <span className="text-3xl font-black text-gray-800">
            {loading ? "..." : `₹${stats.totalReceived.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <FiPieChart size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Detailed Reports Coming Soon</h3>
        <p className="text-gray-500 max-w-md mt-2 mb-6">
          GST Reports (GSTR-1, GSTR-2), Item-wise sales, and Party-wise ledger reports will be available in the next update.
        </p>
        <button disabled className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed">
          <FiDownload /> Export CSV
        </button>
      </div>
    </div>
  );
};

export default Reports;
