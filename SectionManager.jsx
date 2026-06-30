import { useState, useEffect } from 'react';
import axios from 'axios';

const SectionManager = () => {
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', batchId: '', semester: 1, advisorId: ''
  });

  useEffect(() => {
    fetchSections();
    fetchBatches();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await axios.get('/api/sections');
      setSections(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      setBatches(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/sections/${editingId}`, formData);
      } else {
        await axios.post('/api/sections', formData);
      }
      resetForm();
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (section) => {
    setFormData({
      name: section.name,
      batchId: section.batchId._id,
      semester: section.semester,
      advisorId: section.advisorId?._id || ''
    });
    setEditingId(section._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this section?')) return;
    try {
      await axios.delete(`/api/sections/${id}`);
      fetchSections();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', batchId: '', semester: 1, advisorId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-text mb-1">SECTIONS</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            // Class group management
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
        >
          {showForm ? 'Cancel' : '+ New Section'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border rounded-lg bg-bg space-y-4 max-w-xl">
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Name (e.g. 6D)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Batch</label>
            <select
              required
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Select Batch</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} - {b.departmentId?.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Semester</label>
            <input
              type="number"
              required
              min="1"
              max="8"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
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
        {sections.map(section => (
          <div key={section._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-bg hover:border-accent transition-all">
            <div className="flex items-center gap-4">
              <span className="font-mono text-accent text-xl font-bold">{section.name}</span>
              <div>
                <h3 className="font-display text-lg text-text">
                  Semester {section.semester} • {section.batchId?.name}
                </h3>
                {section.advisorId && (
                  <p className="text-text-muted font-mono text-xs">
                    Advisor: {section.advisorId.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(section)}
                className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-accent hover:text-accent transition-all uppercase"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(section._id)}
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

export default SectionManager;