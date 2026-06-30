import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}`);
        setCourse(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourse();
  }, [courseId]);

  // SECRET REQ #8: Debounced inline coupon validation
  useEffect(() => {
    if (!couponCode.trim()) {
      setCouponData(null);
      setCouponError('');
      return;
    }

    const timer = setTimeout(async () => {
      setCouponLoading(true);
      setCouponError('');
      
      try {
        const res = await axios.post('/api/coupons/validate', {
          code: couponCode,
          courseId
        });
        setCouponData(res.data.data);
      } catch (err) {
        setCouponError(err.response?.data?.error || 'Invalid coupon');
        setCouponData(null);
      } finally {
        setCouponLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [couponCode, courseId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      await axios.post('/api/payments', {
        courseId,
        provider: selectedProvider,
        couponCode: couponData ? couponData.code : null
      });

      alert('Payment successful! You are now enrolled.');
      navigate('/student/dashboard');
    } catch (err) {
      // SECRET REQ #8: Plain language error from backend
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!course) return <div className="p-8 text-text-muted font-mono">LOADING...</div>;

  const originalPrice = course.price;
  const finalPrice = couponData ? couponData.finalPrice : originalPrice;
  const discount = originalPrice - finalPrice;

  return (
    <div className="min-h-screen bg-bg p-8 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-text mb-1">CHECKOUT</h1>
      <p className="text-text-muted font-mono text-xs mb-8 uppercase tracking-widest">
        // Complete your enrollment
      </p>

      <form onSubmit={handlePayment} className="space-y-6">
        {/* Course Summary */}
        <div className="p-6 border border-border rounded-lg bg-bg">
          <h2 className="font-mono text-accent text-sm uppercase tracking-widest mb-4">Course</h2>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display text-xl text-text mb-1">{course.title}</h3>
              <p className="text-text-muted text-sm">{course.instructorName}</p>
            </div>
            <div className="text-right">
              {discount > 0 ? (
                <>
                  <p className="font-mono text-text-muted text-sm line-through">
                    ${originalPrice}
                  </p>
                  <p className="font-mono text-2xl font-bold text-accent">
                    ${finalPrice}
                  </p>
                </>
              ) : (
                <p className="font-mono text-2xl font-bold text-text">
                  {originalPrice === 0 ? 'FREE' : `$${originalPrice}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Code */}
        <div className="p-6 border border-border rounded-lg bg-bg">
          <h2 className="font-mono text-accent text-sm uppercase tracking-widest mb-4">Coupon Code</h2>
          <div className="relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="w-full bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent uppercase"
            />
            {couponLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">
                Validating...
              </span>
            )}
          </div>
          
          {couponError && (
            <p className="text-red-500 font-mono text-xs mt-2">{couponError}</p>
          )}
          
          {couponData && (
            <div className="mt-3 p-3 bg-accent/10 border border-accent rounded">
              <p className="text-accent font-mono text-xs uppercase tracking-widest mb-1">
                ✓ Coupon Applied
              </p>
              <p className="text-text font-mono text-sm">
                {couponData.discountPercent 
                  ? `${couponData.discountPercent}% discount`
                  : `$${couponData.discountAmount} discount`
                }
              </p>
            </div>
          )}
        </div>

        {/* Payment Provider */}
        <div className="p-6 border border-border rounded-lg bg-bg">
          <h2 className="font-mono text-accent text-sm uppercase tracking-widest mb-4">Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: 'stripe', name: 'Credit/Debit Card (Stripe)', icon: '💳' },
              { id: 'jazzcash', name: 'JazzCash', icon: '📱' },
              { id: 'easypaisa', name: 'EasyPaisa', icon: '📲' }
            ].map(provider => (
              <label
                key={provider.id}
                className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${
                  selectedProvider === provider.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={provider.id}
                  checked={selectedProvider === provider.id}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="accent-accent"
                />
                <span className="text-2xl">{provider.icon}</span>
                <span className="text-text font-mono text-sm">{provider.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={processing || finalPrice === 0}
          className="w-full px-8 py-4 bg-accent text-bg font-display text-xl rounded hover:shadow-[0_0_20px_rgba(210,255,0,0.4)] transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : finalPrice === 0 ? 'Enroll Now (Free)' : `Pay $${finalPrice}`}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/student/courses/${courseId}`)}
          className="w-full px-8 py-3 border border-border text-text-muted font-display rounded hover:border-text-muted hover:text-text transition-all uppercase tracking-wider"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default Checkout;