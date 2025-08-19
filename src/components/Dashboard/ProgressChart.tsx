import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, DollarSign, Calendar } from 'lucide-react';

interface SavingsData {
  date: string;
  amount: number;
  total: number;
}

interface GoalData {
  category: string;
  count: number;
  completed: number;
}

interface DailyProgress {
  date: string;
  completion_percentage: number;
}

const COLORS = ['hsl(213, 94%, 68%)', 'hsl(160, 84%, 39%)', 'hsl(32, 95%, 48%)', 'hsl(262, 83%, 58%)', 'hsl(0, 84%, 60%)'];

export const ProgressChart = () => {
  const { user } = useAuth();
  const [savingsData, setSavingsData] = useState<SavingsData[]>([]);
  const [goalData, setGoalData] = useState<GoalData[]>([]);
  const [dailyProgressData, setDailyProgressData] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user]);

  const fetchChartData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch savings data for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: savingsResponse } = await supabase
        .from('savings')
        .select('date, amount')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Process savings data to show cumulative totals
      if (savingsResponse) {
        let runningTotal = 0;
        const processedSavings = savingsResponse.map(item => {
          runningTotal += parseFloat(item.amount.toString());
          return {
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: parseFloat(item.amount.toString()),
            total: runningTotal
          };
        });
        setSavingsData(processedSavings);
      }

      // Fetch goals by category
      const { data: goalsResponse } = await supabase
        .from('goals')
        .select('category, status')
        .eq('user_id', user.id)
        .eq('archived', false);

      if (goalsResponse) {
        const categoryData = goalsResponse.reduce((acc, goal) => {
          if (!acc[goal.category]) {
            acc[goal.category] = { count: 0, completed: 0 };
          }
          acc[goal.category].count += 1;
          if (goal.status === 'achieved') {
            acc[goal.category].completed += 1;
          }
          return acc;
        }, {} as Record<string, { count: number; completed: number }>);

        const processedGoals = Object.entries(categoryData).map(([category, data]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          count: data.count,
          completed: data.completed
        }));
        setGoalData(processedGoals);
      }

      // Fetch daily progress for the last 7 days
      const { data: dailyResponse } = await supabase
        .from('daily_entries')
        .select('date, completion_percentage')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (dailyResponse) {
        const processedDaily = dailyResponse.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completion_percentage: parseFloat(item.completion_percentage?.toString() || '0')
        }));
        setDailyProgressData(processedDaily);
      }

    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="ghost-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Savings Trend */}
      <Card className="ghost-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            Savings Trend (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--success))"
                fill="hsl(var(--success))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Progress */}
      <Card className="ghost-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Daily Progress (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dailyProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Completion']}
              />
              <Line
                type="monotone"
                dataKey="completion_percentage"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goals by Category */}
      <Card className="ghost-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-warning" />
            Goals by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={goalData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
              >
                {goalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {goalData.map((item, index) => (
              <div key={item.category} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.category} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card className="ghost-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-creative" />
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Savings This Week</span>
              <span className="text-sm font-semibold text-success">
                KSH {savingsData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Daily Progress</span>
              <span className="text-sm font-semibold text-primary">
                {dailyProgressData.length > 0 
                  ? Math.round(dailyProgressData.reduce((sum, item) => sum + item.completion_percentage, 0) / dailyProgressData.length)
                  : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Active Goals</span>
              <span className="text-sm font-semibold text-warning">
                {goalData.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Goals</span>
              <span className="text-sm font-semibold text-success">
                {goalData.reduce((sum, item) => sum + item.completed, 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};