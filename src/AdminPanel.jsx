import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Plus, Trash2, Shield, Settings, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCat) return;
    setLoading(true);
    const { error } = await supabase.from('categories').insert([{ name: newCat }]);
    if (error) toast.error('שגיאה');
    else {
      toast.success('קטגוריה נוספה');
      setNewCat('');
      fetchCategories();
    }
    setLoading(false);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('בטוח?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('נמחק');
    fetchCategories();
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      
      <div className="text-center md:text-right mb-8">
         <h2 className="text-3xl font-black text-slate-800 mb-2">הגדרות מערכת</h2>
         <p className="text-slate-500">ניהול קטגוריות, משתמשים והרשאות</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Categories Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <Tag size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">ניהול קטגוריות</h3>
          </div>

          <form onSubmit={addCategory} className="flex gap-3 mb-6">
            <input 
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              placeholder="שם קטגוריה חדשה..." 
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
            />
            <button disabled={loading} className="bg-slate-900 text-white px-5 rounded-xl hover:bg-black transition-all flex items-center justify-center shadow-lg shadow-slate-900/20 active:scale-95">
              <Plus size={24} />
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {categories.map(c => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                <span className="font-bold text-slate-700">{c.name}</span>
                <button onClick={() => deleteCategory(c.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Admins Card (Placeholder) */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden opacity-80">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
               <Shield size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">מנהלי מערכת</h3>
          </div>
          <p className="text-slate-500 mb-6 leading-relaxed">
            כאן תוכל להוסיף משתמשי ניהול חדשים ולשלוט בהרשאות גישה לדשבורד.
            <br/><span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded mt-2 inline-block">בקרוב</span>
          </p>
          <div className="space-y-3 blur-[2px] pointer-events-none select-none">
             <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
             <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
             <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
