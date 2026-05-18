import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { resolveAssetUrl } from '../lib/api';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getInitials(name) {
  return (name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Profile() {
  const { user, loading, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    currentPassword: '',
  });
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        password: '',
        currentPassword: '',
      });
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    setError('');

    if (!selected) {
      setFile(null);
      setPreview('');
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image.');
      event.target.value = '';
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      setError('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('phone', form.phone.trim());

    if (file) {
      formData.append('profilePicture', file);
    }

    if (form.password) {
      formData.append('password', form.password);
      formData.append('currentPassword', form.currentPassword);
    }

    try {
      await updateUser(formData);
      setEditing(false);
      setFile(null);
      setPreview('');
    } catch (err) {
      setError(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center text-white/70">
          Loading profile…
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold">You&apos;re not signed in</h1>
          <p className="mt-3 text-white/70">
            Sign in or create an account to view your profile.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold hover:opacity-90"
            >
              Sign up
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const avatarSrc = preview || resolveAssetUrl(user.avatar || user.profilePicture);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Your Profile</h1>
        <p className="mt-2 text-white/70">Manage your account information.</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/80 p-8">
          {!editing ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold">
                    {getInitials(user.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-white/50">Signed in as</p>
                  <h2 className="mt-1 text-xl font-semibold">{user.name || 'Learner'}</h2>
                  <p className="mt-1 text-sm text-white/70">{user.email}</p>
                  <p className="text-sm text-white/70">{user.phone || 'No phone'}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-white/50">
                    Auth: {user.authProvider || 'local'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold hover:opacity-90"
                >
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-white/70">Profile picture</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {avatarSrc && (
                  <img
                    src={avatarSrc}
                    alt="Preview"
                    className="mt-3 h-20 w-20 rounded-xl object-cover"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">Name</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-primary"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">Email</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/50"
                  value={user.email}
                  disabled
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">Phone</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-primary"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              {user.authProvider === 'local' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-white/70">
                      New password (optional)
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                    />
                  </div>
                  {form.password && (
                    <div>
                      <label className="mb-1 block text-sm text-white/70">
                        Current password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={form.currentPassword}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            currentPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setFile(null);
                    setPreview('');
                  }}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
