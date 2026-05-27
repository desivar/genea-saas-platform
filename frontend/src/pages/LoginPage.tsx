import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5500/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed.');
        return;
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
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
          <p className="text-stone-400 text-sm mt-1 font-light">Your family story, beautifully told</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
          <h2 className="font-serif text-xl text-stone-700 mb-6">Welcome back</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-stone-400 text-xs mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-700 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-stone-300 text-xs mt-6">
          <Link to="/about" className="hover:text-stone-400 transition-colors">About this project</Link>
        </p>
      </div>
    </div>
  );
}