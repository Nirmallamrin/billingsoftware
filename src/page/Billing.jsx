import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiTrash2, FiFileText, FiLoader, FiCheck, FiSearch } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const Billing = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [focusedLine, setFocusedLine] = useState(null);

  const [billData, setBillData] = useState({
    party_id: "",
    customer_name: "",
    customer_phone: "",
    transaction_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
    notes: ""
  });

  const [lines, setLines] = useState([
    { id: Date.now() + Math.random(), item_id: "", item_name: "", qty: 1, unit_price: 0, tax_rate: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pData }, { data: iData }] = await Promise.all([
        supabase.from('parties').select('id, name').eq('party_type', 'Customer'),
        supabase.from('items').select('id, name, sale_price, tax_rate')
      ]);
      if (pData) setCustomers(pData);
      if (iData) setProducts(iData);
    };
    fetchData();
  }, []);

  const addLine = () => {
    setLines([...lines, { id: Date.now() + Math.random(), item_id: "", item_name: "", qty: 1, unit_price: 0, tax_rate: 0 }]);
  };

  const removeLine = (id) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    } else {
      setLines([{ id: Date.now() + Math.random(), item_id: "", item_name: "", qty: 1, unit_price: 0, tax_rate: 0 }]);
    }
  };

  const handleProductSelect = (lineId, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setLines(lines.map(line => line.id === lineId ? { 
        ...line, 
        item_id: product.id, 
        item_name: product.name, 
        unit_price: product.sale_price, 
        tax_rate: product.tax_rate 
      } : line));
    }
  };

  const handleItemNameChange = (lineId, value) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        // If user types, it clears the linked item_id making it a custom item until selected from dropdown again
        return { ...line, item_name: value, item_id: "" };
      }
      return line;
    }));
  };

  const updateLine = (id, field, value) => {
    setLines(lines.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const calculations = useMemo(() => {
    let subtotal = 0;
    let tax_amount = 0;
    lines.forEach(line => {
      const qty = parseFloat(line.qty) || 0;
      const price = parseFloat(line.unit_price) || 0;
      const tax = parseFloat(line.tax_rate) || 0;
      const lineTotal = qty * price;
      subtotal += lineTotal;
      tax_amount += lineTotal * (tax / 100);
    });
    return { subtotal, tax_amount, total: subtotal + tax_amount };
  }, [lines]);

  const handleSave = async () => {
    if (billData.party_id === "" && billData.customer_name.trim() === "") {
      alert("Please enter a customer name for the regular customer.");
      return;
    }
    const validLines = lines.filter(l => l.item_name.trim() !== "");
    if (validLines.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('invox_user'));
      if (!storedUser) throw new Error("Not logged in");

      // Insert Transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: storedUser.id,
          type: 'Sale',
          party_id: billData.party_id || null,
          customer_name: billData.party_id === "" ? billData.customer_name : null,
          customer_phone: billData.party_id === "" ? billData.customer_phone : null,
          transaction_number: billData.transaction_number,
          date: billData.date,
          due_date: billData.dueDate,
          subtotal: calculations.subtotal,
          tax_amount: calculations.tax_amount,
          total_amount: calculations.total,
          notes: billData.notes,
          status: 'Unpaid'
        }])
        .select()
        .single();
        
      if (txError) throw txError;

      // Insert Lines
      const linesToInsert = validLines.map(l => ({
        transaction_id: txData.id,
        item_id: l.item_id || null,
        item_name: l.item_name,
        quantity: parseFloat(l.qty) || 0,
        unit_price: parseFloat(l.unit_price) || 0,
        tax_rate: parseFloat(l.tax_rate) || 0,
        tax_amount: (parseFloat(l.qty) * parseFloat(l.unit_price) * (parseFloat(l.tax_rate) / 100)) || 0,
        total_amount: (parseFloat(l.qty) * parseFloat(l.unit_price) * (1 + parseFloat(l.tax_rate)/100)) || 0
      }));

      const { error: linesError } = await supabase.from('transaction_items').insert(linesToInsert);
      if (linesError) throw linesError;

      // Update stock for items
      for (const l of validLines) {
        if (l.item_id) {
          const { data: itemData } = await supabase.from('items').select('current_stock').eq('id', l.item_id).single();
          if (itemData) {
            const newStock = Number(itemData.current_stock) - Number(l.qty);
            await supabase.from('items').update({ current_stock: newStock }).eq('id', l.item_id);
          }
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setBillData({
          party_id: "",
          customer_name: "",
          customer_phone: "",
          transaction_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
          notes: ""
        });
        setLines([{ id: Date.now(), item_id: "", item_name: "", qty: 1, unit_price: 0, tax_rate: 0 }]);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Error saving invoice: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiFileText className="text-purple-500" /> Create Sale Invoice
          </h2>
          <p className="text-gray-500 text-xs mt-1">Generate a new bill for your customers.</p>
        </div>
      </div>
          

          {/* header selections */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Customer *</label>
            <select 
              value={billData.party_id}
              onChange={(e) => setBillData({...billData, party_id: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700"
            >
              <option value="">Regular Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {billData.party_id === "" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Customer Name *</label>
                <input 
                  type="text" 
                  placeholder="Walk-in Customer"
                  value={billData.customer_name}
                  onChange={(e) => setBillData({...billData, customer_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 9876543210"
                  value={billData.customer_phone}
                  onChange={(e) => setBillData({...billData, customer_phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Invoice Number</label>
            <input 
              type="text" 
              value={billData.transaction_number}
              onChange={(e) => setBillData({...billData, transaction_number: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Invoice Date</label>
            <input 
              type="date" 
              value={billData.date}
              onChange={(e) => setBillData({...billData, date: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
            <input 
              type="date" 
              value={billData.dueDate}
              onChange={(e) => setBillData({...billData, dueDate: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 w-24 text-center">Qty</th>
                <th className="px-6 py-4 w-32 text-right">Rate (₹)</th>
                <th className="px-6 py-4 w-24 text-right">Tax %</th>
                <th className="px-6 py-4 w-32 text-right">Total (₹)</th>
                <th className="px-4 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lines.map((line) => {
                const lineTotal = (parseFloat(line.qty) || 0) * (parseFloat(line.unit_price) || 0) * (1 + (parseFloat(line.tax_rate) || 0) / 100);
                return (
                  <tr key={line.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2 relative">
                      <input 
                        type="text"
                        placeholder="Type item name..."
                        value={line.item_name}
                        onChange={(e) => handleItemNameChange(line.id, e.target.value)}
                        onFocus={() => setFocusedLine(line.id)}
                        onBlur={() => setTimeout(() => setFocusedLine(null), 200)}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-800"
                      />
                      {focusedLine === line.id && (
                        <div className="absolute z-50 left-4 right-4 top-full mt-1 bg-white border border-gray-200 shadow-xl rounded-xl max-h-48 overflow-y-auto">
                          {products.filter(p => p.name.toLowerCase().includes((line.item_name || "").toLowerCase())).map(p => (
                            <div 
                              key={p.id}
                              className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm font-semibold text-gray-800 border-b border-gray-50 last:border-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleProductSelect(line.id, p.id);
                                setFocusedLine(null);
                              }}
                            >
                              {p.name} <span className="text-xs text-gray-400 font-normal ml-2">₹{p.sale_price}</span>
                            </div>
                          ))}
                          {products.filter(p => p.name.toLowerCase().includes((line.item_name || "").toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-xs text-gray-500 italic">Press enter or tab to use as custom item</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-center text-gray-800" 
                        value={line.qty}
                        onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-right text-gray-800" 
                        value={line.unit_price}
                        onChange={(e) => updateLine(line.id, 'unit_price', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-right text-gray-600" 
                        value={line.tax_rate}
                        onChange={(e) => updateLine(line.id, 'tax_rate', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-gray-800">
                      {lineTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => removeLine(line.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
             <button 
              onClick={addLine}
              className="px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-all flex items-center gap-2"
            >
              <FiPlus /> Add Line
            </button>
            <div className="mt-6">
              <label className="text-xs font-bold text-gray-500 uppercase">Notes / Terms</label>
              <textarea 
                value={billData.notes}
                onChange={(e) => setBillData({...billData, notes: e.target.value})}
                className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium text-gray-700 min-h-[80px]"
                placeholder="Payment terms, bank details, etc."
              />
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-gray-800">₹{calculations.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Tax</span>
              <span className="text-lg font-bold text-gray-800">₹{calculations.tax_amount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-200 w-full my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-black text-gray-800">Total</span>
              <span className="text-2xl font-black text-purple-600">₹{calculations.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`${success ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'} text-white px-10 py-3 rounded-xl font-bold text-lg shadow-xl shadow-purple-600/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isSaving ? <FiLoader className="animate-spin" /> : success ? <FiCheck /> : 'Save Invoice'}
        </button>
      </div>
    </div>
  );
};

export default Billing;