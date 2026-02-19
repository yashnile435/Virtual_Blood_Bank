
import { createClient } from '@supabase/supabase-js';

// Hardcode from src/lib/supabase.js to avoid relative import issues in simple script
const supabaseUrl = "https://uveqginnoukrkjagpyaz.supabase.co"
const supabaseKey = "sb_publishable_bShGUCK83tFUNhrgDkkAxA_g68xvH8Y" // Assuming this is anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin@vbbs.com';
    const password = 'Password@123'; // Stronger password to satisfy policies

    console.log(`Creating admin user: ${email}...`);

    // 1. Sign Up
    let { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('User already registered')) {
            console.log('User already exists. Trying login...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (loginError) {
                console.error('Login failed:', loginError.message);
                return;
            }
            data = loginData;
        } else {
            console.error('Signup failed:', error.message);
            return;
        }
    }

    if (!data?.user) {
        console.error('No user returned.');
        return;
    }

    const userId = data.user.id;
    console.log(`User ID: ${userId}`);

    // 2. Insert into admins table
    console.log('Adding to admins table...');
    const { error: insertError } = await supabase
        .from('admins')
        .insert([{ id: userId, email }]);

    if (insertError) {
        // If already exists, ignore
        if (insertError.code === '23505') { // Unique violation
            console.log('User is already an admin.');
        } else {
            console.error('Failed to add to admins table:', insertError.message);
            console.log('You may need to run this SQL manually in Supabase editor:');
            console.log(`INSERT INTO public.admins (id, email) VALUES ('${userId}', '${email}');`);
        }
    } else {
        console.log('Successfully created admin credentials!');
        console.log('Email: ' + email);
        console.log('Password: ' + password);
    }
}

createAdmin();
