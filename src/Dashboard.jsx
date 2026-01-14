import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { LayoutDashboard, Ticket, Users, LogOut, Activity, CheckCircle, Clock, ShieldAlert, AlertTriangle, Map, Menu } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Footer from './Footer';
import Tickets from './Tickets';
import Residents from './Residents';
import MapView from './MapView';
import AdminPanel from './AdminPanel';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, in_progress: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndRole();
    fetchDashboardData();
  }, []);

  const checkUserAndRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile && profile.role === 'admin') setIsAdmin(true);
  };

  const fetchDashboardData = async () => {
    try {
      const { data: tickets } = await supabase.from('tickets').select('*, categories(name)').order('created_at', { ascending: false });
      const safeTickets = tickets || []; 
      setStats({
        total: safeTickets.length,
        open: safeTickets.filter(t => t.status === 'חדש').length,
        closed: safeTickets.filter(t => t.status === 'סגור').length,
        in_progress: safeTickets.filter(t => t.status === 'בטיפול').length
      });
      setRecentTickets(safeTickets.slice(0, 5)); 
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const chartData = [
    { name: 'חדש', count: stats.open, color: '#ef4444' },
    { name: 'בטיפול', count: stats.in_progress, color: '#f59e0b' },
    { name: 'סגור', count: stats.closed, color: '#10b981' },
  ];

  const NavItem = ({ to, icon: Icon, label, mobile = false }) => {
    const isActive = location.pathname === to;
    
    // ניווט מובייל - הוספתי אפקט לחיצה (active:scale)
    if (mobile) {
      return (
        <Link to={to} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all active:scale-90 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
             <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold">{label}</span>
        </Link>
      );
    }

    return (
      <Link to={to} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>
        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
        <span>{label}</span>
      </Link>
    )
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div className="skeleton w-64 h-12"></div>
        <div className="skeleton w-32 h-10 rounded-full"></div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <div className="skeleton h-32"></div>
        <div className="skeleton h-32"></div>
        <div className="skeleton h-32"></div>
        <div className="skeleton h-32"></div>
      </div>
    </div>
  );

  return (
    // שינוי ל-h-[100dvh] מונע קפיצות בדפדפנים ניידים
    <div className="flex h-[100dvh] bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col fixed h-full z-30 shadow-sm hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400"></div>
              <Activity className="text-white relative z-10" size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">
                City<span className="text-blue-600">Pulse</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">AI Operations</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            <p className="text-xs font-bold text-slate-400 px-4 mb-3 mt-4 uppercase tracking-widest">תפריט</p>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="מרכז בקרה" />
            <NavItem to="/dashboard/tickets" icon={Ticket} label="ניהול פניות" />
            <NavItem to="/dashboard/residents" icon={Users} label="תושבים" />
            {isAdmin && (
              <>
               <div className="my-6 border-t border-slate-100 mx-4"></div>
               <p className="text-xs font-bold text-slate-400 px-4 mb-3 uppercase tracking-widest">מנהל</p>
               <NavItem to="/dashboard/admin" icon={ShieldAlert} label="הגדרות" />
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all w-full text-sm font-medium">
            <LogOut size={18} /> התנתק
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 md:mr-72 h-full overflow-y-auto custom-scrollbar bg-[#f1f5f9] pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full flex flex-col">
          
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center mb-6 sticky top-0 z-20 bg-[#f1f5f9]/90 backdrop-blur-sm py-2">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Activity size={18} />
                </div>
                <span className="text-lg font-black text-slate-800">City<span className="text-blue-600">Pulse</span></span>
             </div>
             <button onClick={handleLogout} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-red-500 active:scale-90 transition-transform">
               <LogOut size={18} />
             </button>
          </div>

          <Routes>
            <Route path="/" element={
              <div className="animate-enter space-y-6 md:space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
                      בוקר טוב, מנהל.
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">סקירת מצב העיר בזמן אמת.</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-medium shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> מערכת אונליין
                  </div>
                </header>

                {/* --- Stats Carousel for Mobile (Grid for Desktop) --- */}
                {/* כאן השינוי הגדול: במובייל זה הופך לגלילה אופקית (Carousel) */}
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:p-0 md:m-0 scrollbar-hide">
                  <StatCard title="סה״כ פניות" value={stats.total} icon={<Activity />} iconColor="text-blue-600" iconBg="bg-blue-50" />
                  <StatCard title="ממתינות" value={stats.open} icon={<AlertTriangle />} iconColor="text-red-600" iconBg="bg-red-50" />
                  <StatCard title="בטיפול" value={stats.in_progress} icon={<Clock />} iconColor="text-orange-600" iconBg="bg-orange-50" />
                  <StatCard title="טופלו" value={stats.closed} icon={<CheckCircle />} iconColor="text-green-600" iconBg="bg-green-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                  {/* Chart */}
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col lg:col-span-1 h-[300px] lg:h-auto">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Activity size={18} className="text-blue-600"/> סטטוס שבועי
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                          <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={40}>
                             {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent List */}
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px] lg:h-auto">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-purple-600"/> עדכונים אחרונים
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {recentTickets.length === 0 && <p className="text-slate-400 text-center py-10">אין פעילות אחרונה</p>}
                      {recentTickets.map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all active:scale-[0.98]">
                          <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm ${t.status === 'חדש' ? 'bg-red-500' : t.status === 'בטיפול' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                            {t.status[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{t.categories?.name}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{t.issue_address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Map */}
                  <div className="bg-white rounded-[2rem] p-2 border border-slate-200 shadow-sm relative overflow-hidden lg:col-span-1 h-[300px] lg:h-auto">
                     <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
                        <MapView />
                     </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/admin" element={isAdmin ? <AdminPanel /> : <div className="text-red-500 font-bold p-10 text-center">אין גישה</div>} />
          </Routes>
          <div className="mt-6 md:mt-auto pt-6"><Footer /></div>
        </div>
      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <NavItem to="/dashboard" icon={LayoutDashboard} label="בית" mobile />
         <NavItem to="/dashboard/tickets" icon={Ticket} label="פניות" mobile />
         <NavItem to="/dashboard/residents" icon={Users} label="תושבים" mobile />
         {isAdmin && <NavItem to="/dashboard/admin" icon={ShieldAlert} label="מנהל" mobile />}
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, iconColor, iconBg }) {
  return (
    // min-w-[160px] במובייל מבטיח שהכרטיסים לא יימעכו ויהיה אפשר לגלול אותם
    <div className="bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm min-w-[160px] snap-start active:scale-[0.98] transition-transform md:min-w-0 md:active:scale-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-xs font-bold mb-1 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconColor} ${iconBg}`}>{React.cloneElement(icon, { size: 20 })}</div>
      </div>
    </div>
  );
}
