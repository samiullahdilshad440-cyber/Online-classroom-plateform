import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReviewForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/reviews', { ...formData, courseId });
      alert('Review submitted!');
      navigate(`/student/courses/${courseId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  return (
    <div className="min-h-screen bg-bg p-8 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-text mb-1">RATE THIS SECTOR</h1>
      <p className="text-text-muted font-mono text-xs mb-8 uppercase tracking-widest">
        // Share your telemetry data
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 border border-border rounded-lg bg-bg">
        <div>
          <label className="block text-text-muted text-xs font-mono uppercase mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className={`text-3xl transition-all ${
                  star <= formData.rating ? 'text-accent' : 'text-text-muted'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-text-muted text-xs font-mono uppercase mb-2">Comment</label>
          <textarea
            rows="4"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your experience..."
            className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-bg font-display rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
          >
            Submit Review
          </button>
          <button
            type="button"
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="px-6 py-2 border border-border text-text-muted font-display rounded hover:border-text-muted hover:text-text transition-all uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;