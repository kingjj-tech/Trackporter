import { Alert } from 'react-native';
import { COLORS } from './constants';

export const showAlert = (title: string, message: string, onPress?: () => void) => {
  Alert.alert(title, message, [
    { text: 'OK', onPress },
  ]);
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel },
    { text: 'Confirm', onPress: onConfirm },
  ]);
};

export const generateTripId = (): string => {
  return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateTotalAmount = (trips: any[]): number => {
  return trips.reduce((sum, trip) => sum + (trip.amount_due || 0), 0);
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return COLORS.success;
    case 'unpaid':
      return COLORS.error;
    case 'partial':
      return COLORS.warning;
    default:
      return COLORS.textSecondary;
  }
};