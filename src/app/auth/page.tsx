"use client";
import React from 'react';
import Auth from '../Components/Auth';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-24 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl transform rotate-12" />
        <div className="absolute right-[-80px] top-16 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl transform -rotate-6" />
        <div className="absolute left-1/2 bottom-[-120px] w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl transform -translate-x-1/2" />
      </div>

      <div className="p-6 w-full max-w-lg">
        <Auth />
      </div>
    </div>
  );
};

export default AuthPage;
