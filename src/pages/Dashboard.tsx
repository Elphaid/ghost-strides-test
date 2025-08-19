import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import FullScreenLayout from '@/components/FullScreenLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
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
  Quote
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Goal {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  deadline: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyProgress, setDailyProgress] = useState(67);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [todayGoals, setTodayGoals] = useState<Goal[]>([]);
  const [quote, setQuote] = useState({
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  });

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

  // Mock data - would come from Supabase in real app
  const stats = [
    {
      title: "Today's Progress",
      value: `${dailyProgress}%`,
      icon: Target,
      color: 'primary',
      trend: +12,
      description: "4 of 6 tasks completed"
    },
    {
      title: "Current Streak",
      value: `${currentStreak} days`,
      icon: Zap,
      color: 'success',
      trend: +2,
      description: "Above 70% completion"
    },
    {
      title: "Monthly Goals",
      value: "12/15",
      icon: Trophy,
      color: 'warning',
      trend: +8,
      description: "80% completion rate"
    },
    {
      title: "Total Points",
      value: "2,847",
      icon: CheckCircle2,
      color: 'creative',
      trend: +15,
      description: "This month"
    }
  ];

  const quickActions = [
    { label: 'Add Goal', icon: Target, color: 'bg-primary', onClick: () => navigate('/goals') },
    { label: 'Log Savings', icon: DollarSign, color: 'bg-success', onClick: () => navigate('/savings') },
    { label: 'Health Update', icon: Heart, color: 'bg-destructive', onClick: () => navigate('/health') },
    { label: 'Study Session', icon: BookOpen, color: 'bg-primary', onClick: () => navigate('/study') },
    { label: 'Design Upload', icon: Palette, color: 'bg-creative', onClick: () => navigate('/portfolio') },
    { label: 'Reflection', icon: Quote, color: 'bg-muted', onClick: () => navigate('/reflections') }
  ];

  // Fetch today's goals
  useEffect(() => {
    const fetchTodayGoals = async () => {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("goals")
        .select("id,title,type,category,status,deadline")
        .eq("user_id", user.id)
        .in("status", ["pending"])
        .or(`deadline.eq.${today},type.eq.daily,type.eq.habit`);
      setTodayGoals(data || []);
    };
    fetchTodayGoals();
  }, [user]);

  const markGoalDone = async (id: string) => {
    const { error } = await supabase.from("goals").update({ status: "achieved" }).eq("id", id);
    if (!error) {
      setTodayGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const miniGraphs = [
    { title: 'Weight Trend', value: '42.1 kg', trend: '+0.3kg this week', color: 'text-success' },
    { title: 'Savings Progress', value: '8,450 KSH', trend: '+150 today', color: 'text-success' },
    { title: 'Design Count', value: '28', trend: '+2 today', color: 'text-creative' }
  ];

  useEffect(() => {
    if (dailyProgress >= 90) {
      triggerCelebration();
    }
  }, [dailyProgress]);

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
            <h1 className="text-3xl font-bold text-gradient mb-2">
              {getGreeting()}
            </h1>
            <p className="text-muted-foreground">
              Ready to crush your goals today? Let's track your progress.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </motion.div>

        {/* Daily Progress Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="ghost-card-hover">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={dailyProgress >= 70 ? "hsl(var(--success))" : dailyProgress >= 30 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                      strokeWidth="3"
                      strokeDasharray={`${dailyProgress}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{dailyProgress}%</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Daily Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {dailyProgress >= 90 ? "🎉 Excellent work!" : 
                     dailyProgress >= 70 ? "💪 Great progress!" : 
                     dailyProgress >= 50 ? "⚡ Keep pushing!" : 
                     "🔥 Let's get started!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="ghost-card-hover">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Agenda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="ghost-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No goals for today. <span className="text-primary cursor-pointer" onClick={() => navigate('/goals')}>Add some goals!</span>
                  </p>
                )}
                {todayGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox-bounce"
                      onChange={() => markGoalDone(goal.id)}
                    />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{goal.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {goal.category}
                    </Badge>
                    {goal.deadline && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Mini Graphs */}
          <div className="space-y-6">
            {/* Quote of the Day */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="ghost-card">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <Quote className="h-6 w-6 text-primary mx-auto" />
                    <p className="text-sm italic">"{quote.text}"</p>
                    <p className="text-xs text-muted-foreground">— {quote.author}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="ghost-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex flex-col gap-1 h-auto p-3 hover:scale-105 transition-transform"
                        onClick={action.onClick}
                      >
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          <action.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mini Graphs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="ghost-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {miniGraphs.map((graph, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{graph.title}</span>
                        <span className="text-sm font-bold">{graph.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Progress value={Math.random() * 100} className="flex-1 mr-2" />
                        <span className={`text-xs ${graph.color}`}>{graph.trend}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </FullScreenLayout>
  );
};

export default Dashboard;