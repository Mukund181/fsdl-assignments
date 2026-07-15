import React, { useState } from 'react';

const FeedbackForm = ({ onSubmitted }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    subject: '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({ studentName: '', subject: '', rating: 5, comment: '' });
        onSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8" style={{ padding: '32px', marginBottom: '40px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 600 }}>Share Your Experience</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="label">Name</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label className="label">Subject</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="e.g. Computer Science"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Rating (1-5)</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star}
                type="button"
                onClick={() => setFormData({...formData, rating: star})}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '2rem', 
                  cursor: 'pointer',
                  color: star <= formData.rating ? '#f59e0b' : '#374151',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ★
              </button>
            ))}
            <span style={{ fontSize: '1.2rem', marginLeft: '10px', color: 'var(--text-dim)' }}>
              {formData.rating} Stars
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Review Details</label>
          <textarea 
            className="textarea" 
            rows="4" 
            required
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            placeholder="Tell us what you liked or what could be improved..."
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Post Review'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
