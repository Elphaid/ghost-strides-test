import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle2,
  Flame,
  Trophy
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color: 'success' | 'warning' | 'primary' | 'destructive';
  trend?: number;
}

function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  const colorClasses = {
    success: 'text-green-400 bg-green-400/20 border-green-400/30',
    warning: 'text-orange-400 bg-orange-400/20 border-orange-400/30', 
    primary: 'text-blue-400 bg-blue-400/20 border-blue-400/30',
    destructive: 'text-red-400 bg-red-400/20 border-red-400/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="ghost-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend !== undefined && (
              <div className={`flex items-center text-xs ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardStats() {
  // Mock data - these would come from your actual data queries
  const stats = [
    {
      title: "Today's Progress",
      value: "87%",
      description: "3 of 5 goals completed",
      icon: Target,
      color: 'success' as const,
      trend: 12
    },
    {
      title: "Current Streak",
      value: "7",
      description: "days above 70%",
      icon: Flame,
      color: 'warning' as const,
      trend: 5
    },
    {
      title: "Monthly Goals",
      value: "12/15",
      description: "completed this month",
      icon: Trophy,
      color: 'primary' as const,
      trend: 8
    },
    {
      title: "Total Achievements",
      value: "142",
      description: "all time completions",
      icon: CheckCircle2,
      color: 'success' as const,
      trend: 15
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatsCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}