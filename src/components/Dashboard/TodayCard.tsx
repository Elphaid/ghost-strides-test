import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  Code, 
  Briefcase, 
  Heart,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyTask {
  id: string;
  label: string;
  completed: boolean;
  icon: any;
  time?: string;
  color: string;
}

export default function TodayCard() {
  const [tasks, setTasks] = useState<DailyTask[]>([
    {
      id: 'wakeup',
      label: 'Wake up at 5 AM',
      completed: true,
      icon: Clock,
      time: '5:00 AM',
      color: 'text-orange-400'
    },
    {
      id: 'html',
      label: 'HTML Study (7-8 AM)',
      completed: true,
      icon: Code,
      time: '7:00 AM',
      color: 'text-blue-400'
    },
    {
      id: 'work',
      label: 'Work Block (8 AM - 8 PM)',
      completed: false,
      icon: Briefcase,
      time: '8:00 AM',
      color: 'text-green-400'
    },
    {
      id: 'health',
      label: 'Health Tracking',
      completed: false,
      icon: Heart,
      color: 'text-red-400'
    }
  ]);

  const completedCount = tasks.filter(task => task.completed).length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 71) return 'progress-high';
    if (percentage >= 31) return 'progress-medium';
    return 'progress-low';
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        // Trigger confetti for completion
        if (newCompleted) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#10b981', '#f59e0b']
          });
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="ghost-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              Today's Progress
            </CardTitle>
            <Badge 
              variant="secondary"
              className={`${getProgressColor(progressPercentage)} border`}
            >
              {progressPercentage.toFixed(0)}%
            </Badge>
          </div>
          <Progress 
            value={progressPercentage} 
            className="mt-4"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {completedCount} of {tasks.length} daily goals completed
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 group"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleTaskToggle(task.id)}
                className="checkbox-bounce data-[state=checked]:bg-success data-[state=checked]:border-success"
              />
              
              <div className={`p-2 rounded-lg ${task.completed ? 'bg-success/20' : 'bg-muted/50'} transition-colors`}>
                <task.icon className={`h-4 w-4 ${task.completed ? 'text-success' : task.color}`} />
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.label}
                </p>
                {task.time && (
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                )}
              </div>
              
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-success"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.div>
              )}
            </motion.div>
          ))}
          
          <Button variant="outline" className="w-full mt-4 group">
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Add Custom Goal
          </Button>
          
          {/* Progress Feedback */}
          <div className="pt-4 border-t border-border/30">
            {progressPercentage >= 90 ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Excellent work today! 🎉</span>
              </div>
            ) : progressPercentage >= 70 ? (
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Good progress! Keep it up! 💪</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Let's focus and make progress! 🎯</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}