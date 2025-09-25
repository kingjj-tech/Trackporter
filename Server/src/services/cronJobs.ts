import cron from 'node-cron';
import { supabase } from '../config/supabase';

export const startCronJobs = () => {
  // Daily reminder for overdue payments
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily payment reminder...');
    
    try {
      const { data: overdueTrips, error } = await supabase
        .from('trips')
        .select(`
          *,
          users (id, email)
        `)
        .eq('payment_status', 'unpaid')
        .lt('start_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching overdue trips:', error);
        return;
      }

      // Group by user
      const userTrips = overdueTrips.reduce((acc: any, trip) => {
        const userId = trip.users.id;
        if (!acc[userId]) {
          acc[userId] = {
            user: trip.users,
            trips: []
          };
        }
        acc[userId].trips.push(trip);
        return acc;
      }, {});

      // Send notifications
      for (const userId in userTrips) {
        const { user, trips } = userTrips[userId];
        const totalAmount = trips.reduce((sum: number, trip: any) => sum + trip.amount_due, 0);
        
        await supabase
          .from('notifications')
          .insert([{
            user_id: userId,
            message: `You have ${trips.length} overdue trip(s) totaling R${totalAmount.toFixed(2)}. Please make payment as soon as possible.`,
            type: 'payment_reminder',
            sent_at: new Date().toISOString(),
          }]);
      }

      console.log(`Sent ${Object.keys(userTrips).length} payment reminders`);
    } catch (error) {
      console.error('Error in daily reminder cron job:', error);
    }
  });

  // Monthly summary
  cron.schedule('0 10 1 * *', async () => {
    console.log('Running monthly summary...');
    
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      for (const user of users) {
        const { data: monthlyTrips, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_date', startOfLastMonth.toISOString())
          .lt('start_date', endOfLastMonth.toISOString());

        if (tripsError) {
          console.error(`Error fetching trips for user ${user.id}:`, tripsError);
          continue;
        }

        if (monthlyTrips.length > 0) {
          const totalTrips = monthlyTrips.length;
          const paidTrips = monthlyTrips.filter(trip => trip.payment_status === 'paid').length;
          const totalEarnings = monthlyTrips
            .filter(trip => trip.payment_status === 'paid')
            .reduce((sum, trip) => sum + trip.amount_due, 0);
          const pendingAmount = monthlyTrips
            .filter(trip => trip.payment_status === 'unpaid')
            .reduce((sum, trip) => sum + trip.amount_due, 0);

          const monthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
          
          await supabase
            .from('notifications')
            .insert([{
              user_id: user.id,
              message: `${monthName} Summary: ${totalTrips} trips, ${paidTrips} paid, R${totalEarnings.toFixed(2)} earned, R${pendingAmount.toFixed(2)} pending`,
              type: 'monthly_summary',
              sent_at: new Date().toISOString(),
            }]);
        }
      }

      console.log(`Sent monthly summaries to ${users.length} users`);
    } catch (error) {
      console.error('Error in monthly summary cron job:', error);
    }
  });
};
