import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Zap, Globe, Shield } from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing-page">
      <nav className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h2 className="text-gradient">KaziConnect</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <header style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="animate-fade-in">
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1.5rem', lineHeight: '1.1' }}>
          Connecting African Talent to <br/><span className="text-gradient">Global Opportunity</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          The multi-channel platform designed for the African gig economy. Work from anywhere, anytime, with or without internet.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Hire Talent</Link>
          <Link to="/register" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Find Work</Link>
        </div>
      </header>
      
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Why choose KaziConnect?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Zap color="var(--accent)" size={48} style={{ marginBottom: '1.5rem' }} />
            <h3>AI Job Matching</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Our smart algorithm ensures you only see jobs that match your exact skillset, saving you hours of searching.</p>
          </div>
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Globe color="var(--primary)" size={48} style={{ marginBottom: '1.5rem' }} />
            <h3>USSD (*789*5960#) & SMS</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No internet? No problem. Dial *789*5960# to access jobs, accept offers, and manage clients via any basic feature phone.</p>
          </div>
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Briefcase color="#ec4899" size={48} style={{ marginBottom: '1.5rem' }} />
            <h3>Productivity Tools</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Manage your active tasks, track earnings effortlessly, and receive automated deadline reminders.</p>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
        <p>KaziConnect &copy; 2026</p>
      </footer>
    </div>
  );
};

export default Landing;
