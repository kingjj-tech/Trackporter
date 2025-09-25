import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { theme } from '../../theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  retryText = 'Retry' 
}) => {
  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <Button
            mode="contained"
            onPress={onRetry}
            style={styles.retryButton}
          >
            {retryText}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: theme.colors.surface,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.error,
  },
  retryButton: {
    marginTop: 8,
  },
});