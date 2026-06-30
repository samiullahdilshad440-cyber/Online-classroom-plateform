import { useState, useEffect } from 'react';
import axios from 'axios';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => { fetchDepartments(); }, []);

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
        await axios.put(`/api/departments/${editingId}`, formData);
      } else {
        await axios.post('/api/departments', formData);
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (dept) => {
    setFormData({ name: dept.name, code: dept.code });
    setEditingId(dept._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await axios.delete(`/api/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-text mb-1">DEPARTMENTS</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            // Academic structure management
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
        >
          {showForm ? 'Cancel' : '+ New Department'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border rounded-lg bg-bg space-y-4 max-w-xl">
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
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
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
          >
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {departments.map(dept => (
          <div key={dept._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-bg hover:border-accent transition-all">
            <div className="flex items-center gap-4">
              <span className="font-mono text-accent text-xl font-bold">{dept.code}</span>
              <div>
                <h3 className="font-display text-lg text-text">{dept.name}</h3>
                {dept.headOfDepartment && (
                  <p className="text-text-muted font-mono text-xs">
                    HOD: {dept.headOfDepartment.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(dept)}
                className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-accent hover:text-accent transition-all uppercase"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dept._id)}
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

export default DepartmentManager;