import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyCertificate = () => {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/api/certificates/verify/${code}`);
        setCertificate(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Certificate not found');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-accent font-mono text-xl animate-pulse">VERIFYING CERTIFICATE...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h1 className="font-display text-3xl text-text mb-2">INVALID CERTIFICATE</h1>
          <p className="text-text-muted font-mono text-sm mb-6">{error}</p>
          <Link to="/" className="text-accent font-mono hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="max-w-2xl w-full p-12 rounded-2xl border-2 border-accent bg-surface backdrop-blur-md shadow-[0_0_50px_rgba(210,255,0,0.2)]">
        <div className="text-center">
          <div className="text-accent text-6xl mb-6">✓</div>
          <h1 className="font-display text-4xl text-text mb-2">CERTIFICATE VERIFIED</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-8">
            // This certificate is authentic
          </p>

          <div className="space-y-6 text-left">
            <div className="p-6 border border-border rounded-lg bg-bg">
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-2">Awarded To</p>
              <p className="font-display text-2xl text-text">{certificate.studentName}</p>
            </div>

            <div className="p-6 border border-border rounded-lg bg-bg">
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-2">For Completing</p>
              <p className="font-display text-2xl text-accent">{certificate.courseTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-bg">
                <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">Issued</p>
                <p className="font-mono text-text">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-bg">
                <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">Verification Code</p>
                <p className="font-mono text-accent text-sm break-all">{certificate.verificationCode}</p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="inline-block mt-8 px-8 py-3 bg-accent text-bg font-display rounded hover:shadow-[0_0_20px_rgba(210,255,0,0.4)] transition-all uppercase tracking-wider"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;