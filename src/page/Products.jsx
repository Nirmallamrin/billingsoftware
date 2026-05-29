import React, { useState, useEffect, useRef } from "react";
import { FiPackage, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiDownload, FiUpload, FiMoreVertical, FiImage } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Products = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    item_type: "Product", name: "", sku: "", hsn_sac: "", sale_price: 0, purchase_price: 0, tax_rate: 0, current_stock: 0, unit: "pcs", image_url: ""
  });

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({ item_type: "Product", name: "", sku: "", hsn_sac: "", sale_price: 0, purchase_price: 0, tax_rate: 0, current_stock: 0, unit: "pcs", image_url: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setImageFile(null);
    setFormData({
      item_type: item.item_type || "Product",
      name: item.name || "",
      sku: item.sku || "",
      hsn_sac: item.hsn_sac || "",
      sale_price: item.sale_price || 0,
      purchase_price: item.purchase_price || 0,
      tax_rate: item.tax_rate || 0,
      current_stock: item.current_stock || 0,
      unit: item.unit || "pcs",
      image_url: item.image_url || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      alert("Error deleting item: " + error.message);
    } else {
      fetchItems();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('invox_user'));
    
    if (!storedUser) return;
    setUploading(true);

    let finalImageUrl = formData.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${storedUser.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('product_images').upload(filePath, imageFile);
      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('product_images').getPublicUrl(filePath);
      finalImageUrl = data.publicUrl;
    }

    const payload = {
      user_id: storedUser.id,
      item_type: formData.item_type,
      name: formData.name,
      sku: formData.sku,
      hsn_sac: formData.hsn_sac,
      sale_price: Number(formData.sale_price) || 0,
      purchase_price: Number(formData.purchase_price) || 0,
      tax_rate: Number(formData.tax_rate) || 0,
      current_stock: Number(formData.current_stock) || 0,
      unit: formData.unit,
      image_url: finalImageUrl
    };

    if (editingId) {
      const { error } = await supabase.from('items').update(payload).eq('id', editingId);
      if (!error) {
        setIsModalOpen(false);
        setEditingId(null);
        fetchItems();
      } else {
        alert("Error updating product: " + error.message);
      }
    } else {
      const { error } = await supabase.from('items').insert([payload]);
      if (!error) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        alert("Error adding product: " + error.message);
      }
    }
    setUploading(false);
  };

  const handleExportCSV = () => {
    setIsMenuOpen(false);
    if (items.length === 0) return alert("No items to export.");

    const headers = ["item_type", "name", "sku", "hsn_sac", "sale_price", "purchase_price", "tax_rate", "current_stock", "unit", "image_url"];
    const csvRows = [];
    csvRows.push(headers.join(','));

    items.forEach(item => {
      const values = headers.map(header => {
        let val = item[header] === null || item[header] === undefined ? "" : item[header].toString();
        // Escape quotes and wrap in quotes if contains comma
        if (val.includes(',') || val.includes('"')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'products_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const parseCSVLine = (text) => {
    const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return text.split(re).map(x => x.replace(/^"|"$/g, '').trim());
  };

  const handleImportCSV = (e) => {
    setIsMenuOpen(false);
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("CSV is empty or invalid.");
        return;
      }

      const headers = parseCSVLine(lines[0].toLowerCase());
      const storedUser = JSON.parse(localStorage.getItem('invox_user'));
      if (!storedUser) return;

      const itemsToInsert = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue; // Skip malformed rows

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });

        if (!row.name) continue; // Name is required

        itemsToInsert.push({
          user_id: storedUser.id,
          item_type: row.item_type || 'Product',
          name: row.name,
          sku: row.sku || null,
          hsn_sac: row.hsn_sac || null,
          sale_price: Number(row.sale_price) || 0,
          purchase_price: Number(row.purchase_price) || 0,
          tax_rate: Number(row.tax_rate) || 0,
          current_stock: Number(row.current_stock) || 0,
          unit: row.unit || 'pcs',
          image_url: row.image_url || null
        });
      }

      if (itemsToInsert.length > 0) {
        setLoading(true);
        const { error } = await supabase.from('items').insert(itemsToInsert);
        if (error) {
          alert("Error importing data: " + error.message);
        } else {
          alert(`Successfully imported ${itemsToInsert.length} items!`);
          fetchItems();
        }
        setLoading(false);
      } else {
        alert("No valid items found to import.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (i.sku && i.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiPackage className="text-green-500" /> Products & Services
          </h2>
          <p className="text-gray-500 text-xs mt-1">Manage your inventory, pricing, and stock.</p>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-200 shadow-sm"
            >
              <FiMoreVertical size={18} />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-xs font-semibold"
                  >
                    <FiUpload size={16} className="text-blue-500"/>
                    <span>Import CSV</span>
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-xs font-semibold"
                  >
                    <FiDownload size={16} className="text-green-500"/>
                    <span>Export CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95"
          >
            <FiPlus /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input 
              type="text" 
              placeholder="Search items by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                <th className="p-3 font-semibold uppercase tracking-wider w-16">Image</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Item Name</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Stock</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Sale Price</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Tax</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-sm text-gray-400">Loading items...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-sm text-gray-400">No items found.</td></tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="p-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                          <FiImage size={18} />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-bold text-gray-800">{item.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {item.sku ? `SKU: ${item.sku}` : ''} {item.hsn_sac ? `| HSN: ${item.hsn_sac}` : ''}
                      </div>
                    </td>
                    <td className="p-3">
                      {item.item_type === 'Service' ? (
                        <span className="text-gray-400 text-sm">-</span>
                      ) : (
                        <span className={`text-sm font-bold ${item.current_stock <= 0 ? 'text-red-500' : 'text-gray-800'}`}>
                          {item.current_stock} <span className="text-xs text-gray-500 font-medium">{item.unit}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-800">₹{item.sale_price.toFixed(2)}</td>
                    <td className="p-3 text-xs font-semibold text-gray-600">{item.tax_rate}%</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEditClick(item)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"><FiEdit2 size={14}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-1"><FiTrash2 size={14}/></button>
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
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex gap-4 mb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="item_type" value="Product" checked={formData.item_type === 'Product'} onChange={handleInputChange} className="text-green-500 focus:ring-green-500 size-3.5" />
                  <span className="text-sm font-bold text-gray-700">Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="item_type" value="Service" checked={formData.item_type === 'Service'} onChange={handleInputChange} className="text-green-500 focus:ring-green-500 size-3.5" />
                  <span className="text-sm font-bold text-gray-700">Service</span>
                </label>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="shrink-0">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                  ) : formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-300 shadow-sm">
                      <FiImage size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setImageFile(e.target.files[0])} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-600 hover:file:bg-green-100 transition-all cursor-pointer outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="e.g. Premium T-Shirt" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="e.g. TSH-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HSN/SAC Code</label>
                  <input type="text" name="hsn_sac" value={formData.hsn_sac} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="e.g. 6109" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 mt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sale Price (₹) *</label>
                  <input required type="number" name="sale_price" value={formData.sale_price} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Purchase Price (₹)</label>
                  <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-3 mt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
                  <input type="number" name="tax_rate" value={formData.tax_rate} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="18" />
                </div>
                {formData.item_type === 'Product' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Opening Stock</label>
                      <input type="number" name="current_stock" value={formData.current_stock} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                      <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="e.g. pcs, kg" />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 mt-1 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={uploading} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-70">{uploading ? 'Saving...' : editingId ? 'Update Item' : 'Save Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
