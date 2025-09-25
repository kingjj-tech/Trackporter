import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: any;
}

export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { trip_ids, payment_method, amount } = req.body;

    const payments = [];
    
    for (const trip_id of trip_ids) {
      // Get trip details
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', trip_id)
        .eq('user_id', req.user.id)
        .single();

      if (tripError || !trip) {
        return res.status(400).json({ error: `Trip ${trip_id} not found` });
      }

      // Record payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          trip_id,
          amount: trip.amount_due,
          payment_status: 'completed',
          payment_method,
          payment_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (paymentError) {
        return res.status(400).json({ error: paymentError.message });
      }

      // Update trip status
      await supabase
        .from('trips')
        .update({ payment_status: 'paid' })
        .eq('id', trip_id);

      payments.push(payment);
    }

    res.status(201).json({
      message: 'Payments processed successfully',
      payments
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};