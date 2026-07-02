import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Mail, Key, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    
    // --- NEW: Domain Constraint ---
    if (!email.toLowerCase().endsWith('@dhoobi.com')) {
      setMessage({ type: 'error', text: 'Account recovery is restricted to @dhoobi.com addresses.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/forgot-password', `"${email}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage({ type: 'success', text: 'Reset code sent! (Check backend console)' });
      setStep(2);
    } catch (error) {
      setMessage({ type: 'error', text: 'Email address not found.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      setMessage({ type: 'success', text: 'Password reset successfully! Redirecting...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset password. Check your code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <Link to="/login" className="forgot-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <div className="brand-logo">
            <ShieldCheck size={32} color="white" />
          </div>
          <h1>{step === 1 ? 'Recovery' : 'Reset'}</h1>
          <p>
            {step === 1 
              ? "Lost your keys? Enter your @dhoobi.com email." 
              : "Set your new secure password to regain access."}
          </p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ 
            padding: '12px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center',
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#059669' : '#dc2626',
            border: `1px solid ${message.type === 'success' ? '#10b98133' : '#ef444433'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={step === 1 ? handleSendCode : handleResetPassword} className="login-form">
          {step === 1 ? (
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="icon" size={18} />
                <input
                  type="email"
                  placeholder="admin@dhoobi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div className="input-group">
                <label>Reset Code</label>
                <div className="input-with-icon">
                  <Key className="icon" size={18} />
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>New Password</label>
                <div className="input-with-icon">
                  <Lock className="icon" size={18} />
                  <input
                    type="password"
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Processing...' : step === 1 ? 'Generate Reset Code' : 'Save New Password'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 DhoobiGo Recovery System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
