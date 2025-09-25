import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import { Trip } from '../../../types';
import { formatCurrency } from '../../utils/formatters';
import { theme } from '../../theme/index';

interface PaymentSummaryProps {
  trips: Trip[];
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ trips }) => {
  const totalAmount = trips.reduce((sum, trip) => sum + trip.amount_due, 0);

  return (
    <Card style={styles.card}>
      <Card.Title title="Payment Summary" />
      <Card.Content>
        {trips.map((trip, index) => (
          <View key={trip.id}>
            <View style={styles.tripItem}>
              <Text style={styles.destination}>{trip.destination}</Text>
              <Text style={styles.amount}>{formatCurrency(trip.amount_due)}</Text>
            </View>
            {index < trips.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))}
        
        <Divider style={styles.totalDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  destination: {
    flex: 1,
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 4,
  },
  totalDivider: {
    marginVertical: 12,
    height: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});