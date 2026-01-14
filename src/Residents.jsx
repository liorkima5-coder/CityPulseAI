import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Search, Mail, Phone, User, Shield } from 'lucide-react';

export default function Residents() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      // נביא נתונים מטבלת הכרטיסים כ"מקור" לתושבים (לדוגמה)
      // במערכת אמיתית זה יבוא מטבלת profiles או users
      const { data } = await supabase.from('tickets').select('full_name, phone, email').order('created_at');
      
      // סינון כפילויות (כי אותו תושב יכול לפתוח כמה פניות)
      const uniqueUsers = [];
      const seenPhones = new Set();
      
      if (data) {
        data.forEach(u => {
          if (!seenPhones.has(u.phone)) {
            seenPhones.add(u.phone);
            uniqueUsers.push(u);
          }
        });
      }
      setUsers(uniqueUsers);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => u.full_name?.includes(search) || u.phone?.includes(search));

  return (
    <div className="space-y-6 pb-20">
      
      <div className="bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <User className="text-blue-600"/> מאגר תושבים
          </h2>
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
        <div className="text-center py-20 text-slate-400">טוען תושבים...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-5">שם מלא</th>
                  <th className="p-5">טלפון</th>
                  <th className="p-5">אימייל</th>
                  <th className="p-5">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-slate-700 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs">
                        {u.full_name?.[0]}
                      </div>
                      {u.full_name}
                    </td>
                    <td className="p-5 text-slate-600 font-mono text-sm">{u.phone}</td>
                    <td className="p-5 text-slate-500 text-sm">{u.email || '-'}</td>
                    <td className="p-5">
                       <a href={`tel:${u.phone}`} className="text-blue-600 text-sm font-bold hover:underline">חייג</a>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-blue-200">
                        {u.full_name?.[0]}
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800 text-lg">{u.full_name}</h3>
                       <p className="text-slate-500 text-sm font-mono tracking-wide">{u.phone}</p>
                    </div>
                 </div>
                 <a href={`tel:${u.phone}`} className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors">
                    <Phone size={20} fill="currentColor" className="opacity-20"/> 
                    <Phone size={20} className="absolute" />
                 </a>
               </div>
             ))}
          </div>
        </>
      )}
    </div>
  );
}
