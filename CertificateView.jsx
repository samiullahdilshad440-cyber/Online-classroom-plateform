import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CertificateView = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await axios.get('/api/certificates/my');
        setCertificates(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCertificates();
  }, []);

  const handleGenerate = async (courseId) => {
    try {
      await axios.post(`/api/certificates/${courseId}`);
      alert('Certificate generated!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate certificate');
    }
  };

  if (loading) return <div className="p-8 text-text-muted font-mono">LOADING CERTIFICATES...</div>;

  return (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="font-display text-5xl text-text mb-2">CERTIFICATES</h1>
      <p className="text-text-muted font-mono text-sm mb-8 uppercase tracking-widest">// Your achievements</p>

      {certificates.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-xl text-center">
          <p className="text-text-muted font-mono mb-4">NO CERTIFICATES YET</p>
          <p className="text-text-muted text-sm">Complete a course to earn your first certificate</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div
              key={cert._id}
              className="p-8 rounded-xl border-2 border-accent bg-surface backdrop-blur-md shadow-[0_0_30px_rgba(210,255,0,0.1)]"
            >
              <div className="text-center">
                <div className="text-accent text-4xl mb-4">🏆</div>
                <h2 className="font-display text-2xl text-text mb-2">{cert.courseId.title}</h2>
                <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-4">
                  Certificate of Completion
                </p>
                <p className="text-text-muted text-sm mb-6">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
                <Link
                  to={`/verify/${cert.verificationCode}`}
                  target="_blank"
                  className="inline-block px-6 py-2 bg-accent text-bg font-mono text-xs rounded hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
                >
                  Verify Certificate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateView;