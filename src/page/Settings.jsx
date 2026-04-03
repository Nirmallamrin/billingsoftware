import React from "react";
import { FiSettings } from "react-icons/fi";

const Settings = () => (
  <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
    <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-500 mb-6">
      <FiSettings size={40} />
    </div>
    <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
    <p className="text-gray-400 mt-2 max-w-sm text-center">Customize your application preferences and security settings here.</p>
    <button className="mt-8 px-8 py-3 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/20">
      Save Preferences
    </button>
  </div>
);

export default Settings;
