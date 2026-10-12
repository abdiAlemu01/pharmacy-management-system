import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-1">Register as pharmacy staff to get started</p>
      </div>
      <RegisterForm />
    </div>
  );
};

