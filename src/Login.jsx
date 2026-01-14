import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Loader2, Fingerprint, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from './Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
        toast.success('נשלח מייל אימות!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('ברוך הבא');
        navigate('/dashboard');
      }
    } catch (error) { toast.error(error.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-slate-50 bg-grid-slate">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>
      
      <div className="relative z-10 w-full max-w-md p-4 animate-enter">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
          
          <div className="text-center mb-10">
            <div className="relative w-14 h-14 flex items-center justify-center bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 overflow-hidden mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400"></div>
              <Activity className="text-white relative z-10" size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {isRegistering ? 'CityPulse AI' : 'ברוכים השבים'}
            </h2>
            <p className="text-slate-500 text-sm">{isRegistering ? 'הצטרפות לצוות הניהול' : 'כניסה למערכת הניהול העירונית'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <input type="text" placeholder="שם מלא" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={fullName} onChange={e => setFullName(e.target.value)} required />
            )}
            <input type="email" placeholder="אימייל" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="סיסמה" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={password} onChange={e => setPassword(e.target.value)} required />

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'צור חשבון' : 'כניסה')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
              {isRegistering ? 'כבר יש לך משתמש? התחבר' : 'אין לך גישה? צור משתמש'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}