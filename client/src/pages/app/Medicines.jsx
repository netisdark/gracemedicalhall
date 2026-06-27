import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SkeletonTable } from '../../components/Skeleton.jsx';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Medicines = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // '', 'lowStock', 'expiringSoon', 'expired'
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form, setForm] = useState({
    name: '', company: '', batchNo: '', 
    productionDate: '', expiryDate: '', 
    stock: '', price: '', discount: ''
  });

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines', {
        params: { search, filter }
      });
      if (res.data && res.data.success) {
        setMedicines(res.data.data.medicines);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      toast.error('Failed to retrieve inventory list.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search logic
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      fetchMedicines();
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search, filter]);

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setForm({
      name: '', company: '', batchNo: '', 
      productionDate: '', expiryDate: '', 
      stock: 0, price: 0, discount: 0
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    // Format dates to YYYY-MM-DD for HTML input binding
    const prodD = med.productionDate ? new Date(med.productionDate).toISOString().split('T')[0] : '';
    const expD = med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : '';
    
    setForm({
      name: med.name,
      company: med.company,
      batchNo: med.batchNo,
      productionDate: prodD,
      expiryDate: expD,
      stock: med.stock,
      price: med.price,
      discount: med.discount
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        // Edit API call
        const res = await api.put(`/medicines/${editingMedicine._id}`, form);
        if (res.data.success) {
          toast.success('Medicine record updated!');
          setModalOpen(false);
          fetchMedicines();
        }
      } else {
        // Create API call
        const res = await api.post('/medicines', form);
        if (res.data.success) {
          toast.success('Medicine added successfully!');
          setModalOpen(false);
          fetchMedicines();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save medicine record.';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine record?')) return;
    try {
      const res = await api.delete(`/medicines/${id}`);
      if (res.data.success) {
        toast.success('Medicine deleted from inventory.');
        fetchMedicines();
      }
    } catch (error) {
      toast.error('Deletion failed.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">Medicine Inventory</h1>
          <p className="text-xs text-text-secondary dark:text-slate-400">Total {total} medicine records cataloged</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft shadow-primary/20 active:scale-95 duration-100"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Medicine</span>
          </button>
        )}
      </div>

      {/* 2. Search & Filter Pills */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine name or manufacturer..."
            className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: '', label: 'All Catalog' },
            { id: 'lowStock', label: 'Low Stock' },
            { id: 'expiringSoon', label: 'Expiring Soon' },
            { id: 'expired', label: 'Expired' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white hover:bg-slate-50 text-text-secondary dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid Table */}
      {loading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : (
        <div className="w-full overflow-hidden glass-card border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-text-secondary dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="p-4">Name</th>
                  <th className="p-4">Manufacturer</th>
                  <th className="p-4">Batch No</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Discount</th>
                  {isAdmin && <th className="p-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {medicines.length > 0 ? (
                  medicines.map((med) => {
                    const isLow = med.stock <= 10;
                    const isExp = new Date(med.expiryDate) < new Date();
                    const isSoon = !isExp && new Date(med.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 30));

                    return (
                      <tr key={med._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 text-text-primary dark:text-white capitalize font-bold">{med.name}</td>
                        <td className="p-4 text-text-secondary dark:text-slate-300">{med.company}</td>
                        <td className="p-4 text-xs font-mono">{med.batchNo}</td>
                        <td className="p-4 text-xs">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            isExp ? 'text-danger' : isSoon ? 'text-amber-500' : 'text-text-secondary dark:text-slate-300'
                          }`}>
                            {new Date(med.expiryDate).toLocaleDateString()}
                            {isExp && <AlertCircle className="h-3.5 w-3.5" title="Expired" />}
                            {isSoon && <AlertTriangle className="h-3.5 w-3.5 animate-pulse" title="Expiring within 30 days" />}
                          </span>
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            isLow ? 'bg-amber-500/10 text-amber-500' : 'text-text-secondary dark:text-slate-300'
                          }`}>
                            {med.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-xs text-text-primary dark:text-white font-bold">Rs. {med.price.toFixed(2)}</td>
                        <td className="p-4 text-xs text-emerald-500">{med.discount}%</td>
                        {isAdmin && (
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(med)}
                                className="p-1.5 rounded-lg text-text-secondary hover:bg-slate-100 hover:text-text-primary dark:hover:bg-slate-800 dark:hover:text-white"
                                title="Edit"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(med._id)}
                                className="p-1.5 rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Delete"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="p-12 text-center text-xs text-text-secondary dark:text-slate-400">
                      No matching medicine records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CRUD Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="w-full max-w-lg glass-card border border-slate-100 dark:border-slate-800 shadow-premium p-6 sm:p-8 relative z-10 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>{editingMedicine ? 'Modify Medicine Details' : 'Catalog New Medicine'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({...form, company: e.target.value})}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={form.batchNo}
                  onChange={(e) => setForm({...form, batchNo: e.target.value})}
                  className="w-full h-10 px-3.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Production Date</label>
                <input
                  type="date"
                  value={form.productionDate}
                  onChange={(e) => setForm({...form, productionDate: e.target.value})}
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({...form, stock: e.target.value})}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Price (NPR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Discount Rate (%)</label>
                <input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({...form, discount: e.target.value})}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                className="col-span-2 w-full h-11 mt-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft active:scale-98"
              >
                <span>Save Medicine Record</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Medicines;
