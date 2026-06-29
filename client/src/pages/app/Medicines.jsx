import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SkeletonTable } from '../../components/Skeleton.jsx';
import { 
  Plus, Search, Edit3, Trash2, AlertCircle, AlertTriangle, X, Sparkles, PackageOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const PACK_TYPES = ['Tablet', 'Strip', 'Capsule', 'Packet', 'Tube', 'Bottle', 'Vial', 'Ampoule', 'Sachet', 'Syrup', 'Cream', 'Drops', 'Inhaler', 'Patch', 'Other'];

const emptyForm = {
  sn: '', description: '', pack: '', batch: '',
  productionDate: '', expiryDate: '',
  qty: '', costRate: '', amount: '', mrp: '', discount: '0', remarks: ''
};

const inputCls = 'w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all';

const Medicines = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines', { params: { search, filter } });
      if (res.data?.success) {
        setMedicines(res.data.data.medicines);
        setTotal(res.data.data.total);
      }
    } catch {
      toast.error('Failed to retrieve inventory list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => fetchMedicines(), 400);
    return () => clearTimeout(handler);
  }, [search, filter]);

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    setForm({
      sn: med.sn || '',
      description: med.description || '',
      pack: med.pack || '',
      batch: med.batch || '',
      productionDate: med.productionDate ? new Date(med.productionDate).toISOString().split('T')[0] : '',
      expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : '',
      qty: med.qty ?? '',
      costRate: med.costRate ?? '',
      amount: med.amount ?? '',
      mrp: med.mrp ?? '',
      discount: med.discount ?? 0,
      remarks: med.remarks || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        const res = await api.put(`/medicines/${editingMedicine._id}`, form);
        if (res.data.success) { toast.success('Medicine record updated!'); setModalOpen(false); fetchMedicines(); }
      } else {
        const res = await api.post('/medicines', form);
        if (res.data.success) { toast.success('Medicine added successfully!'); setModalOpen(false); fetchMedicines(); }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medicine record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine record?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success('Medicine deleted.'); fetchMedicines();
    } catch { toast.error('Deletion failed.'); }
  };

  // Columns: SN, ITEM DESC, PACK, BATCH, EXPIRY, QTY, MRP, DISC%, REMARKS, [CC/RATE, AMOUNT admin only], Actions
  const colSpan = isAdmin ? 11 : 9;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
            <PackageOpen className="h-7 w-7 text-primary" />
            Medicine Inventory
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">{total} medicine records cataloged</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft shadow-primary/20 active:scale-95"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Medicine
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, SN, or pack..."
            className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: '', label: 'All' },
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

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={8} cols={colSpan} />
      ) : (
        <div className="w-full overflow-hidden glass-card border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-text-secondary dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="p-3">SN</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Pack</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">QTY</th>
                  {isAdmin && <th className="p-3">CC/Rate</th>}
                  {isAdmin && <th className="p-3">Amount</th>}
                  <th className="p-3">MRP</th>
                  <th className="p-3">Disc%</th>
                  <th className="p-3">Remarks</th>
                  {isAdmin && <th className="p-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {medicines.length > 0 ? (
                  medicines.map((med) => {
                    const isLow = (med.qty ?? 0) <= 10;
                    const isExp = new Date(med.expiryDate) < new Date();
                    const isSoon = !isExp && new Date(med.expiryDate) <= new Date(Date.now() + 30 * 86400000);
                    return (
                      <tr key={med._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-3 text-xs font-mono text-text-secondary dark:text-slate-400">{med.sn}</td>
                        <td className="p-3 font-bold text-text-primary dark:text-white">{med.description}</td>
                        <td className="p-3 text-xs text-text-secondary dark:text-slate-300">{med.pack}</td>
                        <td className="p-3 text-xs font-mono">{med.batch}</td>
                        <td className="p-3 text-xs">
                          <span className={`inline-flex items-center gap-1 font-bold ${isExp ? 'text-danger' : isSoon ? 'text-amber-500' : 'text-text-secondary dark:text-slate-300'}`}>
                            {new Date(med.expiryDate).toLocaleDateString()}
                            {isExp && <AlertCircle className="h-3.5 w-3.5" />}
                            {isSoon && <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />}
                          </span>
                        </td>
                        <td className="p-3 text-xs">
                          <span className={`px-2 py-0.5 rounded font-bold ${isLow ? 'bg-amber-500/10 text-amber-500' : 'text-text-secondary dark:text-slate-300'}`}>
                            {med.qty}
                          </span>
                        </td>
                        {isAdmin && <td className="p-3 text-xs text-text-primary dark:text-white">Rs. {(med.costRate ?? 0).toFixed(2)}</td>}
                        {isAdmin && <td className="p-3 text-xs text-text-primary dark:text-white">Rs. {(med.amount ?? 0).toFixed(2)}</td>}
                        <td className="p-3 text-xs font-bold text-text-primary dark:text-white">Rs. {(med.mrp ?? 0).toFixed(2)}</td>
                        <td className="p-3 text-xs text-emerald-500 font-bold">{med.discount ?? 0}%</td>
                        <td className="p-3 text-xs text-text-secondary dark:text-slate-400 max-w-[120px] truncate">{med.remarks || '—'}</td>
                        {isAdmin && (
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleOpenEdit(med)} className="p-1.5 rounded-lg text-text-secondary hover:bg-slate-100 hover:text-text-primary dark:hover:bg-slate-800 dark:hover:text-white" title="Edit">
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(med._id)} className="p-1.5 rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-950/20" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={colSpan} className="p-12 text-center text-xs text-text-secondary dark:text-slate-400">
                      No matching medicine records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (admin only) */}
      {modalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="w-full max-w-2xl glass-card border border-slate-100 dark:border-slate-800 shadow-premium p-6 relative z-10 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {editingMedicine ? 'Edit Medicine Record' : 'Catalog New Medicine'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              {/* Row 1: SN + Description */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">SN</label>
                <input type="text" value={form.sn} onChange={(e) => setForm({...form, sn: e.target.value})} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Item Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className={inputCls} required />
              </div>

              {/* Row 2: Pack + Batch */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Pack</label>
                <select value={form.pack} onChange={(e) => setForm({...form, pack: e.target.value})} className={inputCls} required>
                  <option value="">Select pack type...</option>
                  {PACK_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Batch</label>
                <input type="text" value={form.batch} onChange={(e) => setForm({...form, batch: e.target.value})} className={`${inputCls} font-mono`} required />
              </div>

              {/* Row 3: Production + Expiry */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Production Date</label>
                <input type="date" value={form.productionDate} onChange={(e) => setForm({...form, productionDate: e.target.value})} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} className={inputCls} required />
              </div>

              {/* Row 4: QTY + MRP */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">QTY</label>
                <input type="number" min="0" value={form.qty} onChange={(e) => setForm({...form, qty: e.target.value})} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">MRP (Rs.)</label>
                <input type="number" step="0.01" min="0" value={form.mrp} onChange={(e) => setForm({...form, mrp: e.target.value})} className={inputCls} required />
              </div>

              {/* Row 5: CC/Rate + Amount (admin only - always shown in form since only admin opens modal) */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">CC / Cost Rate (Rs.)</label>
                <input type="number" step="0.01" min="0" value={form.costRate} onChange={(e) => setForm({...form, costRate: e.target.value})} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Cost Amount (Rs.)</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className={inputCls} required />
              </div>

              {/* Row 6: Discount + Remarks */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Disc %</label>
                <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({...form, discount: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Remarks</label>
                <input type="text" value={form.remarks} onChange={(e) => setForm({...form, remarks: e.target.value})} className={inputCls} placeholder="Optional" />
              </div>

              <button
                type="submit"
                className="col-span-2 w-full h-11 mt-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft active:scale-98"
              >
                Save Medicine Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
