import { createClient } from '@supabase/supabase-js';

// הגדרות החיבור ל-Supabase
// החלף את הערכים האלו בערכים שלך מ-Supabase Settings -> API
const supabaseUrl = 'https://eogcxnlsydjfohdtnzzn.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_EoUHeI_6S13xCCXoKELHTQ_QXmjyXNn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);