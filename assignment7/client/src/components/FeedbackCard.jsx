import React from 'react';

const FeedbackCard = ({ feedback }) => {
  const date = new Date(feedback.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass p-6 animate-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
        <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{feedback.studentName}</h4>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{date}</span>
      </div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < feedback.rating ? '#f59e0b' : '#374151', fontSize: '1rem' }}>
            ★
          </span>
        ))}
      </div>
      <p className="label" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>Subject: {feedback.subject}</p>
      <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{feedback.comment}</p>
    </div>
  );
};

export default FeedbackCard;
