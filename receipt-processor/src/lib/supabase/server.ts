import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const cookieStore = cookies();
  
  return createServerComponentClient({
    cookies: () => cookieStore
  });
};

export const supabaseServer = createServerClient();
