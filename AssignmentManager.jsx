import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AssignmentManager = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: '', maxPoints: 100
  });

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`/api/assignments/course/${courseId}`);
      setAssignments(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/assignments', { ...formData, courseId });
      setShowForm(false);
      setFormData({ title: '', description: '', dueDate: '', maxPoints: 100 });
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await axios.delete(`/api/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl text-text mb-1">ASSIGNMENTS</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">// Manage deliverables</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
        >
          {showForm ? 'Cancel' : '+ New Assignment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border rounded-lg bg-bg space-y-4">
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Due Date</label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-mono uppercase mb-1">Max Points</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
          >
            Deploy Assignment
          </button>
        </form>
      )}

      <div className="space-y-4">
        {assignments.map(assignment => (
          <div key={assignment._id} className="p-6 border border-border rounded-lg bg-bg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-display text-xl text-text mb-1">{assignment.title}</h3>
                <p className="text-text-muted text-sm">{assignment.description}</p>
              </div>
              <button
                onClick={() => handleDelete(assignment._id)}
                className="text-red-500 font-mono text-xs hover:underline uppercase"
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="font-mono text-text-muted">Due:</span>
              <CountdownTimer dueDate={assignment.dueDate} />
              <span className="font-mono text-accent">{assignment.maxPoints} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentManager;