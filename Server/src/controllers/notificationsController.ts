import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: any;
}

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, message, type = 'general' } = req.body;

    if (user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id,
        message,
        type,
        sent_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('sent_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};