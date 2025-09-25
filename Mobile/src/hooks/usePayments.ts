import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export const usePayments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const unpaidTripsQuery = useQuery({
    queryKey: ['unpaid-trips', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .eq('payment_status', 'unpaid')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const processPaymentMutation = useMutation({
    mutationFn: async ({ tripIds, paymentMethod }: { tripIds: string[]; paymentMethod: string }) => {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update trips to paid status
      const { error } = await supabase
        .from('trips')
        .update({ payment_status: 'paid' })
        .in('id', tripIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['unpaid-trips'] });
    },
  });

  return {
    unpaidTrips: unpaidTripsQuery.data || [],
    isLoading: unpaidTripsQuery.isLoading,
    processPayment: processPaymentMutation.mutate,
    isProcessing: processPaymentMutation.isPending,
    refetch: unpaidTripsQuery.refetch,
  };
};