import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emfgvuipdinblypxxpsg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZmd2dWlwZGluYmx5cHh4cHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDE2NTUsImV4cCI6MjA5NjA3NzY1NX0.8ogfAdXBecDshS6bDXR3A-cCcxHx_3Le6cn7OoTv6Lo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)