import React, { useState, useEffect } from "react";
import { FiFileText, FiSearch, FiEye, FiDownload, FiTrash2 } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    // Fetch transactions with related party name
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        parties ( name )
      `)
      .eq('type', 'Sale')
      .order('date', { ascending: false });

    if (!error && data) {
      setInvoices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (inv.parties?.name && inv.parties.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiFileText className="text-orange-500" /> All Invoices
          </h2>
          <p className="text-gray-500 text-sm mt-1">View and manage your past sales transactions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by invoice number or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Invoice #</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-gray-800">{inv.transaction_number}</td>
                    <td className="p-4 font-semibold text-gray-700">{inv.parties?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      ₹{inv.total_amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="View"><FiEye /></button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50" title="Download"><FiDownload /></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Delete"><FiTrash2 /></button>
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

export default Invoices;
