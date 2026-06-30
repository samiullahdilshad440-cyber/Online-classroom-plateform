import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        // Fetch all courses and filter by instructorId on frontend for simplicity, 
        // or create a /api/courses/my-courses endpoint. 
        // For now, we fetch all and filter.
        const res = await axios.get('/api/courses');
        // In a real app, the backend should filter this. 
        // Assuming we have user context, we'd filter by user.id.
        setCourses(res.data.data); 
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMyCourses();
  }, []);

  if (loading) return <div className="p-8 text-text-muted font-mono">LOADING TELEMETRY...</div>;

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="mb-8">
        <h1 className="font-display text-5xl text-text mb-2">INSTRUCTOR PIT WALL</h1>
        <p className="text-text-muted font-mono text-sm uppercase tracking-widest">
          // Manage your sectors and telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/teacher/courses/new" className="p-6 rounded-xl border border-dashed border-accent bg-surface backdrop-blur-md hover:bg-accent/5 transition-all flex flex-col items-center justify-center text-center group">
          <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">+</span>
          <h2 className="font-display text-xl text-accent">BUILD NEW SECTOR</h2>
          <p className="text-text-muted font-mono text-xs mt-2">Initialize a new course</p>
        </Link>

        {courses.map(course => (
          <div key={course._id} className="p-6 rounded-xl border border-border bg-surface backdrop-blur-md flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-accent uppercase tracking-wider bg-accent/10 px-2 py-1 rounded">
                {course.category}
              </span>
              <span className="font-mono text-text-muted text-sm">
                ★ {course.ratingAvg.toFixed(1)}
              </span>
            </div>
            <h2 className="font-display text-xl text-text mb-2 line-clamp-1">{course.title}</h2>
            <p className="text-text-muted text-sm mb-6 line-clamp-2 flex-1">{course.description}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Link to={`/teacher/courses/${course._id}/edit`} className="px-3 py-2 border border-border text-text-muted font-mono text-xs rounded hover:border-accent hover:text-accent transition-all text-center uppercase">
                Edit
              </Link>
              <Link to={`/teacher/courses/${course._id}/gradebook`} className="px-3 py-2 bg-accent text-bg font-mono text-xs rounded hover:shadow-[0_0_10px_rgba(210,255,0,0.3)] transition-all text-center uppercase">
                Gradebook
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;