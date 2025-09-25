export const COLORS = {
  primary: '#2196F3',
  secondary: '#4CAF50',
  accent: '#FF9800',
  error: '#F44336',
  warning: '#FFC107',
  success: '#4CAF50',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
} as const;

export const PAYMENT_METHODS = [
  { id: 'card', label: '💳 Credit/Debit Card', icon: 'credit-card' },
  { id: 'eft', label: '🏦 EFT/Bank Transfer', icon: 'bank' },
  { id: 'snapscan', label: '📱 SnapScan', icon: 'qrcode-scan' },
  { id: 'zapper', label: '⚡ Zapper', icon: 'flash' },
] as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  PASSENGER: 'passenger',
} as const;

export const PAYMENT_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
} as const;

export const NOTIFICATION_TYPES = {
  PAYMENT_REMINDER: 'payment_reminder',
  MONTHLY_SUMMARY: 'monthly_summary',
  TRIP_UPDATE: 'trip_update',
  GENERAL: 'general',
} as const;
