import React, { useState, useEffect } from "react";
import { FiSettings, FiSave, FiLoader, FiCheck, FiLogOut } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Settings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    logo_url: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const storedUser = JSON.parse(localStorage.getItem('invox_user'));
      if (!storedUser) return;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', storedUser.id)
        .single();

      if (data) {
        setFormData({
          business_name: data.business_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          gstin: data.gstin || "",
          logo_url: data.logo_url || ""
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('invox_user');
    window.location.href = '/login';
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('invox_user'));
      if (!storedUser) throw new Error("Not logged in");

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: storedUser.id,
          business_name: formData.business_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gstin: formData.gstin,
          logo_url: formData.logo_url,
          updated_at: new Date()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("Error saving settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center text-gray-400"><FiLoader className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiSettings className="text-gray-500" /> Company Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">Update your business profile and billing preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
              <input 
                required 
                type="text" 
                name="business_name" 
                value={formData.business_name} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN</label>
              <input 
                type="text" 
                name="gstin" 
                value={formData.gstin} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] bg-gray-50/50" 
            />
          </div>

          <div className="border-t border-gray-100 pt-6 mt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-transparent hover:border-red-100"
            >
              <FiLogOut /> Logout Securely
            </button>

            <button 
              type="submit" 
              disabled={isSaving}
              className={`${success ? 'bg-green-500' : 'bg-black hover:bg-gray-800'} text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70`}
            >
              {isSaving ? <FiLoader className="animate-spin" /> : success ? <FiCheck /> : <FiSave />} 
              {success ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
