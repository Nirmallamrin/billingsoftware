import React from "react";
import {
  FiPackage,
  FiFileText,
  FiPieChart,
  FiSettings,
} from "react-icons/fi";

const stats = [
  {
    label: "ORDERS",
    value: "1,685",
    subtext: "Since last month",
    gradient: "from-[#F87171] to-[#EF4444]",
    icon: <FiPackage className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
  },
  {
    label: "REVENUE",
    value: "$ 52,368.00",
    subtext: "Since last month",
    gradient: "from-[#2DD4BF] to-[#0D9488]",
    icon: <FiFileText className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
  },
  {
    label: "AVERAGE PRICE",
    value: "15.8",
    subtext: "Since last month",
    gradient: "from-[#60A5FA] to-[#3B82F6]",
    icon: <FiPieChart className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
  },
  {
    label: "PRODUCT SOLD",
    value: "1547",
    subtext: "Since last month",
    gradient: "from-[#A855F7] to-[#8B5CF6]",
    icon: <FiPackage className="text-white/20 w-16 h-16 absolute -right-2 -bottom-2" />,
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Welcome to Invoyse System</p>
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
              <h3 className="text-lg font-bold text-gray-800">Net Income</h3>
              <p className="text-xs text-indigo-500 font-bold mt-1">Avg. $5,309</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-gray-50 border-none rounded-lg text-xs font-bold text-gray-500 px-4 py-2 focus:ring-0">
                <option>Monthly</option>
              </select>
              <select className="bg-gray-50 border-none rounded-lg text-xs font-bold text-gray-500 px-4 py-2 focus:ring-0">
                <option>Last Year</option>
              </select>
            </div>
          </div>

          {/* Bar Chart Mockup */}
          <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-2">
            {[
              { h: "60%", l: "Jan" },
              { h: "45%", l: "Feb" },
              { h: "30%", l: "Mar" },
              { h: "35%", l: "Apr" },
              { h: "55%", l: "May" },
              { h: "40%", l: "Jun" },
              { h: "50%", l: "Jul" },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                <div className="w-full flex justify-center gap-1">
                  <div
                    className="w-10 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg transition-all group-hover:from-indigo-600 duration-300 relative"
                    style={{ height: item.h }}
                  >
                    <div className="absolute inset-x-0 -bottom-12 h-12 bg-indigo-50 rounded-b-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-16 uppercase tracking-wider">{item.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Money/Budget Section */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Money</h3>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-lg font-black text-green-500">$50,000</p>
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
                  strokeDashoffset={440 * (1 - 0.48)}
                  strokeLinecap="round"
                  className="text-indigo-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800 leading-none">48%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Saved</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-xs font-bold text-gray-800">Total Spent</span>
                </div>
                <p className="text-sm font-black text-gray-400 mt-1">$18,570</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="text-xs font-bold text-gray-800">Money Saved</span>
                </div>
                <p className="text-sm font-black text-gray-400 mt-1">$31,430</p>
              </div>
            </div>
            <button className="w-full text-center text-xs font-black text-[#6366F1] uppercase tracking-widest pt-4 border-t border-gray-100 hover:text-indigo-700 transition-colors">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
