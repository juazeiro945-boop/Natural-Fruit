import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUA_URL_SUPABASE'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'SUA_CHAVE_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
