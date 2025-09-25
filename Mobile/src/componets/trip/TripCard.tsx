import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { Trip } from '../../../types';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../../utils/formatters';
import { theme } from '../../theme/index';

interface TripCardProps {
  trip: Trip;
  onTogglePayment?: (trip: Trip) => void;
  showActions?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  onTogglePayment, 
  showActions = true 
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.destination}>{trip.destination}</Text>
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              { backgroundColor: getPaymentStatusColor(trip.payment_status) }
            ]}
          >
            {trip.payment_status.toUpperCase()}
          </Chip>
        </View>
        
        <Text style={styles.date}>{formatDate(trip.start_date)}</Text>
        <Text style={styles.amount}>{formatCurrency(trip.amount_due)}</Text>
      </Card.Content>
      
      {showActions && onTogglePayment && (
        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() => onTogglePayment(trip)}
          >
            Mark as {trip.payment_status === 'paid' ? 'Unpaid' : 'Paid'}
          </Button>
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  destination: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});