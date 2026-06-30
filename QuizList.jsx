import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const QuizList = () => {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`/api/quizzes/course/${courseId}`);
        setQuizzes(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchQuizzes();
  }, [courseId]);

  if (loading) return <div className="p-8 text-text-muted font-mono">LOADING ASSESSMENTS...</div>;

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <Link to={`/student/courses/${courseId}`} className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
        ← BACK TO SECTOR
      </Link>

      <h1 className="font-display text-4xl text-text mb-2">ASSESSMENTS</h1>
      <p className="text-text-muted font-mono text-sm mb-8 uppercase tracking-widest">// Available quizzes</p>

      <div className="space-y-4">
        {quizzes.map(quiz => (
          <Link
            key={quiz._id}
            to={`/student/courses/${courseId}/quizzes/${quiz._id}`}
            className="block p-6 border border-border rounded-lg bg-surface backdrop-blur-md hover:border-accent transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-display text-xl text-text mb-1 group-hover:text-accent transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-text-muted font-mono text-xs">
                  {quiz.questions.length} questions • {quiz.timeLimitMinutes} min time limit
                </p>
              </div>
              <span className="text-accent font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                START →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuizList;