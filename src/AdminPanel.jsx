import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Users, Clock, ShieldAlert, AlertOctagon, UserCog, Zap, Search, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSla, setNewCatSla] = useState(24);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: catsData } = await supabase.from('categories').select('*').order('id');
      setUsers(usersData || []);
      setCategories(catsData || []);
    } catch (error) { toast.error('שגיאה בטעינת נתונים'); } 
    finally { setLoading(false); }
  };

  const updateUserRole = async (id, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (!error) {
      toast.success('תפקיד עודכן');
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } else { toast.error('שגיאה בעדכון'); }
  };

  const updateSla = async (id, hours) => {
    const { error } = await supabase.from('categories').update({ sla_hours: hours }).eq('id', id);
    if (!error) toast.success('SLA עודכן');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    const { data, error } = await supabase.from('categories').insert([{ name: newCatName, sla_hours: newCatSla }]).select();
    if (error) toast.error('שגיאה');
    else {
      toast.success('קטגוריה נוספה');
      setCategories([...categories, data[0]]);
      setNewCatName('');
    }
  };

  const filteredUsers = users.filter(u => (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold animate-pulse">טוען...</div>;

  return (
    <div className="animate-enter pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div><h1 className="text-4xl font-black text-slate-800 tracking-tight">ניהול מתקדם</h1><p className="text-slate-500 mt-2 font-medium">שליטה מלאה במשתמשים והגדרות.</p></div>
        <div className="bg-red-50 border border-red-100 px-6 py-2 rounded-full flex items-center gap-2 text-red-600 font-bold text-sm shadow-sm"><AlertOctagon size={16} /> Restricted Area</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><UserCog className="text-blue-500"/> צוות והרשאות</h2>
             <input type="text" placeholder="חיפוש..." className="pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">{user.full_name ? user.full_name.charAt(0) : '?'}</div>
                    <div><h3 className="font-bold text-slate-800 text-lg">{user.full_name}</h3><p className="text-slate-400 text-sm">{user.email}</p></div>
                  </div>
                  <select value={user.role} onChange={(e) => updateUserRole(user.id, e.target.value)} className="bg-white border border-slate-200 text-slate-700 rounded-xl py-2 px-4 text-sm font-medium focus:border-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors shadow-sm">
                    <option value="pending">ממתין</option><option value="employee">עובד</option><option value="admin">מנהל</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Zap className="text-amber-500"/> הגדרות SLA</h2>
            <div className="space-y-3 mb-6">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 text-sm">{cat.name}</span>
                  <input type="number" defaultValue={cat.sla_hours} onBlur={(e) => updateSla(cat.id, e.target.value)} className="w-16 bg-white border border-slate-200 rounded-lg py-1 text-center text-slate-800 font-bold text-sm focus:border-blue-500 outline-none"/>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">הוספת חדש</h4>
              <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
                <input type="text" placeholder="שם הקטגוריה" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
                <div className="flex gap-3">
                  <input type="number" placeholder="שעות" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none w-24 text-center" value={newCatSla} onChange={(e) => setNewCatSla(e.target.value)} required />
                  <button className="bg-blue-600 text-white font-bold py-2 rounded-xl flex-1 hover:bg-blue-700 transition-colors shadow-md">הוסף</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}