import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Target, CheckCircle2, Clock, Flame } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface DailyEntry {
  date: string;
  completion_percentage: number;
  achieved: boolean;
}

interface WeeklyStats {
  totalDays: number;
  completedDays: number;
  avgCompletion: number;
  streak: number;
}

interface MonthlyStats {
  totalDays: number;
  completedDays: number;
  avgCompletion: number;
  totalGoalsCompleted: number;
  totalSavings: number;
}

export const WeeklyMonthlyView = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DailyEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<DailyEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalDays: 7,
    completedDays: 0,
    avgCompletion: 0,
    streak: 0
  });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalDays: 0,
    completedDays: 0,
    avgCompletion: 0,
    totalGoalsCompleted: 0,
    totalSavings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWeeklyMonthlyData();
    }
  }, [user]);

  const fetchWeeklyMonthlyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch weekly data
      const { data: weeklyResponse } = await supabase
        .from('daily_entries')
        .select('date, completion_percentage, achieved')
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      // Fetch monthly data
      const { data: monthlyResponse } = await supabase
        .from('daily_entries')
        .select('date, completion_percentage, achieved')
        .eq('user_id', user.id)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (weeklyResponse) {
        setWeeklyData(weeklyResponse);
        
        // Calculate weekly stats
        const completedDays = weeklyResponse.filter(day => day.achieved).length;
        const avgCompletion = weeklyResponse.length > 0 
          ? weeklyResponse.reduce((sum, day) => sum + (day.completion_percentage || 0), 0) / weeklyResponse.length
          : 0;
        
        // Calculate streak (consecutive days with >70% completion)
        let streak = 0;
        for (let i = weeklyResponse.length - 1; i >= 0; i--) {
          if ((weeklyResponse[i].completion_percentage || 0) >= 70) {
            streak++;
          } else {
            break;
          }
        }

        setWeeklyStats({
          totalDays: 7,
          completedDays,
          avgCompletion,
          streak
        });
      }

      if (monthlyResponse) {
        setMonthlyData(monthlyResponse);
        
        // Calculate monthly stats
        const completedDays = monthlyResponse.filter(day => day.achieved).length;
        const avgCompletion = monthlyResponse.length > 0 
          ? monthlyResponse.reduce((sum, day) => sum + (day.completion_percentage || 0), 0) / monthlyResponse.length
          : 0;

        // Fetch goals completed this month
        const { data: goalsResponse } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'achieved')
          .gte('updated_at', format(monthStart, 'yyyy-MM-dd'))
          .lte('updated_at', format(monthEnd, 'yyyy-MM-dd'));

        // Fetch savings this month
        const { data: savingsResponse } = await supabase
          .from('savings')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'));

        const totalSavings = savingsResponse?.reduce((sum, saving) => sum + parseFloat(saving.amount.toString()), 0) || 0;

        setMonthlyStats({
          totalDays: eachDayOfInterval({ start: monthStart, end: monthEnd }).length,
          completedDays,
          avgCompletion,
          totalGoalsCompleted: goalsResponse?.length || 0,
          totalSavings
        });
      }

    } catch (error) {
      console.error('Error fetching weekly/monthly data:', error);
    }
    setLoading(false);
  };

  const renderWeekCalendar = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(new Date(), { weekStartsOn: 1 })
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayData = weeklyData.find(d => isSameDay(new Date(d.date), day));
          const completion = dayData?.completion_percentage || 0;
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                {format(day, 'EEE')}
              </div>
              <div 
                className={`
                  h-12 w-12 mx-auto rounded-lg border-2 flex items-center justify-center text-xs font-medium
                  ${isToday ? 'border-primary' : 'border-border/30'}
                  ${completion >= 80 ? 'bg-success/20 text-success' : 
                    completion >= 50 ? 'bg-warning/20 text-warning' : 
                    completion > 0 ? 'bg-destructive/20 text-destructive' : 'bg-muted/20'}
                `}
              >
                <div className="text-center">
                  <div>{format(day, 'd')}</div>
                  <div className="text-[10px]">{completion}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="ghost-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ghost-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Weekly & Monthly Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6 mt-4">
            {/* Weekly Calendar */}
            <div>
              <h4 className="font-medium mb-3 text-sm">Weekly Progress View</h4>
              {renderWeekCalendar()}
            </div>

            {/* Weekly Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Completed Days</span>
                </div>
                <div className="text-2xl font-bold text-success">
                  {weeklyStats.completedDays}/7
                </div>
                <Progress 
                  value={(weeklyStats.completedDays / 7) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Current Streak</span>
                </div>
                <div className="text-2xl font-bold text-warning">
                  {weeklyStats.streak} days
                </div>
                <Progress 
                  value={Math.min((weeklyStats.streak / 7) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Completion</span>
                <span className="text-sm font-semibold">
                  {Math.round(weeklyStats.avgCompletion)}%
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6 mt-4">
            {/* Monthly Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-success" />
                  <span className="text-xs text-success">Goals Completed</span>
                </div>
                <div className="text-xl font-bold text-success">
                  {monthlyStats.totalGoalsCompleted}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-primary">Avg Progress</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  {Math.round(monthlyStats.avgCompletion)}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-warning" />
                  <span className="text-xs text-warning">Productive Days</span>
                </div>
                <div className="text-xl font-bold text-warning">
                  {monthlyStats.completedDays}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-creative/10 border border-creative/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-creative" />
                  <span className="text-xs text-creative">Total Savings</span>
                </div>
                <div className="text-lg font-bold text-creative">
                  KSH {monthlyStats.totalSavings.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Monthly Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Month Progress</span>
                <Badge variant="outline">
                  {monthlyStats.completedDays}/{monthlyStats.totalDays} days
                </Badge>
              </div>
              <Progress 
                value={(monthlyStats.completedDays / monthlyStats.totalDays) * 100} 
                className="h-3"
              />
            </div>

            {/* Performance Summary */}
            <div className="p-4 rounded-lg bg-gradient-card border border-border/30">
              <h4 className="font-medium mb-2 text-sm">Performance Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Consistency Rate:</span>
                  <br />
                  <span className="font-semibold">
                    {Math.round((monthlyStats.completedDays / monthlyStats.totalDays) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Daily Average:</span>
                  <br />
                  <span className="font-semibold">
                    {Math.round(monthlyStats.avgCompletion)}% completion
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};