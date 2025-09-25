import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { Trip } from '../../types';
import { useAuth } from './useAuth';

export const useTrips = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tripsQuery = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });

  const addTripMutation = useMutation({
    mutationFn: async (tripData: Partial<Trip>) => {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ ...tripData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Trip> }) => {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  return {
    trips: tripsQuery.data || [],
    isLoading: tripsQuery.isLoading,
    error: tripsQuery.error,
    addTrip: addTripMutation.mutate,
    updateTrip: updateTripMutation.mutate,
    isAddingTrip: addTripMutation.isPending,
    isUpdatingTrip: updateTripMutation.isPending,
    refetch: tripsQuery.refetch,
  };
};