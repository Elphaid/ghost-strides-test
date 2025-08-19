import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import FullScreenLayout from '@/components/FullScreenLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus,
  Target,
  Calendar,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Edit,
  Archive,
  Tag,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  type: string;
  priority: string;
  category: string;
  deadline?: string;
  status: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'habit' as const,
    priority: 'medium' as const,
    category: 'personal',
    deadline: '',
    notes: ''
  });

  const categories = [
    'health', 'study', 'finance', 'creative', 'personal', 'spiritual', 'work', 'social'
  ];

  const priorityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-success text-success-foreground'
  } as any;

  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    achieved: 'bg-success text-success-foreground',
    not_achieved: 'bg-destructive text-destructive-foreground'
  } as any;

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal title",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            ...newGoal,
            user_id: user?.id,
            deadline: newGoal.deadline || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
      setNewGoal({
        title: '',
        type: 'habit',
        priority: 'medium',
        category: 'personal',
        deadline: '',
        notes: ''
      });
      setIsAddingGoal(false);

      toast({
        title: "Success!",
        description: "Goal added successfully",
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    }
  };

  const updateGoalStatus = async (goalId: string, status: 'achieved' | 'not_achieved', reason?: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status, reason })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, status, reason } : goal
      ));

      toast({
        title: status === 'achieved' ? "🎉 Goal Achieved!" : "Goal Updated",
        description: status === 'achieved' 
          ? "Congratulations on reaching your goal!" 
          : "Goal marked as not achieved",
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const clearAllGoals = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({ archived: true })
        .eq('user_id', user.id)
        .eq('archived', false);

      if (error) throw error;

      // Clear all goals from UI since they're archived
      setGoals([]);

      toast({
        title: "Success!",
        description: "All goals have been archived and cleared",
      });
    } catch (error) {
      console.error('Error clearing goals:', error);
      toast({
        title: "Error",
        description: "Failed to clear goals",
        variant: "destructive",
      });
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesFilter = filter === 'all' || goal.status === filter;
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .neq('archived', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGoals(data || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchGoals();
  }, [user]);

  const getProgress = () => {
    const total = goals.length;
    const achieved = goals.filter(g => g.status === 'achieved').length;
    return total > 0 ? Math.round((achieved / total) * 100) : 0;
  };

  return (
    <FullScreenLayout currentSection="goals">
      <div className="h-full overflow-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
              <Target className="h-8 w-8" />
              Goals & Habits
            </h1>
            <p className="text-muted-foreground">
              Track your progress and achieve your dreams, one goal at a time.
            </p>
          </div>
          
          <div className="flex gap-2">
            {goals.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Goals</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive all your current goals. They won't be deleted permanently but will be hidden from view. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllGoals}>
                      Clear All Goals
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Goal title..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newGoal.type} onValueChange={(value: any) => setNewGoal({ ...newGoal, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="habit">Habit</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={newGoal.priority} onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />

                <Textarea
                  placeholder="Notes (optional)..."
                  value={newGoal.notes}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                />

                <div className="flex gap-2">
                  <Button onClick={addGoal} className="flex-1">Add Goal</Button>
                  <Button variant="outline" onClick={() => setIsAddingGoal(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="ghost-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Overall Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {goals.filter(g => g.status === 'achieved').length} of {goals.length} goals completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{getProgress()}%</div>
                  <div className="text-xs text-muted-foreground">Completion</div>
                </div>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'achieved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('achieved')}
            >
              Achieved
            </Button>
          </div>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="ghost-card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">{goal.title}</CardTitle>
                      <Badge className={`${statusColors[goal.status]} text-xs`}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {goal.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                      <Badge className={`${priorityColors[goal.priority]} text-xs`}>
                        {goal.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    )}
                    
                    {goal.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {goal.notes}
                      </p>
                    )}

                    {goal.reason && (
                      <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">Reason: {goal.reason}</p>
                      </div>
                    )}
                    
                    {goal.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => updateGoalStatus(goal.id, 'achieved')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Achieved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const reason = prompt("Why wasn't this goal achieved?");
                            if (reason) updateGoalStatus(goal.id, 'not_achieved', reason);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Not Yet
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredGoals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first goal!'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddingGoal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Goal
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </FullScreenLayout>
  );
};

export default Goals;