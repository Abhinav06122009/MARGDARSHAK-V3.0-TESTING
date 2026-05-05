
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  console.log('Inspecting profiles table...');
  const { data: profilesCols, error: pError } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
  if (pError) {
    console.error('Error fetching profiles columns:', pError);
    // Fallback: try to select one row and check types
    const { data: pData } = await supabase.from('profiles').select('*').limit(1);
    console.log('Sample profiles data:', pData);
  } else {
    console.log('Profiles columns:', profilesCols);
  }

  console.log('Inspecting contact_messages table...');
  const { data: contactCols, error: cError } = await supabase.rpc('get_table_columns', { table_name: 'contact_messages' });
  if (cError) {
    console.error('Error fetching contact_messages columns:', cError);
    const { data: cData } = await supabase.from('contact_messages').select('*').limit(1);
    console.log('Sample contact_messages data:', cData);
  } else {
    console.log('Contact messages columns:', contactCols);
  }
}

inspect();
