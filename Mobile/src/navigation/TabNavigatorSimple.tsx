import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme';

// Main screens
import HomeScreen from '../componets/screens/HomeScreen';
import AddTripScreen from '../componets/screens/AddTripScreen';
import TripHistoryScreen from '../componets/screens/TripHistoryScreen';
import PaymentScreen from '../componets/screens/PaymentScreen';
import AdminDashboard from '../componets/screens/AdminDashboard';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Add Trip':
              iconName = 'add-circle';
              break;
            case 'History':
              iconName = 'history';
              break;
            case 'Payment':
              iconName = 'payment';
              break;
            case 'Admin':
              iconName = 'admin-panel-settings';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Trip" component={AddTripScreen} />
      <Tab.Screen name="History" component={TripHistoryScreen} />
      <Tab.Screen name="Payment" component={PaymentScreen} />
      {user?.role === 'admin' && (
        <Tab.Screen name="Admin" component={AdminDashboard} />
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;