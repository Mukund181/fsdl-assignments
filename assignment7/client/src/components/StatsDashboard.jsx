import React from 'react';

const StatsDashboard = ({ stats }) => {
  return (
    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
      <div className="glass p-6 text-center" style={{ padding: '24px' }}>
        <p className="label">Total Feedbacks</p>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#818cf8' }}>{stats.total}</h2>
      </div>
      <div className="glass p-6 text-center" style={{ padding: '24px' }}>
        <p className="label">Average Rating</p>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b' }}>
          {stats.avgRating} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>/ 5.0</span>
        </h2>
      </div>
    </div>
  );
};

export default StatsDashboard;
