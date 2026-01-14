import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer({ dark = false }) {
  return (
    <footer className={`w-full py-8 mt-auto flex justify-center items-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md border ${dark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/40 shadow-sm'}`}>
        <Sparkles size={16} className={dark ? "text-purple-400" : "text-blue-600"} />
        <span className="text-sm tracking-wide">
          עוצב ופותח ע״י <span className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>ליאור קימה</span> - ניהול מערכות מתקדמות
        </span>
      </div>
    </footer>
  );
}