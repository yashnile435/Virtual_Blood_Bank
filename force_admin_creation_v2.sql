-- 1. Create a function to safely create a user if not exists
CREATE OR REPLACE FUNCTION create_confirmed_user(user_email text, user_password text)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  -- Check if user exists
  SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;

  IF new_user_id IS NULL THEN
    -- Generate encrypted password
    encrypted_pw := crypt(user_password, gen_salt('bf'));
    
    -- Insert user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      user_email,
      encrypted_pw,
      now(), -- Auto-confirm
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO new_user_id;
  ELSE
    -- If user exists, update password and confirm email
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(user_password, gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now()
    WHERE id = new_user_id;
  END IF;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Execute function with desired credentials
-- DO NOT CHANGE THE PASSWORD HERE, IT IS PASSED AS A PLAIN TEXT ARGUMENT
DO $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := create_confirmed_user('super.admin@vbbs.com', 'Password@123'); -- Using a unique email to avoid conflicts

  -- 3. Insert into public.admins
  INSERT INTO public.admins (id, email, role)
  VALUES (admin_id, 'super.admin@vbbs.com', 'ADMIN')
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Admin created with ID: %', admin_id;
END $$;
