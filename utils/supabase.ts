// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wmlrbykhfxjeyzvsxiok.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHJieWtoZnhqZXl6dnN4aW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODAzNDksImV4cCI6MjA4NTk1NjM0OX0.wQxjLVVD_ohRK71bMv4hECIt48SdAnvTF6ousL0BYO0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)