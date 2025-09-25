import { supabase } from './supabaseClient';

export const api = {
  auth: {
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    signUp: async (email: string, password: string, role: string = 'passenger') => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ id: data.user.id, email, role }]);
        
        if (profileError) throw profileError;
      }
      
      return data;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    getCurrentUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  },

  trips: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    create: async (trip: any) => {
      const { data, error } = await supabase
        .from('trips')
        .insert([trip])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  payments: {
    process: async (tripIds: string[], paymentMethod: string) => {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('trips')
        .update({ payment_status: 'paid' })
        .in('id', tripIds);
      
      if (error) throw error;
    },
  },
};
