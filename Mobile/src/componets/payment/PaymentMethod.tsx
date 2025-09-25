import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, RadioButton, Text } from 'react-native-paper';
import { PAYMENT_METHODS } from '../../utils/constants';
import { theme } from '../../theme';

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title="Payment Method" />
      <Card.Content>
        <RadioButton.Group
          onValueChange={onMethodChange}
          value={selectedMethod}
        >
          {PAYMENT_METHODS.map((method) => (
            <View key={method.id} style={styles.radioOption}>
              <RadioButton value={method.id} />
              <Text style={styles.radioLabel}>{method.label}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
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
});
