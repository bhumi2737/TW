import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem('trackWiseAuthToken', token);    navigate('/dashboard', { replace: true });
    window.location.reload();
  }
}, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        {loading ? (
          <p className="text-white/70">Loading…</p>
        ) : user ? (
          <>
            <h1 className="text-3xl font-semibold">
              Welcome back, {user.name || 'Learner'}!
            </h1>
            <p className="mt-3 text-white/70">
              Your account is connected. Continue tracking courses or update your
              profile.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/tracker"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold hover:opacity-90"
              >
                Open Tracker
              </Link>
              <Link
                to="/profile"
                className="rounded-full border border-white/20 px-6 py-3 text-sm hover:border-white/40"
              >
                View Profile
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-3 text-white/70">Please sign in to access your dashboard.</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold hover:opacity-90"
            >
              Login
            </Link>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
