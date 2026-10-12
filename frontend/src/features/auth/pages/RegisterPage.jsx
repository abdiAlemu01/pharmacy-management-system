import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
      </div>
      <RegisterForm />
    </div>
  );
};

