import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Card, Text, Snackbar, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { theme } from '../../theme';

const AddTripScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
      setSuccess('Trip added successfully!');
      resetForm();
      setTimeout(() => navigation.navigate('Home'), 2000);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  const resetForm = () => {
    setDestination('');
    setAmount('');
    setStartDate(new Date());
    setIsPaid(false);
  };

  const handleSubmit = () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }
    
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    const tripData = {
      user_id: user?.id,
      destination: destination.trim(),
      start_date: startDate.toISOString(),
      amount_due: Number(amount),
      payment_status: isPaid ? 'paid' : 'unpaid',
    };

    addTripMutation.mutate(tripData);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <Card style={styles.card}>
          <Card.Title title="Add New Trip" />
          <Card.Content>
            <TextInput
              label="Destination"
              value={destination}
              onChangeText={setDestination}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Amount (R)"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

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
              loading={addTripMutation.isPending}
              style={styles.submitButton}
            >
              Add Trip
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

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={2000}
        style={{ backgroundColor: theme.colors.accent }}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default AddTripScreen;