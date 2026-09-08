const SUPABASE_URL = "https://flqopzpplglpytawexjs.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_CTSBpJKg9HJTYj5-eX4E1Q_G2nDh0cS";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);