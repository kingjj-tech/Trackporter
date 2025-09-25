import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, RadioButton, Snackbar, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Trip } from '../../../types';
import { theme } from '../../theme';

const PaymentScreen = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');

  const { data: unpaidTrips = [] } = useQuery({
    queryKey: ['unpaid-trips', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .eq('payment_status', 'unpaid')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });

  const totalAmount = unpaidTrips.reduce((sum, trip) => sum + trip.amount_due, 0);

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update all unpaid trips to paid
      const { error } = await supabase
        .from('trips')
        .update({ payment_status: 'paid' })
        .eq('user_id', user?.id)
        .eq('payment_status', 'unpaid');
      
      if (error) throw error;
      
      // Record payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(unpaidTrips.map(trip => ({
          trip_id: trip.id,
          amount: trip.amount_due,
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
          payment_method: selectedPaymentMethod,
        })));
      
      if (paymentError) throw paymentError;
      
      queryClient.invalidateQueries({ queryKey: ['unpaid-trips'] });
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
      setSuccess('Payment successful!');
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (unpaidTrips.length === 0) {
    return (
      <View style={styles.container}>
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>✅ All trips are paid!</Text>
            <Text style={styles.emptySubtext}>You have no outstanding payments.</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Title title="Payment Summary" />
        <Card.Content>
          <Text style={styles.totalLabel}>Total Amount Due:</Text>
          <Text style={styles.totalAmount}>R{totalAmount.toFixed(2)}</Text>
          <Text style={styles.tripCount}>
            {unpaidTrips.length} unpaid trip{unpaidTrips.length > 1 ? 's' : ''}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.tripsCard}>
        <Card.Title title="Trip Details" />
        <Card.Content>
          {unpaidTrips.map((trip, index) => (
            <View key={trip.id}>
              <View style={styles.tripItem}>
                <Text style={styles.tripDestination}>{trip.destination}</Text>
                <Text style={styles.tripAmount}>R{trip.amount_due.toFixed(2)}</Text>
              </View>
              <Text style={styles.tripDate}>
                {new Date(trip.start_date).toLocaleDateString('en-ZA')}
              </Text>
              {index < unpaidTrips.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.paymentCard}>
        <Card.Title title="Payment Method" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={value => setSelectedPaymentMethod(value)}
            value={selectedPaymentMethod}
          >
            <View style={styles.radioOption}>
              <RadioButton value="card" />
              <Text style={styles.radioLabel}>💳 Credit/Debit Card</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="eft" />
              <Text style={styles.radioLabel}>🏦 EFT/Bank Transfer</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="snapscan" />
              <Text style={styles.radioLabel}>📱 SnapScan</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="zapper" />
              <Text style={styles.radioLabel}>⚡ Zapper</Text>
            </View>
          </RadioButton.Group>

          <Button
            mode="contained"
            onPress={processPayment}
            loading={processing}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
          >
            Pay R{totalAmount.toFixed(2)}
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={4000}
        style={{ backgroundColor: theme.colors.accent }}
      >
        {success}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  emptyCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  tripCount: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  },
  tripsCard: {
    margin: 16,
    padding: 16,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tripDestination: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  tripDate: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  paymentCard: {
    margin: 16,
    padding: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  payButton: {
    marginTop: 16,
  },
  payButtonContent: {
    height: 48,
  },
});

export default PaymentScreen;
