import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
      
      if (response.data && response.data.token) {
        // --- REAL SECURITY ACTIVATION ---
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(error.response?.data?.message || 'Administrative Login Failed. Check credentials.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow"></div>
      
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="brand-logo">
            <Shirt size={32} color="white" />
          </div>
          <h1>DhoobiGo</h1>
          <p>Admin Control Panel Login</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Admin Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="icon" />
              <input 
                type="email" 
                placeholder="admin@dhoobigo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" data-link="forgot-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Sign In to Dashboard <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 DhoobiGo Platform. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
