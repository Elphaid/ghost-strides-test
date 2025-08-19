import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import TodayCard from '@/components/Dashboard/TodayCard';
import RecentGoals from '@/components/Dashboard/RecentGoals';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-gradient">
            {getGreeting()}, {user.email?.split('@')[0] || 'Ghost'}!
          </h1>
          <p className="text-muted-foreground">
            Let's track your progress and achieve your goals today.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TodayCard />
          <RecentGoals />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
