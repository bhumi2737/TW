import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import AuthDivider from '../components/AuthDivider';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../contexts/AuthContext';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.fullName.trim());
    formData.append('email', form.email.trim().toLowerCase());
    formData.append('phone', form.phone.trim());
    formData.append('password', form.password);
    if (file) {
      formData.append('profilePicture', file);
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Join TrackWise and start tracking your learning journey today."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-primary"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-primary"
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-primary"
          type="tel"
          name="phone"
          placeholder="Phone Number (10 digits)"
          pattern="[0-9]{10}"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-primary"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div>
          <label className="mb-2 block text-sm text-white/70">
            Profile picture (optional)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
          />
          {preview && (
            <img
              src={preview}
              alt="Profile preview"
              className="mt-3 h-24 w-24 rounded-2xl border border-white/10 object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <AuthDivider />
      <GoogleAuthButton label="Sign up with Google" />
    </AuthCard>
  );
}

export default Signup;
