import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from '../../components/CountdownTimer';

const SubmissionPortal = () => {
  const { courseId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId, assignmentId]);

  const fetchData = async () => {
    try {
      // Fetch assignment details
      const assignRes = await axios.get(`/api/assignments/course/${courseId}`);
      const assign = assignRes.data.data.find(a => a._id === assignmentId);
      setAssignment(assign);

      // Fetch my submissions (includes embedded grade if graded)
      const subRes = await axios.get(`/api/submissions/my/${courseId}`);
      const mySub = subRes.data.data.find(s => s.assignmentId._id === assignmentId);
      setSubmission(mySub);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);

    try {
      await axios.post('/api/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Submission successful!');
      fetchData(); // Refresh to show the submission
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed');
    } finally {
      setUploading(false);
    }
  };

  if (!assignment) return <div className="p-8 text-text-muted font-mono">LOADING...</div>;

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <Link to={`/student/courses/${courseId}/assignments`} className="text-text-muted font-mono text-sm hover:text-accent mb-4 inline-block">
        ← BACK TO DELIVERABLES
      </Link>

      <h1 className="font-display text-4xl text-text mb-2">{assignment.title}</h1>
      <p className="text-text-muted text-sm mb-6">{assignment.description}</p>

      <div className="flex items-center gap-6 mb-8 p-4 border border-border rounded-lg bg-bg">
        <span className="font-mono text-text-muted text-xs uppercase">Deadline:</span>
        <CountdownTimer dueDate={assignment.dueDate} />
        <span className="font-mono text-accent">{assignment.maxPoints} pts</span>
      </div>

      {submission ? (
        <div className="space-y-6">
          {/* Submission Card */}
          <div className="p-6 border border-border rounded-lg bg-surface backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display text-xl text-text mb-1">YOUR SUBMISSION</h3>
                <p className="text-text-muted font-mono text-xs uppercase">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <a
                href={`http://localhost:5000${submission.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-accent text-accent font-mono text-xs rounded hover:bg-accent hover:text-bg transition-colors uppercase"
              >
                View File
              </a>
            </div>

            {/* SECRET REQ #3: EMBEDDED GRADE REVEAL */}
            {submission.grade && submission.grade.score !== undefined && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-lg text-accent uppercase tracking-wider">Lap Time</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-3xl font-bold text-accent">
                      {submission.grade.score}
                    </span>
                    <span className="font-mono text-text-muted">/ {assignment.maxPoints}</span>
                  </div>
                </div>
                {submission.grade.feedback && (
                  <div className="p-4 bg-bg rounded border border-border/50">
                    <p className="text-text-muted text-xs font-mono uppercase mb-2">Telemetry Feedback:</p>
                    <p className="text-text text-sm">{submission.grade.feedback}</p>
                  </div>
                )}
                <p className="text-text-muted font-mono text-xs mt-3">
                  Graded: {new Date(submission.grade.gradedAt).toLocaleString()}
                </p>
              </div>
            )}

            {!submission.grade && (
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-text-muted font-mono text-sm uppercase tracking-widest">
                  Awaiting Telemetry Review
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 border border-border rounded-lg bg-bg space-y-4">
          <h3 className="font-display text-xl text-text mb-4">SUBMIT DELIVERABLE</h3>
          <div>
            <label className="block text-text-muted text-xs font-mono uppercase mb-2">Upload File</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-accent file:text-bg file:font-mono file:text-xs file:uppercase hover:file:shadow-[0_0_10px_rgba(210,255,0,0.3)]"
            />
            <p className="text-text-muted text-xs mt-2 font-mono">
              Accepted: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max 10MB)
            </p>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider disabled:opacity-50"
          >
            {uploading ? 'Transmitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmissionPortal;