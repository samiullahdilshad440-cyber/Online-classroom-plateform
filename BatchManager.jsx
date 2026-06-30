import { useState, useEffect } from 'react';
import axios from 'axios';

const BatchManager = () => {
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', departmentId: '', startYear: 2024, expectedGraduationYear: 2028
  });

  useEffect(() => {
    fetchBatches();
    fetchDepartments();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      setBatches(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/batches/${editingId}`, formData);
      } else {
        await axios.post('/api/batches', formData);
      }
      resetForm();
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (batch) => {
    setFormData({
      name: batch.name,
      departmentId: batch.departmentId._id,
      startYear: batch.startYear,
      expectedGraduationYear: batch.expectedGraduationYear
    });
    setEditingId(batch._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch?')) return;
    try {
      await axios.delete(`/api/batches/${id}`);
      fetchBatches();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', departmentId: '', startYear: 2024, expectedGraduationYear: 2028 });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-text mb-1">BATCHES</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            // Cohort management
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
        >
          {showForm ? 'Cancel' : '+ New Batch'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border rounded-lg bg-bg space-y-4 max-w-xl">
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Name (e.g. FA23)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Department</label>
            <select
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Start Year</label>
              <input
                type="number"
                required
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Graduation Year</label>
              <input
                type="number"
                required
                value={formData.expectedGraduationYear}
                onChange={(e) => setFormData({ ...formData, expectedGraduationYear: parseInt(e.target.value) })}
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
        {batches.map(batch => (
          <div key={batch._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-bg hover:border-accent transition-all">
            <div className="flex items-center gap-4">
              <span className="font-mono text-accent text-xl font-bold">{batch.name}</span>
              <div>
                <h3 className="font-display text-lg text-text">
                  {batch.departmentId?.name || 'Unknown Dept'}
                </h3>
                <p className="text-text-muted font-mono text-xs">
                  {batch.startYear} → {batch.expectedGraduationYear}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(batch)}
                className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-accent hover:text-accent transition-all uppercase"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(batch._id)}
                className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-red-500 hover:text-red-500 transition-all uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchManager;