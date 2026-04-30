
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnv() {
  const envPath = './.env';
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  });
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDatabase() {
  console.log('--- Database Diagnostic V2 ---');
  
  // Check if we can run a simple digest test via RPC (if we could, but we can't)
  // Instead, we'll try to check if extensions schema is accessible
  const { data: schemas, error: schemaError } = await supabase.rpc('get_current_user_role');
  console.log('RPC Status:', schemaError ? `FAIL (${schemaError.message})` : `SUCCESS (${schemas})`);

  // Check tables again to be sure
  const tables = ['profiles', 'security_threats'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    console.log(`Table [${table}]:`, error ? `FAIL (${error.message})` : 'OK');
  }
}

checkDatabase();
