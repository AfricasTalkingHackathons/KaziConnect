import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const EscrowDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id || user.role !== 'escrow') {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/escrow/disputes/${user.id}`);
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const resolveDispute = async (jobId, resolution) => {
    try {
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/escrow/resolve`, {
        resolution,
        agent_id: user.id
      });
      fetchJobs();
      alert(`Dispute resolved: Funds ${resolution}`);
    } catch (err) {
      alert('Error resolving dispute');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderRadius: '16px' }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={28} /> Escrow Command Center
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Welcome, Agent {user.name}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <section>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Active Disputes ({jobs.length})</h3>
        {loading ? <p>Loading disputes...</p> : jobs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-muted)' }}>All clear! No active disputes.</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{job.title}</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{job.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '999px', fontWeight: '500' }}>
                        Disputed Amount: ${job.budget}
                      </span>
                      <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', color: 'var(--text-muted)' }}>
                        Client ID: {job.client_id}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      onClick={() => resolveDispute(job.id, 'released')} 
                      className="btn btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success)' }}>
                      <CheckCircle size={18} /> Release to Freelancer
                    </button>
                    <button 
                      onClick={() => resolveDispute(job.id, 'refunded')} 
                      className="btn btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }}>
                      <XCircle size={18} /> Refund to Client
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EscrowDashboard;
