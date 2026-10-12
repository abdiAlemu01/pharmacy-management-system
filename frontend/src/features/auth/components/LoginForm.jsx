import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { loginApi } from '../api/auth.api';
import { useAuth } from '../hooks/use-auth';

export const LoginForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const response = await loginApi(formData);
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {generalError && (
        <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {generalError}
        </div>
      )}

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="pharmacist@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-slate-600 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </form>
  );
};
