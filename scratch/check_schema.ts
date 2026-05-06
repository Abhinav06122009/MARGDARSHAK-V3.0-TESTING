
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking profiles table schema...');
  const { data, error } = await supabase.rpc('get_table_schema', { t_name: 'profiles' });
  
  if (error) {
    console.log('RPC get_table_schema failed, trying raw query via dashboardService check...');
    // We can't do raw SQL from frontend, so we'll just try to fetch one row and check keys
    const { data: row, error: fetchError } = await supabase.from('profiles').select('*').limit(1);
    if (fetchError) {
      console.error('Fetch error:', fetchError);
    } else {
      console.log('Sample profile row keys:', Object.keys(row[0] || {}));
      console.log('Sample data:', row[0]);
    }
  } else {
    console.log('Schema:', data);
  }
}

checkSchema();
