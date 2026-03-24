import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, DollarSign, Clock, Star } from 'lucide-react';

const FreelancerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id || user.role !== 'freelancer') navigate('/login');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jobsRes = await axios.get('http://localhost:5000/api/jobs');
      setJobs(jobsRes.data);
      
      const appsRes = await axios.get(`http://localhost:5000/api/jobs/freelancer/${user.id}`);
      setMyApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const applyJob = async (jobId) => {
    try {
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`, { freelancer_id: user.id });
      alert('Application successful! The client will review your profile.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying');
    }
  };

  const hasApplied = (jobId) => myApplications.some(a => a.id === jobId);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="text-gradient">Freelancer Command Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="btn btn-outline">
          Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px' }}>
            <Briefcase color="var(--primary)" size={24} />
          </div>
          <div>
             <h3 style={{ fontSize: '1.5rem' }}>{myApplications.length}</h3>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Applications</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
            <DollarSign color="var(--accent)" size={24} />
          </div>
          <div>
             <h3 style={{ fontSize: '1.5rem' }}>$0.00</h3>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Earnings</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>AI Recommended Jobs</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {jobs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No jobs available right now.</p> : jobs.map(job => {
          return (
            <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{job.title}</h3>
                  <span className="badge">{job.status}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{job.description}</p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16} color="var(--accent)"/> ${job.budget}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="#ec4899"/> {job.deadline}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={16} color="#eab308"/> AI Match Score: calculated on apply</span>
                </div>
              </div>
              <div>
                 {hasApplied(job.id) ? 
                   <button className="btn btn-outline" disabled>Applied</button> :
                   <button onClick={() => applyJob(job.id)} className="btn btn-primary">Apply Now</button>
                 }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default FreelancerDashboard;
