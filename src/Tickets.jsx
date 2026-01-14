import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Search, BrainCircuit, MessageCircle, Eye, Download, MapPin, CheckCircle, Plus, X, AlertTriangle, Frown, Smile } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast'; 
import { getCoordinates } from './utils';
import { analyzeText } from './aiUtils';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ full_name: '', phone: '', issue_address: '', category_id: '', description: '', status: 'חדש' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: tData } = await supabase.from('tickets').select('*, categories(name, sla_hours)').order('created_at', { ascending: false });
    const { data: cData } = await supabase.from('categories').select('*');
    if (tData) setTickets(tData);
    if (cData) setCategories(cData);
    setLoading(false);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('מפעיל AI...');
    let locationData = { lat: null, lng: null };
    if (newTicket.issue_address) {
      const coords = await getCoordinates(newTicket.issue_address);
      if (coords) locationData = coords;
    }
    const ai = analyzeText(newTicket.description);
    const { error } = await supabase.from('tickets').insert([{ ...newTicket, lat: locationData.lat, lng: locationData.lng, priority: ai.priority, sentiment: ai.sentiment }]);
    
    toast.dismiss(loadingToast);
    if (error) toast.error('שגיאה');
    else {
      toast.success('נוצר בהצלחה');
      fetchData(); setShowForm(false); setNewTicket({ full_name: '', phone: '', issue_address: '', category_id: '', description: '', status: 'חדש' });
    }
  };

  const updateStatus = async (id, newStatus) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tickets').update({ status: newStatus }).eq('id', id);
    toast.success('סטטוס עודכן');
  };

  const updateNotes = async (id, notes) => {
    await supabase.from('tickets').update({ treatment_details: notes }).eq('id', id);
    toast.success('נשמר');
  };

  const sendWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '972');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`שלום ${name}, פנייתך בטיפול.`)}`, '_blank');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tickets);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "דוח");
    XLSX.writeFile(wb, `Report.xlsx`);
  };

  const generateWordReport = (ticket) => {
    const doc = new Document({ sections: [{ children: [ new Paragraph({ text: `דוח פנייה #${ticket.id}`, heading: HeadingLevel.TITLE }) ]}]});
    Packer.toBlob(doc).then((blob) => { saveAs(blob, `Report_${ticket.id}.docx`); toast.success('הורד'); });
  };

  const displayedTickets = tickets.filter(t => (filter === 'all' || t.status === filter) && (t.full_name + t.description).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <div className="p-8">
      <div className="skeleton w-full h-96"></div>
    </div>
  );

  return (
    <div className="animate-enter pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div><h1 className="text-4xl font-black text-slate-800 tracking-tight">ניהול פניות</h1><p className="text-slate-500 mt-1 flex items-center gap-2 font-medium"><BrainCircuit size={18} className="text-blue-600"/> תיעדוף משימות (AI)</p></div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2">
            <Plus size={20}/> פתיחת קריאה
          </button>
          <button onClick={exportToExcel} className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Download size={20}/> ייצוא
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] mb-8 shadow-xl border border-slate-100 animate-in">
          <h3 className="font-bold text-xl mb-6 text-slate-800">פתיחת קריאה ידנית</h3>
          <form onSubmit={handleCreateTicket} className="grid grid-cols-2 gap-6">
            <input required placeholder="שם מלא" className="p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" value={newTicket.full_name} onChange={e => setNewTicket({...newTicket, full_name: e.target.value})} />
            <input required placeholder="טלפון" className="p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" value={newTicket.phone} onChange={e => setNewTicket({...newTicket, phone: e.target.value})} />
            <input required placeholder="כתובת" className="p-4 bg-slate-50 border border-slate-200 rounded-xl col-span-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" value={newTicket.issue_address} onChange={e => setNewTicket({...newTicket, issue_address: e.target.value})} />
            <select required className="p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium cursor-pointer" value={newTicket.category_id} onChange={e => setNewTicket({...newTicket, category_id: e.target.value})}>
              <option value="">בחר קטגוריה...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="תיאור" className="p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
            <button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-md transition-all">שמור במערכת</button>
          </form>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
         <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
           {['all', 'חדש', 'בטיפול', 'סגור'].map(f => (
             <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{f === 'all' ? 'הכל' : f}</button>
           ))}
         </div>
         <div className="relative">
            <Search className="absolute right-4 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="חיפוש חופשי..." className="pl-4 pr-12 py-2.5 bg-white border border-slate-200 rounded-2xl w-80 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[300px]">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100"><tr><th className="p-6">דחיפות (AI)</th><th className="p-6">סטטוס</th><th className="p-6">פרטים</th><th className="p-6">קשר</th><th className="p-6">פעולות</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {displayedTickets.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">אין פניות להציג</h3>
                    <p className="text-sm">נראה שהכל רגוע בעיר כרגע...</p>
                    <button onClick={() => setShowForm(true)} className="mt-4 text-blue-600 font-bold hover:underline">
                      פתח פנייה חדשה ידנית
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {displayedTickets.map(t => (
              <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-6">
                   <div className="flex flex-col gap-2 items-start">
                     {t.priority === 'קריטי' ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">קריטי 🔥</span> : t.priority === 'דחוף' ? <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold">דחוף ⚡</span> : <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">רגיל</span>}
                     {t.sentiment === 'שלילי' && <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold"><Frown size={12}/> כועס</div>}
                   </div>
                </td>
                <td className="p-6">
                   <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className={`font-bold text-sm bg-transparent cursor-pointer outline-none px-2 py-1 rounded ${t.status === 'חדש' ? 'text-red-600' : t.status === 'בטיפול' ? 'text-orange-600' : 'text-green-600'}`}><option>חדש</option><option>בטיפול</option><option>סגור</option></select>
                </td>
                <td className="p-6">
                  <p className="font-bold text-slate-800 text-lg">{t.categories?.name}</p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin size={14}/> {t.issue_address}</p>
                </td>
                <td className="p-6">
                  <p className="text-sm font-bold text-slate-900">{t.full_name}</p>
                  <button onClick={() => sendWhatsApp(t.phone, t.full_name)} className="text-green-600 hover:text-green-700 text-xs mt-1 flex items-center gap-1 font-medium bg-green-50 px-2 py-1 rounded-lg w-fit hover:bg-green-100 transition-colors"><MessageCircle size={12}/> {t.phone}</button>
                </td>
                <td className="p-6">
                  <button onClick={() => setSelectedTicket(t)} className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 p-3 rounded-2xl transition-all shadow-sm">
                    <Eye size={20}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-black text-slate-800">פנייה #{selectedTicket.id}</h2>
              <button onClick={() => setSelectedTicket(null)} className="p-3 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-8">
               <p className="text-lg text-slate-800 mb-6">"{selectedTicket.description}"</p>
               {selectedTicket.image_url && <img src={selectedTicket.image_url} alt="Evidence" className="w-full h-64 object-cover rounded-2xl mb-6 shadow-md"/>}
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold mb-3 text-slate-700">טיפול והערות</h4>
                  <textarea className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white min-h-[100px]" defaultValue={selectedTicket.treatment_details} onBlur={(e) => updateNotes(selectedTicket.id, e.target.value)} placeholder="עדכן סטטוס..."></textarea>
               </div>
               <button onClick={() => generateWordReport(selectedTicket)} className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"><Download size={20}/> הורד דוח (Word)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}