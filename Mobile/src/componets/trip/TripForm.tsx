import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Card, Text, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateAmount, validateDestination } from '../../utils/validators';
import { theme } from '../../theme';

interface TripFormProps {
  onSubmit: (tripData: any) => void;
  loading?: boolean;
  initialData?: any;
}

export const TripForm: React.FC<TripFormProps> = ({ 
  onSubmit, 
  loading = false, 
  initialData 
}) => {
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [amount, setAmount] = useState(initialData?.amount_due?.toString() || '');
  const [startDate, setStartDate] = useState(
    initialData?.start_date ? new Date(initialData.start_date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPaid, setIsPaid] = useState(initialData?.payment_status === 'paid' || false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};

    if (!validateDestination(destination)) {
      newErrors.destination = 'Destination must be at least 3 characters';
    }

    if (!validateAmount(amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        destination: destination.trim(),
        amount_due: parseFloat(amount),
        start_date: startDate.toISOString(),
        payment_status: isPaid ? 'paid' : 'unpaid',
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={initialData ? "Edit Trip" : "Add New Trip"} />
        <Card.Content>
          <TextInput
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            mode="outlined"
            style={styles.input}
            error={!!errors.destination}
          />
          {errors.destination && (
            <Text style={styles.errorText}>{errors.destination}</Text>
          )}

          <TextInput
            label="Amount (R)"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.amount}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            Trip Date: {startDate.toLocaleDateString()}
          </Button>

          <View style={styles.switchContainer}>
            <Text>Mark as paid</Text>
            <Switch value={isPaid} onValueChange={setIsPaid} />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          >
            {initialData ? 'Update Trip' : 'Add Trip'}
          </Button>
        </Card.Content>
      </Card>

      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
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
    paddingVertical: 8,
  },
});