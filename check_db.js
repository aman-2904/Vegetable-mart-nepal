import { createClient } from '@supabase/supabase-js';


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('products').select('id, name, image_url');
  if (error) {
    console.error(error);
  } else {
    const missing = data.filter(d => !d.image_url);
    console.log(`Total products: ${data.length}`);
    console.log(`Missing images: ${missing.length}`);
    console.log('Sample missing:', missing.slice(0, 3));
  }
}
main();
