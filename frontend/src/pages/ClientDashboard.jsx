import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, PlusCircle } from 'lucide-react';

const ClientDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budget: '', deadline: '', required_skills: '' });
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id || user.role !== 'client') navigate('/login');
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      setJobs(res.data.filter(j => j.client_id === user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const viewApplications = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}/applications`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, client_id: user.id, required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean) };
      await axios.post('http://localhost:5000/api/jobs', payload);
      setShowForm(false);
      setFormData({ title: '', description: '', budget: '', deadline: '', required_skills: '' });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating job');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="text-gradient">Client Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="btn btn-outline">
          Logout
        </button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Job Postings</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} /> Post New Job
        </button>
      </div>

      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Create New Job</h3>
          <form onSubmit={handleCreateJob} style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Job Title</label>
              <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" required></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Budget ($)</label>
              <input type="number" className="form-control" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-control" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Required Skills (comma separated)</label>
              <input type="text" className="form-control" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary">Post Job</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p> : jobs.map(job => (
            <div key={job.id} className={`glass-panel ${selectedJobId === job.id ? 'active' : ''}`} style={{ padding: '1.5rem', border: selectedJobId === job.id ? '1px solid var(--primary)' : '' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{job.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{job.description.substring(0, 100)}...</p>
              <button onClick={() => viewApplications(job.id)} className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> View Applications
              </button>
            </div>
          ))}
        </div>

        {selectedJobId && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Applications</h3>
            {applications.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p> : applications.map(app => (
              <div key={app.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'var(--accent)' }}>{app.name}</h4>
                  <span className="badge">Match: {app.match_score}%</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone: {app.phone}</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.5rem' }}>Accept Proposal</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
