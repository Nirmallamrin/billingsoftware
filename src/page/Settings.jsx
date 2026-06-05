import React, { useState, useEffect } from "react";
import { FiSettings, FiSave, FiLoader, FiCheck, FiLogOut, FiUser, FiBriefcase } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'business'
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });

  // Business State
  const [businessData, setBusinessData] = useState({
    business_name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    logo_url: ""
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const storedUser = JSON.parse(localStorage.getItem('invox_user'));
      if (!storedUser) return;
      setUser(storedUser);

      // Fetch Profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedUser.id)
        .single();

      if (userData) {
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || ""
        });
      }

      // Fetch Business Settings from company_settings table
      const { data: businessSettings, error: businessError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', storedUser.id)
        .single();

      if (businessSettings) {
        setBusinessData({
          business_name: businessSettings.business_name || "",
          email: businessSettings.email || "",
          phone: businessSettings.phone || "",
          address: businessSettings.address || "",
          gstin: businessSettings.gstin || "",
          logo_url: businessSettings.logo_url || ""
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

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleBusinessChange = (e) => {
    setBusinessData({ ...businessData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update localStorage
      const updatedUser = { ...user, name: profileData.name, phone: profileData.phone };
      localStorage.setItem('invox_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          business_name: businessData.business_name,
          email: businessData.email,
          phone: businessData.phone,
          address: businessData.address,
          gstin: businessData.gstin,
          logo_url: businessData.logo_url,
          updated_at: new Date()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert("Error saving business settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center text-gray-400"><FiLoader className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiSettings className="text-gray-500" /> Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage your personal profile and business configuration.</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border border-transparent hover:border-red-100"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiUser size={18} /> My Profile
        </button>
        <button
          onClick={() => setActiveTab("business")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'business' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiBriefcase size={18} /> Business Info
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 mb-2 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{profileData.name || 'User'}</h3>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mt-1 inline-block">{profileData.role || 'Staff'} Account</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address (Read-Only)</label>
                <input
                  readOnly
                  type="email"
                  value={profileData.email}
                  className="w-full p-3.5 border border-gray-200 rounded-xl outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Role (Read-Only)</label>
                <input
                  readOnly
                  type="text"
                  value={profileData.role}
                  className="w-full p-3.5 border border-gray-200 rounded-xl outline-none bg-gray-100 text-gray-500 cursor-not-allowed uppercase"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`${success ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70`}
              >
                {isSaving ? <FiLoader className="animate-spin" /> : success ? <FiCheck /> : <FiSave />}
                {success ? 'Saved!' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {/* Business Tab */}
        {activeTab === "business" && (
          <form onSubmit={handleSaveBusiness} className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-100 pb-4">Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                <input
                  required
                  type="text"
                  name="business_name"
                  value={businessData.business_name}
                  onChange={handleBusinessChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN / Tax ID</label>
                <input
                  type="text"
                  name="gstin"
                  value={businessData.gstin}
                  onChange={handleBusinessChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Email</label>
                <input
                  type="email"
                  name="email"
                  value={businessData.email}
                  onChange={handleBusinessChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={businessData.phone}
                  onChange={handleBusinessChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
              <textarea
                name="address"
                value={businessData.address}
                onChange={handleBusinessChange}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] bg-gray-50/50 resize-none"
              />
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`${success ? 'bg-green-500' : 'bg-black hover:bg-gray-800'} text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70`}
              >
                {isSaving ? <FiLoader className="animate-spin" /> : success ? <FiCheck /> : <FiSave />}
                {success ? 'Saved!' : 'Save Business Info'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Settings;
