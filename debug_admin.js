
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uveqginnoukrkjagpyaz.supabase.co"
const supabaseKey = "sb_publishable_bShGUCK83tFUNhrgDkkAxA_g68xvH8Y"

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAdmin() {
    const email = 'master@vbbs.com';
    const password = 'Password@123';

    console.log(`--- DEBUGGING ADMIN CREATION FOR ${email} ---`);

    // 1. Try Login
    console.log(`1. Attempting Login...`);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.log(`   Login Failed: ${loginError.message}`);
        console.log(`   -> This suggests the user does NOT exist in Auth, or password is wrong.`);

        // 2. Try Signup since login failed
        console.log(`2. Attempting Signup...`);
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email,
            password
        });

        if (signupError) {
            console.error(`   Signup Failed: ${signupError.message}`);
            return;
        }

        if (signupData?.user) {
            console.log(`   Signup Successful! User ID: ${signupData.user.id}`);
            if (!signupData.session) {
                console.warn(`   WARNING: No session returned. 'Confirm Email' might be enabled in Supabase.`);
                console.warn(`   -> You MUST go to Supabase Dashboard > Authentication and manually confirm this user.`);
            }
            await checkAndInsertAdmin(signupData.user.id, email);
        }

    } else {
        console.log(`   Login Successful! User ID: ${loginData.user.id}`);
        await checkAndInsertAdmin(loginData.user.id, email);
    }
}

async function checkAndInsertAdmin(userId, email) {
    console.log(`3. Checking 'admins' table for User ID: ${userId}...`);

    const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId);

    if (adminError) {
        console.error(`   Error reading admins table: ${adminError.message}`);
    }

    if (adminData && adminData.length > 0) {
        console.log(`   SUCCESS: User is already in 'admins' table.`);
        console.log(`   Row:`, adminData[0]);
    } else {
        console.log(`   User NOT found in 'admins' table. Attempting INSERT...`);

        const { data: insertData, error: insertError } = await supabase
            .from('admins')
            .insert([{ id: userId, email: email, role: 'ADMIN' }])
            .select();

        if (insertError) {
            console.error(`   INSERT Failed: ${insertError.message}`);
            console.error(`   -> This is likely an RLS Policy issue.`);
            console.log(`   -> SOLUTION: Run the SQL below in Supabase Dashboard SQL Editor:`);
            console.log(`\n   INSERT INTO public.admins (id, email, role) VALUES ('${userId}', '${email}', 'ADMIN');\n`);
        } else {
            console.log(`   INSERT SUCCESSFUL! Admin created.`);
        }
    }
}

debugAdmin();
