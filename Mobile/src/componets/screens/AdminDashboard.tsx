import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Text, Button, Chip, Searchbar, DataTable, FAB } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabaseClient';
import { Trip, User } from '../../../types';
import { theme } from '../../theme';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: allTrips = [] } = useQuery({
    queryKey: ['all-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          users (email, role)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
  });

  const overridePaymentMutation = useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      const { error } = await supabase
        .from('trips')
        .update({ payment_status: status })
        .eq('id', tripId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
    },
  });

  const totalEarnings = allTrips
    .filter((trip: any) => trip.payment_status === 'paid')
    .reduce((sum: number, trip: any) => sum + trip.amount_due, 0);

  const totalPending = allTrips
    .filter((trip: any) => trip.payment_status === 'unpaid')
    .reduce((sum: number, trip: any) => sum + trip.amount_due, 0);

  const renderOverview = () => (
    <ScrollView>
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <Text style={styles.statValue}>{allTrips.length}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.accent }]}>
          <Card.Content>
            <Text style={styles.statValue}>R{totalEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.warning }]}>
          <Card.Content>
            <Text style={styles.statValue}>R{totalPending.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Pending Payments</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
          <Card.Content>
            <Text style={styles.statValue}>{allUsers.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.recentActivity}>
        <Card.Title title="Recent Activity" />
        <Card.Content>
          {allTrips.slice(0, 5).map((trip: any) => (
            <View key={trip.id} style={styles.activityItem}>
              <View>
                <Text style={styles.activityUser}>{trip.users?.email}</Text>
                <Text style={styles.activityDetails}>
                  {trip.destination} - R{trip.amount_due.toFixed(2)}
                </Text>
              </View>
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
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderTrips = () => (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search trips..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={allTrips.filter((trip: any) =>
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.users?.email.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={({ item: trip }) => (
          <Card style={styles.tripCard}>
            <Card.Content>
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.destination}>{trip.destination}</Text>
                  <Text style={styles.userEmail}>{trip.users?.email}</Text>
                </View>
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
              
              <Text style={styles.amount}>R{trip.amount_due.toFixed(2)}</Text>
              <Text style={styles.date}>
                {new Date(trip.start_date).toLocaleDateString('en-ZA')}
              </Text>
            </Card.Content>
            
            <Card.Actions>
              <Button
                mode="outlined"
                onPress={() =>
                  overridePaymentMutation.mutate({
                    tripId: trip.id,
                    status: trip.payment_status === 'paid' ? 'unpaid' : 'paid',
                  })
                }
                disabled={overridePaymentMutation.isPending}
              >
                Override to {trip.payment_status === 'paid' ? 'Unpaid' : 'Paid'}
              </Button>
            </Card.Actions>
          </Card>
        )}
        keyExtractor={(item: any) => item.id}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Button
          mode={selectedTab === 'overview' ? 'contained' : 'outlined'}
          onPress={() => setSelectedTab('overview')}
          style={styles.tabButton}
        >
          Overview
        </Button>
        <Button
          mode={selectedTab === 'trips' ? 'contained' : 'outlined'}
          onPress={() => setSelectedTab('trips')}
          style={styles.tabButton}
        >
          All Trips
        </Button>
      </View>

      {selectedTab === 'overview' ? renderOverview() : renderTrips()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  recentTripsCard: {
    marginBottom: 16,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tripDetails: {
    flex: 1,
  },
  tripRight: {
    alignItems: 'flex-end',
  },
  destination: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    marginTop: 4,
  },
  noTrips: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
  },
  alertCard: {
    backgroundColor: '#fff3e0',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  tripCard: {
    marginBottom: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  summaryCard: {
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  tripCount: {
    fontSize: 14,
    color: 'gray',
  },
  tripsCard: {
    marginBottom: 16,
  },
  tripDestination: {
    fontSize: 16,
    fontWeight: '500',
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  paymentCard: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  payButton: {
    marginTop: 16,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  emptyCard: {
    margin: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recentActivity: {
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityUser: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityDetails: {
    fontSize: 12,
    color: 'gray',
  },
  userEmail: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
});

export default AdminDashboard;