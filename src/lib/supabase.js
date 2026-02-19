import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://uveqginnoukrkjagpyaz.supabase.co"
const supabaseAnonKey = "sb_publishable_bShGUCK83tFUNhrgDkkAxA_g68xvH8Y"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
