import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from '../../components/CountdownTimer';

const AssignmentList = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`/api/assignments/course/${courseId}`);
        setAssignments(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAssignments();
  }, [courseId]);

  if (loading) return <div className="p-8 text-text-muted font-mono">LOADING ASSIGNMENTS...</div>;

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <Link to={`/student/courses/${courseId}`} className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
        ← BACK TO SECTOR
      </Link>
      
      <h1 className="font-display text-4xl text-text mb-2">DELIVERABLES</h1>
      <p className="text-text-muted font-mono text-sm mb-8 uppercase tracking-widest">// Upcoming deadlines</p>

      <div className="space-y-4">
        {assignments.map(assignment => (
          <Link
            key={assignment._id}
            to={`/student/courses/${courseId}/assignments/${assignment._id}`}
            className="block p-6 border border-border rounded-lg bg-surface backdrop-blur-md hover:border-accent transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-display text-xl text-text mb-1 group-hover:text-accent transition-colors">
                  {assignment.title}
                </h3>
                <p className="text-text-muted text-sm">{assignment.description}</p>
              </div>
              <span className="font-mono text-accent text-sm">{assignment.maxPoints} pts</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-text-muted text-xs uppercase">Start Lights:</span>
              <CountdownTimer dueDate={assignment.dueDate} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;