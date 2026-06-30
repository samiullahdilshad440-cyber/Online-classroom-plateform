import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const AnnouncementManager = () => {
  const { courseId } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', body: '', pinned: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId]);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`/api/announcements/course/${courseId}`);
      setAnnouncements(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/announcements', { ...formData, courseId });
      setShowForm(false);
      setFormData({ title: '', body: '', pinned: false });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <Link to="/teacher/dashboard" className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
        ← BACK TO PIT WALL
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl text-text mb-1">TRANSMISSIONS</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">// Course announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
        >
          {showForm ? 'Cancel' : '+ New Transmission'}
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
            <label className="block text-text-muted text-xs font-mono uppercase mb-1">Message</label>
            <textarea
              rows="4"
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="accent-accent"
            />
            <label htmlFor="pinned" className="text-text font-mono text-sm">Pin to top</label>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
          >
            Broadcast
          </button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map(announcement => (
          <div
            key={announcement._id}
            className={`p-6 rounded-lg border bg-bg ${
              announcement.pinned ? 'border-accent' : 'border-border'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {announcement.pinned && (
                    <span className="text-accent font-mono text-xs uppercase tracking-widest">📌 PINNED</span>
                  )}
                  <h3 className="font-display text-xl text-text">{announcement.title}</h3>
                </div>
                <p className="text-text-muted font-mono text-xs">
                  {new Date(announcement.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(announcement._id)}
                className="text-red-500 font-mono text-xs hover:underline uppercase"
              >
                Delete
              </button>
            </div>
            <p className="text-text text-sm">{announcement.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementManager;