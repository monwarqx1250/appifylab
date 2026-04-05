'use client';

import React, { useEffect, useState } from 'react';

export default function PostStatusIndicator({ status, onStatusChange }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setVisible(true);
      
      if (status === 'success') {
        const timer = setTimeout(() => {
          setVisible(false);
          onStatusChange?.('idle');
        }, 2500);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [status, onStatusChange]);

  if (!visible || status === 'idle') return null;

  return (
    <div style={styles.container}>
      <div style={styles.indicator}>
        {status === 'posting' && (
          <>
            <div style={styles.spinner}></div>
            <span style={styles.text}>Posting...</span>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={styles.checkmark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" style={styles.checkAnimation}></polyline>
              </svg>
            </div>
            <span style={{ ...styles.text, color: '#22c55e' }}>Posted!</span>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '12px 16px',
    marginBottom: '16px',
    animation: 'fadeIn 0.3s ease',
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#f5f5f5',
    borderRadius: '24px',
    width: 'fit-content',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #e5e5e5',
    borderTop: '2px solid #666',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  checkmark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'scaleIn 0.3s ease',
  },
  text: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
  },
};
