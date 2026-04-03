import React, { useState, useMemo } from "react";
import { 
  FiPlus, 
  FiTrash2, 
  FiChevronRight, 
  FiCalendar, 
  FiHash, 
  FiUser, 
  FiInfo,
  FiChevronDown
} from "react-icons/fi";

const Billing = () => {
  const [billData, setBillData] = useState({
    from: "Purchasing Direct",
    date: "2025-06-03",
    dueDate: "2025-06-30",
    reference: "989844",
    currency: "USD United States Dollar",
    taxType: "No Tax"
  });

  const [lines, setLines] = useState([
    { id: 1, item: "", description: "", qty: 1, unitPrice: 0.00, account: "502 - Office Expenses" },
    { id: 2, item: "", description: "", qty: 1, unitPrice: 0.00, account: "" },
    { id: 3, item: "", description: "", qty: 1, unitPrice: 0.00, account: "" },
    { id: 4, item: "", description: "", qty: 1, unitPrice: 0.00, account: "" },
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now(), item: "", description: "", qty: 1, unitPrice: 0.00, account: "" }]);
  };

  const removeLine = (id) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id, field, value) => {
    setLines(lines.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const subtotal = useMemo(() => {
    return lines.reduce((acc, line) => acc + (parseFloat(line.qty) || 0) * (parseFloat(line.unitPrice) || 0), 0);
  }, [lines]);

  const total = subtotal; // Assuming No Tax based on image defaults

  return (
    <div className="flex flex-col gap-6 -mt-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#2ECC71]">
        <span className="hover:underline cursor-pointer">Purchases overview</span>
        <FiChevronRight size={12} className="text-gray-400" />
        <span className="hover:underline cursor-pointer">Bills to pay</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">New Bill</h1>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-end relative overflow-hidden">
          {/* Top total indicator */}
          <div className="absolute top-0 right-0 p-6 bg-gray-50 border-l border-b border-gray-100 rounded-bl-3xl">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter text-right mb-1">Total</p>
            <p className="text-2xl font-black text-gray-800">${total.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">From</label>
            <div className="relative">
              <input 
                type="text" 
                value={billData.from}
                onChange={(e) => setBillData({...billData, from: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#2ECC71]/20 transition-all outline-none font-medium text-gray-700 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-[#2ECC71] bg-[#2ECC71]/10 px-1.5 py-0.5 rounded uppercase">New</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={billData.date}
                onChange={(e) => setBillData({...billData, date: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#2ECC71]/20 transition-all outline-none font-medium text-gray-700 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Due Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={billData.dueDate}
                onChange={(e) => setBillData({...billData, dueDate: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#2ECC71]/20 transition-all outline-none font-medium text-gray-700 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Reference</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={billData.reference}
                onChange={(e) => setBillData({...billData, reference: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#2ECC71]/20 transition-all outline-none font-medium text-gray-700 text-sm"
              />
              <button className="p-3 bg-red-500 rounded-xl text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                <FiHash size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center p-3">
             <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 transition-all">
                <FiPlus size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Action Selectors */}
      <div className="flex items-center justify-between">
        <div className="bg-gray-100/50 p-1 rounded-2xl flex gap-1">
          <button className="px-4 py-2 rounded-xl bg-white shadow-sm text-xs font-bold text-gray-800 flex items-center gap-2">
            {billData.currency} <FiChevronDown />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold text-gray-400">Amounts are</span>
          <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 flex items-center gap-8 shadow-sm">
            {billData.taxType} <FiChevronDown />
          </button>
        </div>
      </div>

      {/* Bill Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-black">Item</th>
              <th className="px-6 py-4 font-black">Description</th>
              <th className="px-6 py-4 font-black text-center w-24">Qty</th>
              <th className="px-6 py-4 font-black text-right w-32">Unit Price</th>
              <th className="px-6 py-4 font-black">Account</th>
              <th className="px-6 py-4 font-black text-right w-40">Amount USD</th>
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lines.map((line) => (
              <tr key={line.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700" 
                    value={line.item}
                    onChange={(e) => updateLine(line.id, 'item', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700" 
                    value={line.description}
                    onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input 
                    type="number"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-center text-gray-800" 
                    value={line.qty}
                    onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input 
                    type="number"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-right text-gray-800" 
                    value={line.unitPrice}
                    onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="relative">
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-[#2ECC71] pr-6" 
                      value={line.account}
                      onChange={(e) => updateLine(line.id, 'account', e.target.value)}
                    />
                    <FiChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-black text-gray-800">
                  {((parseFloat(line.qty) || 0) * (parseFloat(line.unitPrice) || 0)).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => removeLine(line.id)}
                    className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-2">
             <button 
              onClick={addLine}
              className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              Add a new line <FiChevronDown />
            </button>
            <button className="px-6 py-2.5 text-gray-400 text-xs font-bold hover:text-gray-600 transition-all">
              Assign expenses to a customer or project
            </button>
          </div>

          <div className="w-80 flex flex-col gap-4">
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Subtotal</span>
              <span className="text-sm font-black text-gray-800">{subtotal.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-800/10 mx-4"></div>
            <div className="flex justify-between items-center px-4">
              <span className="text-2xl font-black text-gray-800">TOTAL</span>
              <span className="text-2xl font-black text-gray-800">{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3">
          <button className="bg-[#2ECC71] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#2ECC71]/20 flex items-center gap-2 active:scale-95 transition-all">
            Save <FiChevronDown />
          </button>
        </div>
        <div className="flex gap-3">
           <button className="bg-[#82C91E] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#82C91E]/20 flex items-center gap-2 active:scale-95 transition-all">
            Approve <FiChevronDown />
          </button>
          <button className="bg-gray-400 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-lg shadow-gray-400/20 active:scale-95 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
;