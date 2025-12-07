import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onLogin(email.trim());
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📈 Stock Broker Dashboard</h1>
        <p>Login with your email to start tracking stocks</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              autoFocus
            />
          </div>

          {error && (
            <div style={{ color: '#e74c3c', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            Login to Dashboard
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          <p>💡 Tip: Each user can subscribe to different stocks and view real-time prices</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

