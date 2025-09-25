import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, Searchbar, FAB } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Trip } from '../../../types';
import { theme } from '../../theme';

const TripHistoryScreen = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ['user-trips', user?.id],
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

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      const { error } = await supabase
        .from('trips')
        .update({ payment_status: status })
        .eq('id', tripId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
    },
  });

  const filteredTrips = trips.filter(trip =>
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTrip = ({ item: trip }: { item: Trip }) => (
    <Card style={styles.tripCard}>
      <Card.Content>
        <View style={styles.tripHeader}>
          <Text style={styles.destination}>{trip.destination}</Text>
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              {
                backgroundColor:
                  trip.payment_status === 'paid'
                    ? theme.colors.accent
                    : trip.payment_status === 'partial'
                    ? theme.colors.warning
                    : '#ffcdd2',
              },
            ]}
          >
            {trip.payment_status.toUpperCase()}
          </Chip>
        </View>
        
        <Text style={styles.date}>
          {new Date(trip.start_date).toLocaleDateString('en-ZA')}
        </Text>
        
        <Text style={styles.amount}>R{trip.amount_due.toFixed(2)}</Text>
      </Card.Content>
      
      {user?.role !== 'passenger' && (
        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() =>
              updatePaymentMutation.mutate({
                tripId: trip.id,
                status: trip.payment_status === 'paid' ? 'unpaid' : 'paid',
              })
            }
            disabled={updatePaymentMutation.isPending}
          >
            Mark as {trip.payment_status === 'paid' ? 'Unpaid' : 'Paid'}
          </Button>
        </Card.Actions>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search trips..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={filteredTrips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trips found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  searchbar: {
    marginBottom: 16,
    elevation: 4,
  },
  tripCard: {
    margin: 8,
    elevation: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  date: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
  },
});

export default TripHistoryScreen;