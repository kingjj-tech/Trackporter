import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, Searchbar, FAB } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { User } from '../../../types';
import { theme } from '../../theme';

const UserManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
    enabled: user?.role === 'admin',
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return theme.colors.error;
      case 'driver':
        return theme.colors.primary;
      case 'passenger':
        return theme.colors.accent;
      default:
        return '#666';
    }
  };

  const renderUser = ({ item: userData }: { item: User }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.email}>{userData.email}</Text>
            <Text style={styles.joinDate}>
              Joined: {new Date(userData.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.roleChip, { backgroundColor: getRoleColor(userData.role) }]}
            textStyle={{ color: 'white' }}
          >
            {userData.role.toUpperCase()}
          </Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() =>
            updateUserRoleMutation.mutate({
              userId: userData.id,
              newRole: userData.role === 'admin' ? 'passenger' : 'admin',
            })
          }
          disabled={updateUserRoleMutation.isPending || userData.id === user?.id}
        >
          {userData.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => deleteUserMutation.mutate(userData.id)}
          disabled={deleteUserMutation.isPending || userData.id === user?.id}
          textColor={theme.colors.error}
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Card style={styles.accessDenied}>
          <Card.Content>
            <Text style={styles.accessDeniedText}>
              Access Denied. Admin privileges required.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  roleChip: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
  },
  accessDenied: {
    margin: 16,
    backgroundColor: '#ffebee',
  },
  accessDeniedText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default UserManagement;