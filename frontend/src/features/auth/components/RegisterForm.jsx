import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { registerApi } from '../api/auth.api';
import { useAuth } from '../hooks/use-auth';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
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
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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
      const response = await registerApi(formData);
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          name="firstName"
          type="text"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
        />
        <Input
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
        />
      </div>

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="john.doe@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
};

