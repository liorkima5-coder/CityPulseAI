import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Search, MessageSquare, Phone, Mail, Trash2, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      toast.error('שגיאה בטעינת הודעות');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק הודעה זו?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('ההודעה נמחקה');
      fetchLeads(); // רענון הרשימה
    } catch (error) {
      toast.error('שגיאה במחיקה');
    }
  };

  const filteredLeads = leads.filter(l => 
    l.full_name?.includes(search) || 
    l.phone?.includes(search) || 
    l.message?.includes(search)
  );

  return (
    <div className="space-y-6 pb-24">
      
      {/* --- Header --- */}
      <div className="bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-purple-600"/> הודעות ופניות
            </h2>
            <p className="text-slate-500 text-sm">פניות מ"צור קשר" ({filteredLeads.length})</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
             <Search className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
             <input 
               className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium" 
               placeholder="חיפוש בהודעות..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">טוען הודעות...</div>
      ) : (
        <>
          {filteredLeads.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold">אין הודעות חדשות</p>
            </div>
          )}

          {/* --- Desktop View (Table) --- */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-purple-50/50 text-purple-900/50 text-xs uppercase font-bold">
                <tr>
                  <th className="p-5">תאריך</th>
                  <th className="p-5">שולח</th>
                  <th className="p-5">פרטי קשר</th>
                  <th className="p-5 w-1/3">תוכן ההודעה</th>
                  <th className="p-5">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-5 text-slate-500 text-sm font-mono">
                      {new Date(lead.created_at).toLocaleDateString('he-IL')}
                      <br/>
                      <span className="text-xs opacity-60">{new Date(lead.created_at).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-5 font-bold text-slate-700">{lead.full_name}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <Phone size={14}/> {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail size={14}/> {lead.email}
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        {lead.message}
                      </div>
                    </td>
                    <td className="p-5">
                       <button 
                         onClick={() => handleDelete(lead.id)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                         title="מחק הודעה"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Mobile View (Cards) --- */}
          <div className="md:hidden grid gap-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.99] transition-transform">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                      {lead.full_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{lead.full_name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12}/> 
                        {new Date(lead.created_at).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(lead.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 relative">
                   <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 transform rotate-45"></div>
                   <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                     {lead.message}
                   </p>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${lead.phone}`} className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                    <Phone size={16}/> חייג
                  </a>
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                      <Mail size={16}/> מייל
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
