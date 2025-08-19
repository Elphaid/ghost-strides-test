import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  TrendingUp
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  type: 'habit' | 'daily' | 'weekly' | 'project';
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: 'pending' | 'achieved' | 'not_achieved';
  deadline?: string;
  progress: number;
}

export default function RecentGoals() {
  // Mock data - would come from your API
  const recentGoals: Goal[] = [
    {
      id: '1',
      title: 'Complete HTML Forms & Input Types',
      type: 'daily',
      priority: 'high',
      category: 'study',
      status: 'achieved',
      deadline: '2025-01-18',
      progress: 100
    },
    {
      id: '2', 
      title: 'Save 150 KSH today',
      type: 'daily',
      priority: 'medium',
      category: 'finance',
      status: 'pending',
      progress: 80
    },
    {
      id: '3',
      title: 'Create 2 new designs',
      type: 'daily', 
      priority: 'high',
      category: 'creative',
      status: 'pending',
      progress: 50
    },
    {
      id: '4',
      title: 'Drink 2L water & track meals',
      type: 'habit',
      priority: 'medium',
      category: 'health',
      status: 'achieved',
      progress: 100
    }
  ];

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'achieved': return 'default';
      case 'not_achieved': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-green-400';
    }
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'habit': return TrendingUp;
      case 'daily': return Calendar;
      case 'weekly': return Calendar;
      case 'project': return Target;
      default: return Target;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="ghost-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Recent Goals
            </CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentGoals.map((goal, index) => {
            const TypeIcon = getTypeIcon(goal.type);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-colors group"
              >
                <div className={`p-2 rounded-lg bg-muted/50 ${getPriorityColor(goal.priority)}`}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {goal.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {goal.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(goal.status)} className="text-xs">
                      {goal.status === 'achieved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {goal.status === 'not_achieved' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {goal.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {goal.status === 'pending' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className={`h-2 rounded-full ${
                            goal.progress >= 70 
                              ? 'bg-success' 
                              : goal.progress >= 30 
                              ? 'bg-warning' 
                              : 'bg-destructive'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {goal.deadline && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          <Button variant="ghost" className="w-full text-muted-foreground">
            View All Goals
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}