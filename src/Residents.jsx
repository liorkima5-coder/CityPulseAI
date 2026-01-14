import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Phone, Mail, MessageSquare, Check, User, MapPin, Ticket, Search, UserPlus, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Residents() {
  const [activeTab, setActiveTab] = useState('leads'); 
  const [leads, setLeads] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newLead, setNewLead] = useState({ full_name: '', phone: '', email: '', message: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    const { data: ticketsData } = await supabase.from('tickets').select('full_name, phone, issue_address, created_at, id');

    if (leadsData) setLeads(leadsData);
    if (ticketsData) {
      const uniqueMap = ticketsData.reduce((acc, curr) => {
        if (!acc[curr.phone]) {
          acc[curr.phone] = { ...curr, reportsCount: 1, lastReport: curr.created_at };
        } else {
          acc[curr.phone].reportsCount += 1;
          if (new Date(curr.created_at) > new Date(acc[curr.phone].lastReport)) acc[curr.phone].lastReport = curr.created_at;
        }
        return acc;
      }, {});
      setResidents(Object.values(uniqueMap));
    }
    setLoading(false);
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('leads').insert([newLead]).select();
    if (!error) {
      setLeads([data[0], ...leads]);
      setShowForm(false);
      setNewLead({ full_name: '', phone: '', email: '', message: '' });
      toast.success('ליד נוסף בהצלחה');
    }
  };

  const toggleLeadStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'פתוח' ? 'סגור' : 'פתוח';
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success('סטטוס ליד עודכן');
    }
  };

  const filteredLeads = leads.filter(l => (l.full_name + l.phone).includes(searchTerm));
  const filteredResidents = residents.filter(r => (r.full_name + r.phone).includes(searchTerm));

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold animate-pulse">טוען נתונים...</div>;

  return (
    <div className="animate-enter pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">ניהול קשרי תושבים</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">מאגר מידע ופניות</p>
        </div>
        {/* כפתור הוספה ברור */}
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2">
          <UserPlus size={20}/> הוסף ליד חדש
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
          {/* טאבים ברורים */}
          <button onClick={() => setActiveTab('leads')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'leads' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            פניות מהאתר ({leads.length})
          </button>
          <button onClick={() => setActiveTab('residents')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'residents' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            ספר תושבים ({residents.length})
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute right-4 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="חיפוש מהיר..." 
            className="pl-4 pr-12 py-2.5 bg-white border border-slate-200 rounded-2xl w-80 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] mb-8 border border-blue-50 shadow-xl animate-in">
           <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><UserPlus className="text-blue-500"/> רישום ליד חדש</h3>
           <form onSubmit={handleAddLead} className="grid grid-cols-2 gap-6">
             <input required placeholder="שם מלא" className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newLead.full_name} onChange={e => setNewLead({...newLead, full_name: e.target.value})} />
             <input required placeholder="טלפון" className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
             <input placeholder="אימייל" className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
             <input placeholder="הודעה" className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newLead.message} onChange={e => setNewLead({...newLead, message: e.target.value})} />
             <button className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all">שמור במערכת</button>
           </form>
        </div>
      )}

      {/* Grid Content - Same logic, clean cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'leads' && filteredLeads.map(lead => (
          <div key={lead.id} className={`bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all ${lead.status === 'סגור' ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-bold text-slate-800 text-lg">{lead.full_name}</h3>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lead.status === 'פתוח' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{lead.status}</span>
               </div>
               <button onClick={() => toggleLeadStatus(lead.id, lead.status)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500">
                 {lead.status === 'פתוח' ? <Check size={18} /> : <MessageSquare size={18} />}
               </button>
            </div>
            <p className="text-slate-600 text-sm mb-4">"{lead.message}"</p>
            <div className="flex gap-2 text-xs text-slate-400 font-medium">
               <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
            </div>
          </div>
        ))}

        {activeTab === 'residents' && filteredResidents.map((res, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">{res.full_name.charAt(0)}</div>
               <div>
                 <h3 className="font-bold text-slate-800 text-lg">{res.full_name}</h3>
                 <div className="flex items-center gap-1 text-amber-500 text-xs font-bold"><Star size={10} fill="currentColor"/> תושב רשום</div>
               </div>
             </div>
             <div className="space-y-2 text-sm text-slate-600">
               <div className="flex justify-between"><span>טלפון:</span> <span className="font-bold">{res.phone}</span></div>
               <div className="flex justify-between"><span>כתובת:</span> <span className="font-medium">{res.issue_address || '-'}</span></div>
               <div className="flex justify-between pt-2 border-t mt-2"><span>סה״כ פניות:</span> <span className="font-bold text-blue-600">{res.reportsCount}</span></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}