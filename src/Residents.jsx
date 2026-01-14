import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Search, Mail, Phone, User, MessageSquare, Ticket } from 'lucide-react';

export default function Residents() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllContacts();
  }, []);

  const fetchAllContacts = async () => {
    try {
      // 1. שליפת מדווחים (Tickets)
      const { data: tickets } = await supabase
        .from('tickets')
        .select('full_name, phone, email, created_at')
        .order('created_at', { ascending: false });

      // 2. שליפת פניות כלליות (Leads)
      const { data: leads } = await supabase
        .from('leads')
        .select('full_name, phone, email, created_at')
        .order('created_at', { ascending: false });

      // 3. איחוד הרשימות
      // אנחנו מסמנים מאיפה כל אחד הגיע
      const ticketUsers = (tickets || []).map(u => ({ ...u, source: 'ticket' }));
      const leadUsers = (leads || []).map(u => ({ ...u, source: 'lead' }));
      
      const combined = [...ticketUsers, ...leadUsers];

      // 4. סינון כפילויות לפי טלפון
      // (אנחנו שומרים את האינטראקציה האחרונה של המשתמש לפי התאריך)
      const uniqueUsers = [];
      const seenPhones = new Set();
      
      // מיון לפי תאריך (החדש ביותר ראשון) כדי לשמור את הפרטים הכי עדכניים
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      combined.forEach(u => {
        // ניקוי רווחים ומקפים מהטלפון להשוואה בסיסית
        const cleanPhone = u.phone?.replace(/\D/g, ''); 
        
        if (cleanPhone && !seenPhones.has(cleanPhone)) {
          seenPhones.add(cleanPhone);
          uniqueUsers.push(u);
        }
      });

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => u.full_name?.includes(search) || u.phone?.includes(search));

  const getSourceBadge = (source) => {
    if (source === 'ticket') {
      return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100"><Ticket size={10}/> מדווח</span>;
    }
    return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100"><MessageSquare size={10}/> מתעניין</span>;
  };

  return (
    <div className="space-y-6 pb-20">
      
      <div className="bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
               <User className="text-blue-600"/> ספר תושבים
             </h2>
             <p className="text-slate-500 text-sm">כולל מדווחים ופניות כלליות ({users.length})</p>
          </div>
          <div className="relative w-full md:w-80 group">
             <Search className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
             <input 
               className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
               placeholder="חיפוש לפי שם או טלפון..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">טוען נתונים...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-5">שם מלא</th>
                  <th className="p-5">מקור</th>
                  <th className="p-5">טלפון</th>
                  <th className="p-5">אימייל</th>
                  <th className="p-5">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-slate-700 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${u.source === 'ticket' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {u.full_name?.[0]}
                      </div>
                      {u.full_name}
                    </td>
                    <td className="p-5">
                      {getSourceBadge(u.source)}
                    </td>
                    <td className="p-5 text-slate-600 font-mono text-sm">{u.phone}</td>
                    <td className="p-5 text-slate-500 text-sm">{u.email || '-'}</td>
                    <td className="p-5">
                       <a href={`tel:${u.phone}`} className="text-blue-600 text-sm font-bold hover:underline bg-blue-50 px-3 py-1 rounded-lg">חייג</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid gap-3">
             {filtered.map((u, i) => (
               <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md ${u.source === 'ticket' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200' : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-200'}`}>
                        {u.full_name?.[0]}
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-slate-800 text-lg">{u.full_name}</h3>
                       </div>
                       <div className="flex items-center gap-2">
                         {getSourceBadge(u.source)}
                         <p className="text-slate-500 text-sm font-mono tracking-wide">{u.phone}</p>
                       </div>
                    </div>
                 </div>
                 <a href={`tel:${u.phone}`} className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors border border-green-100">
                    <Phone size={20} className="fill-current" />
                 </a>
               </div>
             ))}
          </div>
        </>
      )}
    </div>
  );
}
