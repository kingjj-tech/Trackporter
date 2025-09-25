import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { theme } from '../../theme';

interface PaymentFormProps {
  paymentMethod: string;
  onSubmit: (paymentData: any) => void;
  loading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  onSubmit,
  loading = false,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const handleSubmit = () => {
    const paymentData = {
      method: paymentMethod,
      ...(paymentMethod === 'card' && {
        cardNumber,
        expiryDate,
        cvv,
      }),
      ...(paymentMethod === 'eft' && {
        bankAccount,
      }),
    };
    onSubmit(paymentData);
  };

  const renderCardForm = () => (
    <>
      <TextInput
        label="Card Number"
        value={cardNumber}
        onChangeText={setCardNumber}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        placeholder="1234 5678 9012 3456"
      />
      <View style={styles.row}>
        <TextInput
          label="Expiry Date"
          value={expiryDate}
          onChangeText={setExpiryDate}
          mode="outlined"
          style={[styles.input, styles.halfWidth]}
          placeholder="MM/YY"
        />
        <TextInput
          label="CVV"
          value={cvv}
          onChangeText={setCvv}
          mode="outlined"
          keyboardType="numeric"
          style={[styles.input, styles.halfWidth]}
          placeholder="123"
        />
      </View>
    </>
  );

  const renderEftForm = () => (
    <TextInput
      label="Bank Account Number"
      value={bankAccount}
      onChangeText={setBankAccount}
      mode="outlined"
      keyboardType="numeric"
      style={styles.input}
    />
  );

  const renderQrForm = () => (
    <View style={styles.qrContainer}>
      <Text style={styles.qrText}>
        A QR code will be generated for payment after confirmation.
      </Text>
    </View>
  );

  const renderFormForMethod = () => {
    switch (paymentMethod) {
      case 'card':
        return renderCardForm();
      case 'eft':
        return renderEftForm();
      case 'snapscan':
      case 'zapper':
        return renderQrForm();
      default:
        return null;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Payment Details" />
      <Card.Content>
        {renderFormForMethod()}
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Process Payment
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  qrContainer: {
    padding: 20,
    alignItems: 'center',
  },
  qrText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
