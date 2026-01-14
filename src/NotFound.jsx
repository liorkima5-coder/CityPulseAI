import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-center p-6">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <h2 className="text-3xl font-bold text-slate-800 mt-4">אופס! הדף לא נמצא</h2>
      <p className="text-slate-500 mt-2 mb-8">נראה שהלכת לאיבוד בעיר הגדולה...</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
        <Home size={20} /> חזרה הביתה
      </Link>
    </div>
  );
}