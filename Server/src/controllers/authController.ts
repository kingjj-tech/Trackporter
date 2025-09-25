import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role = 'passenger' } = req.body;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email,
        role,
        created_at: new Date().toISOString(),
      }]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: { id: data.user.id, email, role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
