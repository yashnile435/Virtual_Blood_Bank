
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uveqginnoukrkjagpyaz.supabase.co"
const supabaseKey = "sb_publishable_bShGUCK83tFUNhrgDkkAxA_g68xvH8Y"

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNewAdmin() {
    // Using a new email to avoid "User already registered" errors with unknown passwords
    const email = 'master@vbbs.com';
    const password = 'Password@123';

    console.log(`Creating NEW admin user: ${email}...`);

    // 1. Sign Up
    let { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Signup failed:', error.message);
        // If user exists, try login (just in case we ran this script twice)
        if (error.message.includes('already registered')) {
            console.log('User exists, trying login...');
            const authResponse = await supabase.auth.signInWithPassword({ email, password });
            if (authResponse.error) {
                console.error('Login failed (password might be wrong?):', authResponse.error.message);
                return;
            }
            data = authResponse.data;
        } else {
            return;
        }
    }

    if (!data?.user) {
        console.error('No user returned from auth.');
        return;
    }

    const userId = data.user.id;
    console.log(`User ID: ${userId}`);

    // 2. Insert into admins table
    console.log('Adding to admins table...');
    const { error: insertError } = await supabase
        .from('admins')
        .insert([{ id: userId, email, role: 'ADMIN' }])
        .select();

    if (insertError) {
        if (insertError.code === '23505') {
            console.log('User is already in admins table. Success.');
        } else {
            console.error('Failed to add to admins table:', insertError.message);
            console.log('Check RLS policies if this fails.');
        }
    } else {
        console.log('SUCCESS: New Admin credentials created and linked.');
    }
}

createNewAdmin();
