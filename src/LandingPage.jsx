import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ArrowLeft, Phone, MapPin, Upload, CheckCircle2, Zap, Send, Activity, Shield, Mail, Loader2, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCoordinates } from './utils';
import { analyzeText } from './aiUtils';
import Footer from './Footer';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from "react-google-recaptcha";

export default function LandingPage() {
  const navigate = useNavigate();
  const captchaRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [ticket, setTicket] = useState({ full_name: '', phone: '', email: '', issue_address: '', category_id: '', description: '' });
  const [lead, setLead] = useState({ full_name: '', phone: '', email: '', message: '' });
  const [imageFile, setImageFile] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCats();
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('הדפדפן לא תומך במיקום');
      return;
    }

    setLocationLoading(true);
    toast.loading('מאתר מיקום מדויק...', { id: 'gps' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=he`);
          const data = await response.json();
          
          if (data && data.display_name) {
            const shortAddress = data.display_name.split(',')[0] + ', ' + (data.address.city || data.address.town || 'ירושלים');
            setTicket(prev => ({ ...prev, issue_address: shortAddress }));
            toast.success('המיקום אותר בהצלחה', { id: 'gps' });
          } else {
            throw new Error('כתובת לא נמצאה');
          }
        } catch (error) {
          console.error(error);
          toast.error('לא ניתן לתרגם את המיקום לכתובת', { id: 'gps' });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error('נדרש אישור גישה למיקום', { id: 'gps' });
        setLocationLoading(false);
      }
    );
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast.error('אנא אשר שאינך רובוט');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('מעבד נתונים ושולח אישור...');

    try {
      let finalImageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('ticket-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('ticket-images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      let locationData = { lat: null, lng: null };
      if (ticket.issue_address) {
        const coords = await getCoordinates(ticket.issue_address);
        if (coords) locationData = coords;
      }

      const ai = analyzeText(ticket.description);

      const { error } = await supabase.from('tickets').insert([{ 
        ...ticket, 
        lat: locationData.lat, 
        lng: locationData.lng, 
        priority: ai.priority, 
        sentiment: ai.sentiment, 
        image_url: finalImageUrl, 
        status: 'חדש' 
      }]);

      if (error) throw error;

      const emailParams = {
        user_email: ticket.email,
        full_name: ticket.full_name,
        phone: ticket.phone,
        issue_address: ticket.issue_address,
        description: ticket.description
      };

      try {
        await emailjs.send('service_gqgrw7k', 'template_6k7atdm', emailParams, 'KBeKkfIc4BZfSRNwb');
      } catch (emailErr) {
        console.warn('Email failed', emailErr);
      }

      toast.success('הדיווח נקלט במערכת!');
      setTicket({ full_name: '', phone: '', email: '', issue_address: '', category_id: '', description: '' });
      setImageFile(null);
      navigate('/thank-you');

    } catch (error) { 
      toast.error('שגיאה: ' + error.message); 
    } finally { 
      setLoading(false); 
      toast.dismiss(loadingToast); 
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('leads').insert([lead]);
    if (!error) { 
        toast.success('פנייתך נשלחה בהצלחה!'); 
        setLead({ full_name: '', phone: '', email: '', message: '' }); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
              <Activity size={22} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">City<span className="text-blue-600">Pulse</span></span>
          </div>
          <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            כניסה למערכת <ArrowLeft size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 bg-gradient-to-b from-white via-blue-50/30 to-[#f8fafc]">
        <div className="container mx-auto text-center max-w-4xl animate-enter">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-600 tracking-wide">מוקד חכם 24/7</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
            מהפכת השירות לתושב<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">מתחילה כאן.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            מערכת הדיווח המתקדמת בישראל. בינה מלאכותית מנתחת כל פנייה, מזהה מיקום מדויק ומעבירה לטיפול מידי. שקוף, מהיר ויעיל.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => document.getElementById('report').scrollIntoView({behavior: 'smooth'})} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <Zap size={20} fill="currentColor"/> דווח על מפגע
            </button>
            <button className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
              <Map size={20}/> מפת מפגעים חיה
            </button>
          </div>
        </div>
      </section>

      {/* Forms Grid */}
      <div id="report" className="container mx-auto px-4 sm:px-6 pb-24 grid lg:grid-cols-12 gap-8">
        
        {/* Ticket Form (Main) */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <Shield size={28}/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">דיווח על מפגע חדש</h2>
              <p className="text-slate-500 font-medium text-sm">המערכת תתעדף את הפנייה אוטומטית</p>
            </div>
          </div>

          <form onSubmit={handleTicketSubmit} className="space-y-5">
            {/* פרטים אישיים */}
            <div className="p-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">פרטיים אישיים</label>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="שם מלא" value={ticket.full_name} onChange={e => setTicket({...ticket, full_name: e.target.value})} />
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="טלפון נייד" value={ticket.phone} onChange={e => setTicket({...ticket, phone: e.target.value})} />
                </div>
                <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="כתובת אימייל (לקבלת עדכונים)" value={ticket.email} onChange={e => setTicket({...ticket, email: e.target.value})} />
            </div>

            {/* מיקום ופרטים */}
            <div className="p-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">פרטי האירוע</label>
                
                <div className="relative mb-4">
                    <input required className="w-full p-4 pl-14 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="כתובת המפגע (או לחץ על הכפתור)" value={ticket.issue_address} onChange={e => setTicket({...ticket, issue_address: e.target.value})} />
                    <button type="button" onClick={handleUseMyLocation} className="absolute left-2 top-2 bottom-2 aspect-square bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-all flex items-center justify-center shadow-sm" title="השתמש במיקום שלי">
                        {locationLoading ? <Loader2 className="animate-spin" size={20}/> : <MapPin size={20} />}
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <select required className="md:col-span-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium cursor-pointer" value={ticket.category_id} onChange={e => setTicket({...ticket, category_id: e.target.value})}>
                        <option value="">סוג המפגע...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <label className="md:col-span-2 flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                        <div className="flex items-center gap-3 text-slate-500 font-bold group-hover:text-blue-600 transition-colors">
                            {imageFile ? <CheckCircle2 className="text-green-500"/> : <Upload/>}
                            <span>{imageFile ? 'התמונה צורפה בהצלחה' : 'הוסף תמונה מהשטח'}</span>
                        </div>
                    </label>
                </div>

                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" rows="3" placeholder="תאר את המפגע בקצרה..." value={ticket.description} onChange={e => setTicket({...ticket, description: e.target.value})}></textarea>
            </div>

            {/* CAPTCHA & Submit */}
            <div className="pt-2 flex flex-col items-center gap-4">
               <div className="scale-90 origin-center">
                   <ReCAPTCHA
                      ref={captchaRef}
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={(token) => setCaptchaToken(token)}
                   />
               </div>

               <button disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin"/> : <>שלח דיווח לטיפול <Send size={18}/></>}
               </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <Phone className="text-blue-300" />
                </div>
                <h3 className="text-2xl font-black mb-2">מוקד עירוני 24/7</h3>
                <p className="text-slate-300 mb-8 font-medium leading-relaxed">
                    אנחנו זמינים עבורך בכל שעה. צוותי החירום והתחזוקה שלנו ערוכים לטפל בכל פנייה במהירות האפשרית.
                </p>
                <div className="text-lg font-bold bg-white/10 p-4 rounded-xl inline-flex items-center gap-3 border border-white/10">
                  <span>חייגו 106 מכל טלפון</span>
                </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-6 text-lg flex items-center gap-2">
                <Mail size={18} className="text-blue-500"/> צור קשר כללי
            </h4>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="שם מלא" value={lead.full_name} onChange={e => setLead({...lead, full_name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="טלפון" value={lead.phone} onChange={e => setLead({...lead, phone: e.target.value})} />
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="מייל" value={lead.email} onChange={e => setLead({...lead, email: e.target.value})} />
              </div>
              <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium resize-none" rows="2" placeholder="במה אפשר לעזור?" value={lead.message} onChange={e => setLead({...lead, message: e.target.value})}></textarea>
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors">שלח הודעה</button>
            </form>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}