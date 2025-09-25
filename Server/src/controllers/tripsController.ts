import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: any;
}

export const getUserTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { destination, start_date, amount_due, payment_status = 'unpaid' } = req.body;

    const { data, error } = await supabase
      .from('trips')
      .insert([{
        user_id: req.user.id,
        destination,
        start_date,
        amount_due,
        payment_status,
        created_at: new Date().toISOString(),
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

export const updateTripPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const { data, error } = await supabase
      .from('trips')
      .update({ payment_status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOutstandingBalances = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('payment_status', 'unpaid');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const totalOutstanding = data.reduce((sum, trip) => sum + trip.amount_due, 0);

    res.json({
      trips: data,
      total_outstanding: totalOutstanding,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
