import React, { useState, useEffect } from "react";
import { FiFileText, FiSearch, FiEye, FiDownload, FiTrash2, FiX } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

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

  const handleView = async (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
    setLoadingItems(true);
    
    const { data, error } = await supabase
      .from('transaction_items')
      .select('*')
      .eq('transaction_id', invoice.id);
      
    if (!error && data) {
      setInvoiceItems(data);
    }
    setLoadingItems(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        setInvoices(invoices.filter(inv => inv.id !== id));
      } catch (err) {
        console.error("Error deleting invoice:", err);
        alert("Failed to delete invoice.");
      }
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const search = searchQuery.toLowerCase();
    const invNumber = inv.transaction_number?.toLowerCase() || "";
    const partyName = inv.parties?.name?.toLowerCase() || "";
    const customerName = inv.customer_name?.toLowerCase() || "";
    return invNumber.includes(search) || partyName.includes(search) || customerName.includes(search);
  });

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
                    <td className="p-4 font-semibold text-gray-700">{inv.parties?.name || inv.customer_name || 'Unknown'}</td>
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
                      ₹{Number(inv.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleView(inv)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="View"><FiEye /></button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50" title="Download"><FiDownload /></button>
                      <button onClick={() => handleDelete(inv.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Delete"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <FiFileText className="text-blue-500" /> Invoice Details
              </h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Customer</p>
                  <p className="font-semibold text-gray-800">{selectedInvoice.parties?.name || selectedInvoice.customer_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Invoice Number</p>
                  <p className="font-semibold text-gray-800">{selectedInvoice.transaction_number}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                  <p className="font-semibold text-gray-800">{selectedInvoice.status}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Tax %</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingItems ? (
                      <tr><td colSpan="5" className="p-4 text-center text-gray-400">Loading items...</td></tr>
                    ) : invoiceItems.length === 0 ? (
                      <tr><td colSpan="5" className="p-4 text-center text-gray-400">No items found.</td></tr>
                    ) : (
                      invoiceItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-800">{item.item_name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.unit_price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{item.tax_rate}%</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">₹{Number(item.total_amount).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <div className="w-full md:w-64 flex flex-col gap-3 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-800">₹{Number(selectedInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500">Tax</span>
                    <span className="font-bold text-gray-800">₹{Number(selectedInvoice.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-200 w-full my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-800">Total</span>
                    <span className="text-xl font-black text-blue-600">₹{Number(selectedInvoice.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
