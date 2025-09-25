import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme';

// Main screens
import HomeScreen from '../componets/screens/HomeScreen';
import AddTripScreen from '../componets/screens/AddTripScreen';
import TripHistoryScreen from '../componets/screens/TripHistoryScreen';
import PaymentScreen from '../componets/screens/PaymentScreen';
import ProfileScreen from '../componets/screens/ProfileScreen';
import AdminDashboard from '../componets/screens/AdminDashboard';
import UserManagement from '../componets/screens/UserManagement';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator id={undefined}>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ title: 'Home' }}
    />
  </Stack.Navigator>
);

const TripStack = () => (
  <Stack.Navigator id={undefined}>
    <Stack.Screen 
      name="AddTripMain" 
      component={AddTripScreen} 
      options={{ title: 'Add Trip' }}
    />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator id={undefined}>
    <Stack.Screen 
      name="HistoryMain" 
      component={TripHistoryScreen} 
      options={{ title: 'Trip History' }}
    />
  </Stack.Navigator>
);

const PaymentStack = () => (
  <Stack.Navigator id={undefined}>
    <Stack.Screen 
      name="PaymentMain" 
      component={PaymentScreen} 
      options={{ title: 'Payments' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator id={undefined}>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator id={undefined}>
    <Stack.Screen 
      name="AdminMain" 
      component={AdminDashboard} 
      options={{ title: 'Admin Dashboard' }}
    />
    <Stack.Screen 
      name="UserManagement" 
      component={UserManagement} 
      options={{ title: 'User Management' }}
    />
  </Stack.Navigator>
);

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
            case 'Profile':
              iconName = 'person';
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
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Add Trip" component={TripStack} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Payment" component={PaymentStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      {user?.role === 'admin' && (
        <Tab.Screen name="Admin" component={AdminStack} />
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;