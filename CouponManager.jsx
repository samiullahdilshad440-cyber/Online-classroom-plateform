import { useState, useEffect } from 'react';
import axios from 'axios';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    discountAmount: '',
    maxUses: '',
    expiresAt: ''
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/api/admin/coupons');
      setCoupons(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: formData.code,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      expiresAt: formData.expiresAt || undefined
    };
    if (formData.discountPercent) payload.discountPercent = parseInt(formData.discountPercent);
    if (formData.discountAmount) payload.discountAmount = parseInt(formData.discountAmount);

    try {
      if (editingId) {
        await axios.put(`/api/admin/coupons/${editingId}`, payload);
      } else {
        await axios.post('/api/admin/coupons', payload);
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent || '',
      discountAmount: coupon.discountAmount || '',
      maxUses: coupon.maxUses || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`/api/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ code: '', discountPercent: '', discountAmount: '', maxUses: '', expiresAt: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-text mb-1">COUPONS</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            // Discount code management
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
        >
          {showForm ? 'Cancel' : '+ New Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border rounded-lg bg-bg space-y-4 max-w-xl">
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Discount Amount</label>
              <input
                type="number"
                min="0"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Max Uses</label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Expires At</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
          >
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {coupons.map(coupon => (
          <div key={coupon._id} className={`p-4 border rounded-lg bg-bg hover:border-accent transition-all ${
            isExpired(coupon.expiresAt) ? 'border-red-500/50 opacity-60' : 'border-border'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-mono text-accent text-xl font-bold">{coupon.code}</span>
                <div>
                  <h3 className="font-display text-lg text-text">
                    {coupon.discountPercent
                      ? `${coupon.discountPercent}% off`
                      : `₨ ${coupon.discountAmount} off`}
                  </h3>
                  <p className="text-text-muted font-mono text-xs">
                    Used: {coupon.usedCount} / {coupon.maxUses || '∞'}
                    {coupon.expiresAt && ` • Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                    {isExpired(coupon.expiresAt) && <span className="text-red-500 ml-2">[EXPIRED]</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-accent hover:text-accent transition-all uppercase"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-red-500 hover:text-red-500 transition-all uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponManager;