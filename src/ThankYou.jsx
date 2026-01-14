import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home, ArrowLeft } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] font-sans relative overflow-hidden p-6">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-50 opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-16 text-center max-w-lg w-full relative z-10 animate-enter border border-white/60 backdrop-blur-xl">
        
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 blur-xl opacity-30 rounded-full"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
              <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          הדיווח התקבל!
        </h1>
        
        <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
          תודה שדיווחת ועזרת לנו לשמור על עיר נקייה ובטוחה יותר.
          <br/>
          פרטי הפנייה הועברו למוקד העירוני לטיפול מיידי, ואישור נשלח למייל שלך.
        </p>

        <div className="space-y-4">
          <Link to="/" className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <Home size={20} /> חזרה לדף הבית
          </Link>
          <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            מספר מעקב נשלח אליך ב-SMS
          </div>
        </div>
      </div>
    </div>
  );
}