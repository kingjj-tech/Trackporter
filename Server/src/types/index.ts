export interface User {
  id: string;
  email: string;
  role: 'admin' | 'driver' | 'passenger';
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  driver_id?: string;
  destination: string;
  start_date: string;
  end_date?: string;
  payment_status: 'paid' | 'unpaid' | 'partial';
  amount_due: number;
  created_at: string;
}

export interface Payment {
  id: string;
  trip_id: string;
  amount: number;
  payment_status: 'completed' | 'pending' | 'failed';
  payment_date: string;
  payment_method?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read: boolean;
  sent_at: string;
}