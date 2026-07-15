import React, { useState, useEffect } from 'react';
import FeedbackForm from './components/FeedbackForm';
import FeedbackCard from './components/FeedbackCard';
import StatsDashboard from './components/StatsDashboard';

const App = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [fRes, sRes] = await Promise.all([
        fetch('/api/feedback'),
        fetch('/api/stats')
      ]);
      const fData = await fRes.json();
      const sData = await sRes.json();
      setFeedbacks(fData);
      setStats(sData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app-container">
      <h1 className="title">Feedback Hub</h1>
      
      {!loading && <StatsDashboard stats={stats} />}
      
      <FeedbackForm onSubmitted={fetchData} />

      <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 600 }}>Feed Reviews</h3>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading reviews...</div>
      ) : (
        <div className="feedback-grid">
          {feedbacks.map((f) => (
            <FeedbackCard key={f._id} feedback={f} />
          ))}
          {feedbacks.length === 0 && (
            <div className="glass p-12 text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
              <p style={{ color: 'var(--text-dim)' }}>No feedback reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      )}

      <footer style={{ marginTop: '80px', textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        &copy; 2026 Student Feedback Review System — Premium Academic Edition
      </footer>
    </div>
  );
};

export default App;
