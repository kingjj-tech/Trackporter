import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Trip } from '../../../types';
import { theme } from '../../theme';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  
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

  const unpaidTrips = trips.filter(trip => trip.payment_status === 'unpaid');
  const totalEarnings = trips
    .filter(trip => trip.payment_status === 'paid')
    .reduce((sum, trip) => sum + trip.amount_due, 0);
  const totalOwed = unpaidTrips.reduce((sum, trip) => sum + trip.amount_due, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {user?.email?.split('@')[0]}!
          </Text>
          <Chip icon="account-circle" mode="outlined">
            {user?.role?.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
            <Card.Content>
              <Text style={styles.statValue}>R{totalEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.warning }]}>
            <Card.Content>
              <Text style={styles.statValue}>R{totalOwed.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Amount Owed</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.recentTripsCard}>
          <Card.Title title="Recent Trips" />
          <Card.Content>
            {trips.slice(0, 3).map((trip) => (
              <View key={trip.id} style={styles.tripItem}>
                <View style={styles.tripDetails}>
                  <Text style={styles.destination}>{trip.destination}</Text>
                  <Text style={styles.tripDate}>
                    {new Date(trip.start_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.tripRight}>
                  <Text style={styles.amount}>R{trip.amount_due.toFixed(2)}</Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          trip.payment_status === 'paid'
                            ? theme.colors.accent
                            : theme.colors.warning,
                      },
                    ]}
                  >
                    {trip.payment_status.toUpperCase()}
                  </Chip>
                </View>
              </View>
            ))}
            
            {trips.length === 0 && (
              <Text style={styles.noTrips}>No trips yet. Add your first trip!</Text>
            )}
          </Card.Content>
          {trips.length > 3 && (
            <Card.Actions>
              <Button onPress={() => navigation.navigate('History')}>
                View All Trips
              </Button>
            </Card.Actions>
          )}
        </Card>

        {unpaidTrips.length > 0 && (
          <Card style={styles.alertCard}>
            <Card.Content>
              <Text style={styles.alertTitle}>⚠️ Unpaid Trips</Text>
              <Text style={styles.alertMessage}>
                You have {unpaidTrips.length} unpaid trip(s) totaling R{totalOwed.toFixed(2)}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Payment')}
              >
                Pay Now
              </Button>
            </Card.Actions>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Add Trip')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  recentTripsCard: {
    margin: 16,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tripDetails: {
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripDate: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  tripRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
  noTrips: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    paddingVertical: 20,
  },
  alertCard: {
    margin: 16,
    backgroundColor: '#fff3cd',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  alertMessage: {
    fontSize: 14,
    color: '#856404',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;