import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: any;
}

export const overridePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const { data, error } = await supabase
      .from('trips')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert([{
        admin_id: req.user.id,
        action: 'payment_override',
        trip_id: id,
        details: { old_status: data.payment_status, new_status: payment_status },
        created_at: new Date().toISOString(),
      }]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        users (email, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};