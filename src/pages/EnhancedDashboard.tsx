import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FullScreenLayout from '@/components/FullScreenLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Heart,
  BookOpen,
  Palette,
  Trophy,
  Zap,
  Clock,
  CheckCircle2,
  Plus,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuickAddDialog } from '@/components/Dashboard/QuickAddDialog';
import { ProfileSettings } from '@/components/Dashboard/ProfileSettings';
import { DailyInspirationCard } from '@/components/Dashboard/DailyInspirationCard';
import { ProgressChart } from '@/components/Dashboard/ProgressChart';
import { WeeklyMonthlyView } from '@/components/Dashboard/WeeklyMonthlyView';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  deadline: string | null;
}

interface DailyEntry {
  completion_percentage: number;
  achieved: boolean;
}

interface Stats {
  todayProgress: number;
  currentStreak: number;
  monthlyGoals: { completed: number; total: number };
  totalPoints: number;
  totalSavings: number;
  totalDesigns: number;
  completedStudyTopics: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todayGoals, setTodayGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayProgress: 0,
    currentStreak: 0,
    monthlyGoals: { completed: 0, total: 0 },
    totalPoints: 0,
    totalSavings: 0,
    totalDesigns: 0,
    completedStudyTopics: 0
  });
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.email?.split('@')[0] || 'Ghost';
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Fetch all dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Set up real-time subscriptions
      const goalsChannel = supabase
        .channel('goals-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchTodayGoals();
          fetchStats();
        })
        .subscribe();

      const dailyChannel = supabase
        .channel('daily-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'daily_entries',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchStats();
        })
        .subscribe();

      const savingsChannel = supabase
        .channel('savings-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'savings',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(goalsChannel);
        supabase.removeChannel(dailyChannel);
        supabase.removeChannel(savingsChannel);
      };
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTodayGoals(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchTodayGoals = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("goals")
        .select("id,title,type,category,status,deadline")
        .eq("user_id", user.id)
        .eq("archived", false)
        .in("status", ["pending"])
        .or(`deadline.eq.${today},type.eq.daily,type.eq.habit`);
      
      setTodayGoals(data || []);
    } catch (error) {
      console.error('Error fetching today goals:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

      // Fetch today's progress
      const { data: todayEntry } = await supabase
        .from('daily_entries')
        .select('completion_percentage, achieved')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // Fetch streak (consecutive days with >70% completion)
      const { data: recentEntries } = await supabase
        .from('daily_entries')
        .select('date, completion_percentage')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .order('date', { ascending: false })
        .limit(30);

      let streak = 0;
      if (recentEntries) {
        for (const entry of recentEntries) {
          if ((entry.completion_percentage || 0) >= 70) {
            streak++;
          } else {
            break;
          }
        }
      }

      // Fetch monthly goals
      const { data: monthlyGoals } = await supabase
        .from('goals')
        .select('status')
        .eq('user_id', user.id)
        .eq('archived', false)
        .gte('created_at', monthStart);

      const monthlyCompleted = monthlyGoals?.filter(g => g.status === 'achieved').length || 0;
      const monthlyTotal = monthlyGoals?.length || 0;

      // Fetch total savings
      const { data: savings } = await supabase
        .from('savings')
        .select('amount')
        .eq('user_id', user.id);
      
      const totalSavings = savings?.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0) || 0;

      // Fetch total designs
      const { data: designs } = await supabase
        .from('design_portfolio')
        .select('id')
        .eq('user_id', user.id);

      // Fetch completed study topics
      const { data: studyTopics } = await supabase
        .from('html_curriculum')
        .select('completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      const totalPoints = (monthlyCompleted * 100) + (streak * 10) + Math.floor(totalSavings / 100);

      setStats({
        todayProgress: todayEntry?.completion_percentage || 0,
        currentStreak: streak,
        monthlyGoals: { completed: monthlyCompleted, total: monthlyTotal },
        totalPoints,
        totalSavings,
        totalDesigns: designs?.length || 0,
        completedStudyTopics: studyTopics?.length || 0
      });

      if ((todayEntry?.completion_percentage || 0) >= 90) {
        triggerCelebration();
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const markGoalDone = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ status: "achieved", updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (!error) {
        setTodayGoals(prev => prev.filter(g => g.id !== id));
        toast({
          title: "Goal Completed! 🎉",
          description: "Great job on completing your goal!",
        });
        
        // Update today's progress
        const newProgress = Math.min(stats.todayProgress + (100 / Math.max(todayGoals.length, 1)), 100);
        
        // Get or create current month
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
        
        let { data: currentMonth } = await supabase
          .from('months')
          .select('id')
          .eq('user_id', user!.id)
          .gte('start_date', monthStart)
          .lte('end_date', monthEnd)
          .single();

        if (!currentMonth) {
          const { data: newMonth } = await supabase
            .from('months')
            .insert({
              user_id: user!.id,
              title: `${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`,
              start_date: monthStart,
              end_date: monthEnd
            })
            .select('id')
            .single();
          currentMonth = newMonth;
        }

        if (currentMonth) {
          await supabase
            .from('daily_entries')
            .upsert({
              user_id: user!.id,
              date: new Date().toISOString().slice(0, 10),
              month_id: currentMonth.id,
              completion_percentage: newProgress,
              achieved: newProgress >= 70
            });
        }
      }
    } catch (error) {
      console.error('Error marking goal as done:', error);
    }
  };

  const statCards = [
    {
      title: "Today's Progress",
      value: `${Math.round(stats.todayProgress)}%`,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      trend: stats.todayProgress >= 70 ? +12 : -5,
      description: `${todayGoals.filter(g => g.status === 'achieved').length} of ${todayGoals.length} tasks completed`
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      trend: +2,
      description: "Above 70% completion"
    },
    {
      title: "Monthly Goals",
      value: `${stats.monthlyGoals.completed}/${stats.monthlyGoals.total}`,
      icon: Trophy,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      trend: stats.monthlyGoals.total > 0 ? Math.round((stats.monthlyGoals.completed / stats.monthlyGoals.total) * 100) : 0,
      description: `${Math.round(stats.monthlyGoals.total > 0 ? (stats.monthlyGoals.completed / stats.monthlyGoals.total) * 100 : 0)}% completion rate`
    },
    {
      title: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      icon: CheckCircle2,
      color: 'text-creative',
      bgColor: 'bg-creative/10',
      borderColor: 'border-creative/20',
      trend: +15,
      description: "This month"
    }
  ];

  const quickStats = [
    { 
      title: 'Total Savings', 
      value: `KSH ${stats.totalSavings.toLocaleString()}`, 
      icon: DollarSign,
      color: 'text-success' 
    },
    { 
      title: 'Design Portfolio', 
      value: stats.totalDesigns.toString(), 
      icon: Palette,
      color: 'text-creative' 
    },
    { 
      title: 'Study Progress', 
      value: `${stats.completedStudyTopics} topics`, 
      icon: BookOpen,
      color: 'text-primary' 
    }
  ];

  if (loading) {
    return (
      <FullScreenLayout currentSection="dashboard">
        <div className="h-full overflow-auto p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-lg w-1/3"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </FullScreenLayout>
    );
  }

  return (
    <FullScreenLayout currentSection="dashboard">
      <div className="h-full overflow-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {getGreeting()}
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to crush your goals today? Let's track your progress.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ProfileSettings />
            <QuickAddDialog />
          </div>
        </motion.div>

        {/* Daily Progress Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="ghost-card-hover">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={
                        stats.todayProgress >= 80 ? "hsl(var(--success))" : 
                        stats.todayProgress >= 50 ? "hsl(var(--warning))" : 
                        "hsl(var(--destructive))"
                      }
                      strokeWidth="3"
                      strokeDasharray={`${stats.todayProgress}, 100`}
                      className="transition-all duration-1000 ease-out"
                      filter="drop-shadow(0 0 8px currentColor)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{Math.round(stats.todayProgress)}%</div>
                      <div className="text-sm text-muted-foreground">Daily Progress</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-xl mb-2">
                    {stats.todayProgress >= 90 ? "🎉 Outstanding!" : 
                     stats.todayProgress >= 70 ? "💪 Excellent Work!" : 
                     stats.todayProgress >= 50 ? "⚡ Keep Pushing!" : 
                     "🔥 Let's Get Started!"}
                  </h3>
                  <p className="text-muted-foreground">
                    {todayGoals.length > 0 
                      ? `${todayGoals.filter(g => g.status === 'achieved').length} of ${todayGoals.length} goals completed today`
                      : "No goals for today - time to add some!"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`ghost-card-hover ${stat.bgColor} border-2 ${stat.borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-background/20`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <div className={`flex items-center text-xs ${stat.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                      {Math.abs(stat.trend)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Today's Agenda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2 space-y-6"
          >
            {/* Today's Agenda */}
            <Card className="ghost-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                  Today's Agenda
                  <Badge variant="outline" className="ml-auto">
                    {todayGoals.length} tasks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No goals for today.</p>
                    <QuickAddDialog />
                  </div>
                ) : (
                  todayGoals.map((goal) => (
                    <motion.div 
                      key={goal.id} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all duration-200 border border-border/30"
                      whileHover={{ scale: 1.02 }}
                    >
                      <input
                        type="checkbox"
                        className="checkbox-bounce scale-125"
                        onChange={() => markGoalDone(goal.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{goal.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {goal.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {goal.type}
                          </Badge>
                          {goal.deadline && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Progress Analytics
              </h3>
              <ProgressChart />
            </div>
          </motion.div>

          {/* Right Column - Sidebar Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Daily Inspiration */}
            <DailyInspirationCard />

            {/* Quick Stats */}
            <Card className="ghost-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="text-sm font-medium">{stat.title}</span>
                    </div>
                    <span className={`text-sm font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly/Monthly View */}
            <WeeklyMonthlyView />
          </motion.div>
        </div>
      </div>
    </FullScreenLayout>
  );
};

export default Dashboard;
