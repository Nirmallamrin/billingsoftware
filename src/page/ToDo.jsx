import React, { useState, useEffect } from "react";
import { FiCheckSquare, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiLoader, FiCalendar, FiClock, FiFlag } from "react-icons/fi";
import { supabase } from "../SupabaseClient";

const ToDo = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    status: "pending"
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchTodos = async () => {
      const storedUser = JSON.parse(localStorage.getItem('invox_user'));
      if (!storedUser) return;
      setUser(storedUser);

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', storedUser.id)
        .order('created_at', { ascending: false });

      if (data) {
        setTodos(data);
      } else if (error && error.code === '42P01') {
         // Table does not exist yet. Handle gracefully.
         console.warn("Todos table does not exist yet. Please run the SQL migration.");
      }
      setLoading(false);
    };

    fetchTodos();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (todo = null) => {
    if (todo) {
      setEditingTodo(todo);
      setFormData({
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority,
        due_date: todo.due_date ? todo.due_date.split('T')[0] : "",
        status: todo.status
      });
    } else {
      setEditingTodo(null);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        status: "pending"
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingTodo) {
        // Update existing
        const { data, error } = await supabase
          .from('todos')
          .update({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date || null,
            status: formData.status,
            updated_at: new Date()
          })
          .eq('id', editingTodo.id)
          .select()
          .single();

        if (error) throw error;
        setTodos(todos.map(t => t.id === editingTodo.id ? data : t));
      } else {
        // Create new
        const { data, error } = await supabase
          .from('todos')
          .insert([{
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date || null,
            status: formData.status
          }])
          .select()
          .single();

        if (error) throw error;
        setTodos([data, ...todos]);
      }
      closeModal();
    } catch (err) {
      alert("Error saving task: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      alert("Error deleting task: " + err.message);
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', todo.id)
        .select()
        .single();

      if (error) throw error;
      setTodos(todos.map(t => t.id === todo.id ? data : t));
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filterStatus === "all") return true;
    return todo.status === filterStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center text-gray-400"><FiLoader className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiCheckSquare className="text-blue-500" /> Task Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Organize, prioritize, and track your daily tasks.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            className="p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-blue-500 transition-colors"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => openModal()}
            className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 transition-all w-full sm:w-auto justify-center"
          >
            <FiPlus /> New Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTodos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckSquare className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No tasks found</h3>
            <p className="text-gray-500 mt-2">You're all caught up! Click 'New Task' to add something to your plate.</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div key={todo.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col sm:flex-row gap-4 sm:items-center justify-between group ${todo.status === 'completed' ? 'border-gray-200 opacity-60 grayscale-[0.5]' : 'border-gray-100 border-l-4 border-l-blue-500'}`}>
              
              {/* Left Side: Checkbox & Content */}
              <div className="flex items-start gap-4 flex-1">
                <button 
                  onClick={() => toggleStatus(todo)}
                  className={`mt-1 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${todo.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500 text-transparent'}`}
                >
                  <FiCheck size={14} />
                </button>
                <div className="flex flex-col gap-1.5 flex-1">
                  <h3 className={`text-lg font-bold ${todo.status === 'completed' ? 'text-gray-500 line-through decoration-2 decoration-gray-400' : 'text-gray-800'}`}>
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{todo.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(todo.priority)}`}>
                      {todo.priority} Priority
                    </span>
                    {todo.due_date && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <FiCalendar size={12} />
                        {new Date(todo.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {todo.status === 'in-progress' && (
                      <span className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        <FiClock size={12} /> In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                <button onClick={() => openModal(todo)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <FiEdit2 size={18} />
                </button>
                <button onClick={() => handleDelete(todo.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-100 p-2 rounded-full transition-colors">
              <FiX size={20} />
            </button>
            
            <h3 className="text-2xl font-black text-gray-800 mb-6">
              {editingTodo ? 'Edit Task' : 'Create New Task'}
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Follow up with client"
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add details about this task..."
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] bg-gray-50/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><FiFlag size={14}/> Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><FiClock size={14}/> Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><FiCalendar size={14}/> Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 text-gray-700"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  {editingTodo ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ToDo;
