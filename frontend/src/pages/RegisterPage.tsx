import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole
  });
  
  // States declared once cleanly
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5500/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      // Auto-login after registration
      const loginRes = await fetch('http://localhost:5500/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const loginData = await loginRes.json();
      login(loginData.token, loginData.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally { // Fixed typo here from 'finaly' to 'finally'
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="font-serif text-3xl text-stone-800 tracking-wide">Genea</h1>
          <p className="text-stone-400 text-sm mt-1 font-light">Begin your family story</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
          <h2 className="font-serif text-xl text-stone-700 mb-6">Create your account</h2>

    // Role Selection
<div className="grid grid-cols-3 gap-3 mb-6">
  <button
    type="button"
    onClick={() => setForm({ ...form, role: 'user' })}
    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
      form.role === 'user'
        ? 'bg-amber-50 border-amber-300 text-amber-700'
        : 'bg-stone-50 border-stone-200 text-stone-400'
    }`}
  >
    <div className="text-xl mb-1">👨‍👩‍👧‍👦</div>
    <div>Family Member</div>
    <div className="text-[10px] font-light mt-0.5">View & explore</div>
  </button>

  <button
    type="button"
    onClick={() => setForm({ ...form, role: 'genealogist' })}
    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
      form.role === 'genealogist'
        ? 'bg-amber-50 border-amber-300 text-amber-700'
        : 'bg-stone-50 border-stone-200 text-stone-400'
    }`}
  >
    <div className="text-xl mb-1">🔍</div>
    <div>Genealogist</div>
    <div className="text-[10px] font-light mt-0.5">Build & present</div>
  </button>

  <button
    type="button"
    onClick={() => setForm({ ...form, role: 'admin' as any })}
    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
      (form.role as string) === 'admin'
        ? 'bg-rose-50 border-rose-300 text-rose-700'
        : 'bg-stone-50 border-stone-200 text-stone-400'
    }`}
  >
    <div className="text-xl mb-1">⚙️</div>
    <div>Admin</div>
    <div className="text-[10px] font-light mt-0.5">First user only</div>
  </button>
</div>

          {/* Genealogist feature hint */}
          {form.role === 'genealogist' && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
              🕐 Genealogist accounts include <strong>presentation time tracking</strong> and <strong>automatic research reports</strong>.
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="mt-1 w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="mt-1 w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-amber-400 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-amber-400 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-stone-400 text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-700 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}