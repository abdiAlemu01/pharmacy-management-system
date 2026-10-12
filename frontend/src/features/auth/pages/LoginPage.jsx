import React from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your pharmacy management account</p>
      </div>
      <LoginForm />
    </div>
  );
};
