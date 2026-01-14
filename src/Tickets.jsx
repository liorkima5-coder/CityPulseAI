import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Search, Filter, MapPin, Calendar, User, MoreVertical, Edit2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data);
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setStatusUpdateLoading(id);
    try {
      const { error } = await supabase.from('tickets').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success('סטטוס עודכן');
      fetchTickets();
    } catch (error) {
      toast.error('שגיאה בעדכון');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.full_name?.includes(search) || t.issue_address?.includes(search) || t.description?.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (s) => {
    if (s === 'חדש') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'בטיפול') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusIcon = (s) => {
    if (s === 'חדש') return <AlertTriangle size={14}/>;
    if (s === 'בטיפול') return <Clock size={14}/>;
    return <CheckCircle size={14}/>;
  };

  return (
    <div className="space-y-6 pb-20"> {/* pb-20 מונע הסתרה ע"י התפריט התחתון בנייד */}
      
      {/* --- Header & Filters --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ניהול פניות</h2>
          <p className="text-slate-500 text-sm">{filteredTickets.length} פניות נמצאו</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1">
            <Search className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
              placeholder="חיפוש חופשי..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-600 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">הכל</option>
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="סגור">סגור</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">טוען נתונים...</div>
      ) : (
        <>
          {/* --- Desktop View (Table) --- */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-5">סטטוס</th>
                    <th className="p-5">קטגוריה</th>
                    <th className="p-5">מיקום</th>
                    <th className="p-5">דיווח ע״י</th>
                    <th className="p-5">תאריך</th>
                    <th className="p-5">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(t.status)}`}>
                          {getStatusIcon(t.status)} {t.status}
                        </span>
                      </td>
                      <td className="p-5 font-bold text-slate-700">{t.categories?.name}</td>
                      <td className="p-5 text-slate-500 text-sm max-w-[200px] truncate" title={t.issue_address}>{t.issue_address}</td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">{t.full_name}</div>
                        <div className="text-xs text-slate-400">{t.phone}</div>
                      </td>
                      <td className="p-5 text-sm text-slate-400">{new Date(t.created_at).toLocaleDateString('he-IL')}</td>
                      <td className="p-5">
                         <select 
                            className="text-sm bg-white border border-slate-200 rounded-lg py-1 px-2 focus:border-blue-500 outline-none cursor-pointer"
                            value={t.status}
                            disabled={statusUpdateLoading === t.id}
                            onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                         >
                           <option value="חדש">חדש</option>
                           <option value="בטיפול">בטיפול</option>
                           <option value="סגור">סגור</option>
                         </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Mobile View (Cards) --- */}
          <div className="md:hidden grid gap-4">
            {filteredTickets.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${getStatusColor(t.status)}`}>
                       {t.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                      {new Date(t.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  {/* Select Status Mobile */}
                  <select 
                      className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 focus:border-blue-500 outline-none"
                      value={t.status}
                      onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                   >
                     <option value="חדש">⚙️ חדש</option>
                     <option value="בטיפול">🔨 בטיפול</option>
                     <option value="סגור">✅ סגור</option>
                   </select>
                </div>

                <h3 className="text-lg font-black text-slate-800 mb-1">{t.categories?.name}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {t.description || 'אין תיאור נוסף'}
                </p>

                <div className="flex flex-col gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="truncate font-medium">{t.issue_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-purple-500" />
                    <span className="font-medium">{t.full_name}</span> 
                    <a href={`tel:${t.phone}`} className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded mr-auto">
                        חייג 📞
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
