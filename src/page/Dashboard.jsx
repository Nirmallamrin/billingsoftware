import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiFileText,
  FiPieChart,
  FiSettings,
} from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dataStats, setDataStats] = useState({
    orders: 0,
    revenue: 0,
    avgPrice: 0,
    productsSold: 0
  });

  const [chartData, setChartData] = useState([]);
  const [moneyStats, setMoneyStats] = useState({
    totalBilled: 0,
    totalReceived: 0,
    totalPending: 0,
    receivedPercentage: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('invox_user'));
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('id, total_amount, amount_paid, date, type')
          .eq('user_id', storedUser.id)
          .eq('type', 'Sale');
        
        if (error) throw error;

        let totalRevenue = 0;
        let totalReceived = 0;
        let totalOrders = transactions?.length || 0;
        
        // Group by Month for Chart
        const monthlyData = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Initialize last 6 months to 0
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
          let pastD = new Date(d.getFullYear(), d.getMonth() - i, 1);
          let mName = monthNames[pastD.getMonth()];
          monthlyData[mName] = 0;
        }

        transactions?.forEach(inv => {
          const invTotal = parseFloat(inv.total_amount) || 0;
          const invPaid = parseFloat(inv.amount_paid) || 0;
          totalRevenue += invTotal;
          totalReceived += invPaid;

          const invDate = new Date(inv.date);
          const monthStr = monthNames[invDate.getMonth()];
          if (monthlyData[monthStr] !== undefined) {
             monthlyData[monthStr] += invTotal;
          }
        });

        // Compute items sold
        let productsSold = 0;
        if (transactions && transactions.length > 0) {
           const txIds = transactions.map(i => i.id);
           const { data: lines } = await supabase
             .from('transaction_items')
             .select('quantity')
             .in('transaction_id', txIds);
             
           lines?.forEach(line => {
             productsSold += parseFloat(line.quantity) || 0;
           });
        }

        setDataStats({
          orders: totalOrders,
          revenue: totalRevenue,
          avgPrice: totalOrders > 0 ? (totalRevenue / totalOrders) : 0,
          productsSold: productsSold
        });

        const totalPending = totalRevenue - totalReceived;
        const receivedPercentage = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 0;
        
        setMoneyStats({
          totalBilled: totalRevenue,
          totalReceived,
          totalPending: totalPending > 0 ? totalPending : 0,
          receivedPercentage: Math.round(receivedPercentage)
        });

        // Format chart data
        let maxVal = 0;
        Object.values(monthlyData).forEach(v => { if (v > maxVal) maxVal = v; });
        
        const formattedChart = Object.keys(monthlyData).map(m => {
           let val = monthlyData[m];
           let pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
           // Minimum height so it's visible if it has value
           if (val > 0 && pct < 10) pct = 10;
           return { h: `${pct}%`, l: m, v: val };
        });
        
        setChartData(formattedChart);

      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const stats = [
    {
      label: "INVOICES",
      value: dataStats.orders.toString(),
      subtext: "Total created",
      gradient: "from-[#F87171] to-[#EF4444]",
      icon: <FiPackage className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
    },
    {
      label: "REVENUE",
      value: `₹ ${dataStats.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2})}`,
      subtext: "Total sum",
      gradient: "from-[#2DD4BF] to-[#0D9488]",
      icon: <FiFileText className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
    },
    {
      label: "AVERAGE INVOICE",
      value: `₹ ${dataStats.avgPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}`,
      subtext: "Per invoice",
      gradient: "from-[#60A5FA] to-[#3B82F6]",
      icon: <FiPieChart className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
    },
    {
      label: "ITEMS SOLD",
      value: dataStats.productsSold.toString(),
      subtext: "Total quantity",
      gradient: "from-[#A855F7] to-[#8B5CF6]",
      icon: <FiPackage className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Welcome to Invox System</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/20 hover:scale-105 active:scale-95 transition-all">
          <FiSettings /> Settings
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${stat.gradient} text-white shadow-xl hover:translate-y-[-4px] transition-transform duration-300 group`}
          >
            <div className="relative z-10">
              <p className="text-[11px] font-black tracking-[0.2em] opacity-80 uppercase leading-none">{stat.label}</p>
              <p className="text-3xl font-bold mt-3 font-outfit tracking-tight leading-none">{stat.value}</p>
              <p className="text-[10px] mt-3 opacity-60 font-bold leading-none">{stat.subtext}</p>
            </div>
            <div className="group-hover:rotate-12 transition-transform duration-500 origin-center">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Sales Trend (6 Months)</h3>
              <p className="text-xs text-indigo-500 font-bold mt-1">Total ₹{dataStats.revenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-gray-50 border-none rounded-lg text-xs font-bold text-gray-500 px-4 py-2 focus:ring-0">
                <option>Monthly</option>
              </select>
            </div>
          </div>

          {/* Bar Chart Dynamic */}
          <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-2">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end">
                <div className="w-full flex justify-center gap-1 h-full items-end relative">
                   {/* Tooltip */}
                   <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded-lg pointer-events-none z-10 whitespace-nowrap">
                     ₹{item.v.toLocaleString('en-IN')}
                   </div>
                   
                  <div
                    className="w-10 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg transition-all group-hover:from-indigo-600 duration-300 relative min-h-[5px]"
                    style={{ height: item.h === '0%' ? '5px' : item.h }}
                  >
                    <div className="absolute inset-x-0 -bottom-12 h-12 bg-indigo-50 rounded-b-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-wider">{item.l}</span>
              </div>
            ))}
            {chartData.length === 0 && !loading && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No sales data found.</div>
            )}
          </div>
        </div>

        {/* Money/Collection Section */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Payment Collection</h3>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">Total Billed</p>
              <p className="text-lg font-black text-green-500">₹{moneyStats.totalBilled.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center my-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 * (1 - (moneyStats.receivedPercentage / 100))}
                  strokeLinecap="round"
                  className="text-indigo-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-800 leading-none">{moneyStats.receivedPercentage}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Collected</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-xs font-bold text-gray-800">Pending</span>
                </div>
                <p className="text-sm font-black text-gray-400 mt-1">₹{moneyStats.totalPending.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="text-xs font-bold text-gray-800">Received</span>
                </div>
                <p className="text-sm font-black text-gray-400 mt-1">₹{moneyStats.totalReceived.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <button className="w-full text-center text-xs font-black text-[#6366F1] uppercase tracking-widest pt-4 border-t border-gray-100 hover:text-indigo-700 transition-colors">
              View Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
