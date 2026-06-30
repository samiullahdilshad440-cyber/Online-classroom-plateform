import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const AnnouncementList = () => {
  const { courseId } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`/api/announcements/course/${courseId}`);
        setAnnouncements(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAnnouncements();
  }, [courseId]);

  if (loading) return <div className="p-8 text-text-muted font-mono">LOADING TRANSMISSIONS...</div>;

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <Link to={`/student/courses/${courseId}`} className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
        ← BACK TO SECTOR
      </Link>

      <h1 className="font-display text-4xl text-text mb-2">TRANSMISSIONS</h1>
      <p className="text-text-muted font-mono text-sm mb-8 uppercase tracking-widest">// Course announcements</p>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-xl text-center">
            <p className="text-text-muted font-mono">NO TRANSMISSIONS YET</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement._id}
              className={`p-6 rounded-xl border bg-surface backdrop-blur-md ${
                announcement.pinned ? 'border-accent' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {announcement.pinned && (
                      <span className="text-accent font-mono text-xs uppercase tracking-widest">📌 PINNED</span>
                    )}
                    <h3 className="font-display text-xl text-text">{announcement.title}</h3>
                  </div>
                  <p className="text-text-muted font-mono text-xs">
                    By {announcement.authorId.name} • {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-text text-sm leading-relaxed">{announcement.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementList;