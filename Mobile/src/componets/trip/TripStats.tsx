import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Trip } from '../../../types';
import { formatCurrency } from '../../utils/formatters';
import { theme } from '../../theme/index';

interface TripStatsProps {
  trips: Trip[];
}

export const TripStats: React.FC<TripStatsProps> = ({ trips }) => {
  const totalTrips = trips.length;
  const paidTrips = trips.filter(t => t.payment_status === 'paid');
  const unpaidTrips = trips.filter(t => t.payment_status === 'unpaid');
  
  const totalEarnings = paidTrips.reduce((sum, trip) => sum + trip.amount_due, 0);
  const totalOwed = unpaidTrips.reduce((sum, trip) => sum + trip.amount_due, 0);

  const stats = [
    { label: 'Total Trips', value: totalTrips.toString(), color: theme.colors.primary },
    { label: 'Paid Trips', value: paidTrips.length.toString(), color: theme.colors.success },
    { label: 'Total Earnings', value: formatCurrency(totalEarnings), color: theme.colors.success },
    { label: 'Amount Owed', value: formatCurrency(totalOwed), color: theme.colors.warning },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <Card key={index} style={[styles.statCard, { backgroundColor: stat.color }]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    width: '48%',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
    textAlign: 'center',
  },
});