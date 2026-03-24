import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', role: 'freelancer', skills: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean) };
      await axios.post('http://localhost:5000/api/auth/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }} className="text-gradient">Join KaziConnect</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Create your account today</p>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
             <label className="form-label">Phone Number</label>
             <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="07xxxxxxxx" required />
          </div>
          <div className="form-group">
             <label className="form-label">Password</label>
             <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="form-group">
             <label className="form-label">I want to...</label>
             <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
               <option value="freelancer">Work as a Freelancer</option>
               <option value="client">Hire Talent (Client)</option>
             </select>
          </div>
          {formData.role === 'freelancer' && (
            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <input type="text" className="form-control" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Node, Design" />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
