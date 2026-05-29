import React, { useState, useEffect } from "react";
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", gstin: "", billing_address: "", opening_balance: 0
  });

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('party_type', 'Customer')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", gstin: "", billing_address: "", opening_balance: 0 });
    setIsModalOpen(true);
  };

  const handleEditClick = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      gstin: customer.gstin || "",
      billing_address: customer.billing_address || "",
      opening_balance: customer.opening_balance || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    const { error } = await supabase.from('parties').delete().eq('id', id);
    if (error) {
      alert("Error deleting customer: " + error.message);
    } else {
      fetchCustomers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('invox_user'));
    
    if (!storedUser) return;

    const payload = {
      user_id: storedUser.id,
      party_type: 'Customer',
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      gstin: formData.gstin,
      billing_address: formData.billing_address,
      opening_balance: Number(formData.opening_balance) || 0
    };

    if (editingId) {
      const { error } = await supabase.from('parties').update(payload).eq('id', editingId);
      if (!error) {
        setIsModalOpen(false);
        setEditingId(null);
        fetchCustomers();
      } else {
        alert("Error updating customer: " + error.message);
      }
    } else {
      const { error } = await supabase.from('parties').insert([payload]);
      if (!error) {
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        alert("Error adding customer: " + error.message);
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiUsers className="text-blue-500" /> Customers
          </h2>
          <p className="text-gray-500 text-xs mt-1">Manage your clients and their details.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <FiPlus /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">GSTIN</th>
                <th className="p-4 font-semibold">Balance</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No customers found.</td></tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{customer.name}</div>
                      {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
                    </td>
                    <td className="p-4 text-gray-600">{customer.phone || '-'}</td>
                    <td className="p-4 text-gray-600">{customer.gstin || '-'}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${customer.opening_balance > 0 ? 'text-green-600' : customer.opening_balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        ₹{Math.abs(customer.opening_balance).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEditClick(customer)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(customer.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-2"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN</label>
                  <input type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 29ABCDE1234F1Z5" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Opening Balance (₹)</label>
                  <input type="number" name="opening_balance" value={formData.opening_balance} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Billing Address</label>
                <textarea name="billing_address" value={formData.billing_address} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px]" placeholder="Full address..."></textarea>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">{editingId ? 'Update Customer' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
