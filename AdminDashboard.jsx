import { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        setStats(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-accent font-mono text-xl animate-pulse">
          LOADING TELEMETRY...
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-text-muted font-mono">FAILED TO LOAD STATS</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-5xl text-text mb-2">COMMAND CENTER</h1>
        <p className="text-text-muted font-mono text-sm uppercase tracking-widest">
          // Platform-wide telemetry • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.users.total} icon="👥" accent />
        <StatCard label="Students" value={stats.users.students} icon="🎓" />
        <StatCard label="Teachers" value={stats.users.teachers} icon="👨‍🏫" />
        <StatCard label="Active (30d)" value={stats.activeStudents} icon="⚡" accent />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Courses" value={stats.courses.total} icon="📚" />
        <StatCard label="Avg Rating" value={stats.courses.avgRating} suffix="★" />
        <StatCard label="Enrollments" value={stats.enrollments.total} icon="📝" />
        <StatCard label="Completion Rate" value={stats.enrollments.completionRate} suffix="%" accent />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <StatCard
          label="Total Revenue"
          value={stats.revenue.total}
          prefix="₨ "
          icon="💰"
          accent
        />
        <StatCard label="Transactions" value={stats.revenue.transactions} icon="💳" />
        <StatCard label="Avg Transaction" value={stats.revenue.avgTransaction} prefix="₨ " />
      </div>

      {/* Popular Courses */}
      <div className="p-6 rounded-xl border border-border bg-surface backdrop-blur-md">
        <h2 className="font-display text-2xl text-text mb-6 uppercase tracking-tight">
          Top Sectors
        </h2>
        {stats.popularCourses.length === 0 ? (
          <p className="text-text-muted font-mono text-sm">NO ENROLLMENTS YET</p>
        ) : (
          <div className="space-y-3">
            {stats.popularCourses.map((course, idx) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-bg hover:border-accent transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className={`font-display text-2xl ${idx === 0 ? 'text-accent' : 'text-text-muted'}`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-text">{course.courseTitle}</h3>
                    <p className="text-text-muted font-mono text-xs">
                      By {course.instructorName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-accent">
                    {course.enrollmentCount}
                  </div>
                  <p className="text-text-muted font-mono text-xs uppercase">Enrolled</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;