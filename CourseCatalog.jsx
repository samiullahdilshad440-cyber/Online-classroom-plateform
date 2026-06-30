import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CourseCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('ratingAvg');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses');
        setCourses(res.data.data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Extract unique categories for filter
  const categories = [...new Set(courses.map(c => c.category))];

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'ratingAvg') return b.ratingAvg - a.ratingAvg;
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleEnroll = async (e, course) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login to enroll');
      navigate('/login');
      return;
    }

    // Check if already enrolled
    if (user.enrolledCourses?.some(ec => ec.courseId === course._id)) {
      navigate(`/student/courses/${course._id}/player`);
      return;
    }

    // Free course → direct enrollment
    if (course.price === 0) {
      setEnrollingId(course._id);
      try {
        await axios.post(`/api/enrollments/${course._id}`);
        alert('Successfully enrolled! Check your dashboard.');
        // Refresh user data
        window.location.reload();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to enroll');
      } finally {
        setEnrollingId(null);
      }
    } else {
      // Paid course → redirect to checkout
      navigate(`/student/checkout/${course._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-accent font-mono text-xl animate-pulse">
          LOADING CATALOG...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/student/dashboard" className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
          ← BACK TO PIT WALL
        </Link>
        <h1 className="font-display text-5xl text-text mb-2">COURSE CATALOG</h1>
        <p className="text-text-muted font-mono text-sm uppercase tracking-widest">
          // Select your next sector • {filteredCourses.length} available
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 border border-border rounded-lg bg-surface backdrop-blur-md">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-bg border border-border rounded px-4 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-bg border border-border rounded px-4 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-bg border border-border rounded px-4 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
        >
          <option value="ratingAvg">Top Rated</option>
          <option value="price">Price: Low to High</option>
          <option value="title">Alphabetical</option>
        </select>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-xl text-center">
          <p className="text-text-muted font-mono">NO COURSES MATCH YOUR FILTERS</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isEnrolled = user?.enrolledCourses?.some(ec => ec.courseId === course._id);
            const isEnrolling = enrollingId === course._id;

            return (
              <div
                key={course._id}
                className="group p-6 rounded-xl border border-border bg-surface backdrop-blur-md hover:border-accent hover:shadow-[0_0_20px_rgba(210,255,0,0.1)] transition-all duration-300 flex flex-col"
              >
                {/* Metadata */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-accent uppercase tracking-wider bg-accent/10 px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="font-mono text-text-muted text-sm">
                    {course.price === 0 ? 'FREE' : `₨${course.price}`}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display text-2xl text-text mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {course.title}
                </h2>

                {/* Description */}
                <p className="text-text-muted text-sm mb-4 line-clamp-3 flex-1">
                  {course.description}
                </p>

                {/* Rating */}
                {course.ratingCount > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-accent">★</span>
                    <span className="font-mono text-sm text-text font-bold">
                      {course.ratingAvg.toFixed(1)}
                    </span>
                    <span className="text-text-muted font-mono text-xs">
                      ({course.ratingCount})
                    </span>
                  </div>
                )}

                {/* Instructor */}
                <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-4">
                  By {course.instructorName}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-border/50">
                  <Link
                    to={`/student/courses/${course._id}`}
                    className="flex-1 px-4 py-2 border border-border text-text-muted font-mono text-xs rounded hover:border-accent hover:text-accent transition-all text-center uppercase tracking-wider"
                  >
                    Details
                  </Link>
                  {isEnrolled ? (
                    <Link
                      to={`/student/courses/${course._id}/player`}
                      className="flex-1 px-4 py-2 bg-accent/20 text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-all text-center uppercase tracking-wider"
                    >
                      Resume
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => handleEnroll(e, course)}
                      disabled={isEnrolling}
                      className="flex-1 px-4 py-2 bg-accent text-bg font-mono text-xs rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.4)] transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                      {isEnrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll Free' : `Buy ₨${course.price}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;