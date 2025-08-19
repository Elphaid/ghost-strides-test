import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Target, DollarSign, Heart, BookOpen, Palette, PenTool } from 'lucide-react';

export const QuickAddDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [goalData, setGoalData] = useState({
    title: '',
    type: 'goal',
    category: 'personal',
    priority: 'medium',
    deadline: '',
    notes: ''
  });

  const [savingData, setSavingData] = useState({
    amount: '',
    note: ''
  });

  const [healthData, setHealthData] = useState({
    weight: '',
    calories: '',
    water_ml: '',
    meals: ''
  });

  const [studyData, setStudyData] = useState({
    topic: '',
    notes: ''
  });

  const [designData, setDesignData] = useState({
    title: '',
    tool: '',
    external_link: ''
  });

  const [reflectionData, setReflectionData] = useState({
    type: 'daily',
    content: '',
    wins: '',
    challenges: ''
  });

  const handleAddGoal = async () => {
    if (!user || !goalData.title.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        ...goalData,
        deadline: goalData.deadline || null
      });
      
      if (error) throw error;
      
      toast({
        title: "Goal Added!",
        description: "Your goal has been successfully created.",
      });
      
      setGoalData({
        title: '',
        type: 'goal',
        category: 'personal',
        priority: 'medium',
        deadline: '',
        notes: ''
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleAddSaving = async () => {
    if (!user || !savingData.amount) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('savings').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(savingData.amount),
        note: savingData.note || null,
        time_recorded: new Date().toTimeString().split(' ')[0]
      });
      
      if (error) throw error;
      
      toast({
        title: "Savings Logged!",
        description: `KSH ${savingData.amount} has been added to your savings.`,
      });
      
      setSavingData({ amount: '', note: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging savings:', error);
      toast({
        title: "Error",
        description: "Failed to log savings. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleAddHealth = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('health_metrics').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        weight: healthData.weight ? parseFloat(healthData.weight) : null,
        calories: healthData.calories ? parseInt(healthData.calories) : null,
        water_ml: healthData.water_ml ? parseInt(healthData.water_ml) : null,
        meals: healthData.meals ? parseInt(healthData.meals) : null
      });
      
      if (error) throw error;
      
      toast({
        title: "Health Update Logged!",
        description: "Your health metrics have been updated.",
      });
      
      setHealthData({ weight: '', calories: '', water_ml: '', meals: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging health data:', error);
      toast({
        title: "Error",
        description: "Failed to log health data. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleAddStudy = async () => {
    if (!user || !studyData.topic.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('html_curriculum').insert({
        user_id: user.id,
        topic: studyData.topic,
        notes: studyData.notes || null,
        completed: false
      });
      
      if (error) throw error;
      
      toast({
        title: "Study Topic Added!",
        description: "New study topic has been added to your curriculum.",
      });
      
      setStudyData({ topic: '', notes: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding study topic:', error);
      toast({
        title: "Error",
        description: "Failed to add study topic. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleAddDesign = async () => {
    if (!user || !designData.title.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('design_portfolio').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ...designData
      });
      
      if (error) throw error;
      
      toast({
        title: "Design Added!",
        description: "Your design has been added to your portfolio.",
      });
      
      setDesignData({ title: '', tool: '', external_link: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding design:', error);
      toast({
        title: "Error",
        description: "Failed to add design. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleAddReflection = async () => {
    if (!user || !reflectionData.content.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('reflections').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ...reflectionData
      });
      
      if (error) throw error;
      
      toast({
        title: "Reflection Added!",
        description: "Your reflection has been saved.",
      });
      
      setReflectionData({ type: 'daily', content: '', wins: '', challenges: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding reflection:', error);
      toast({
        title: "Error",
        description: "Failed to add reflection. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-primary hover:shadow-hover transition-all duration-300">
          <Plus className="h-4 w-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient">Quick Add</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="goal" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="goal" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Goal
            </TabsTrigger>
            <TabsTrigger value="saving" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Saving
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Health
            </TabsTrigger>
            <TabsTrigger value="study" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Study
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Design
            </TabsTrigger>
            <TabsTrigger value="reflection" className="text-xs">
              <PenTool className="h-3 w-3 mr-1" />
              Reflect
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="goal" className="space-y-4">
              <div>
                <Label htmlFor="goal-title">Goal Title *</Label>
                <Input
                  id="goal-title"
                  value={goalData.title}
                  onChange={(e) => setGoalData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter your goal..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal-type">Type</Label>
                  <Select value={goalData.type} onValueChange={(value) => setGoalData(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="habit">Habit</SelectItem>
                      <SelectItem value="daily">Daily Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="goal-category">Category</Label>
                  <Select value={goalData.category} onValueChange={(value) => setGoalData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal-priority">Priority</Label>
                  <Select value={goalData.priority} onValueChange={(value) => setGoalData(prev => ({...prev, priority: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="goal-deadline">Deadline</Label>
                  <Input
                    id="goal-deadline"
                    type="date"
                    value={goalData.deadline}
                    onChange={(e) => setGoalData(prev => ({...prev, deadline: e.target.value}))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="goal-notes">Notes</Label>
                <Textarea
                  id="goal-notes"
                  value={goalData.notes}
                  onChange={(e) => setGoalData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Additional details..."
                />
              </div>
              
              <Button onClick={handleAddGoal} disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Goal"}
              </Button>
            </TabsContent>

            <TabsContent value="saving" className="space-y-4">
              <div>
                <Label htmlFor="saving-amount">Amount (KSH) *</Label>
                <Input
                  id="saving-amount"
                  type="number"
                  step="0.01"
                  value={savingData.amount}
                  onChange={(e) => setSavingData(prev => ({...prev, amount: e.target.value}))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="saving-note">Note</Label>
                <Textarea
                  id="saving-note"
                  value={savingData.note}
                  onChange={(e) => setSavingData(prev => ({...prev, note: e.target.value}))}
                  placeholder="What did you save for?"
                />
              </div>
              
              <Button onClick={handleAddSaving} disabled={loading} className="w-full">
                {loading ? "Logging..." : "Log Savings"}
              </Button>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health-weight">Weight (kg)</Label>
                  <Input
                    id="health-weight"
                    type="number"
                    step="0.1"
                    value={healthData.weight}
                    onChange={(e) => setHealthData(prev => ({...prev, weight: e.target.value}))}
                    placeholder="70.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="health-calories">Calories</Label>
                  <Input
                    id="health-calories"
                    type="number"
                    value={healthData.calories}
                    onChange={(e) => setHealthData(prev => ({...prev, calories: e.target.value}))}
                    placeholder="2000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health-water">Water (ml)</Label>
                  <Input
                    id="health-water"
                    type="number"
                    value={healthData.water_ml}
                    onChange={(e) => setHealthData(prev => ({...prev, water_ml: e.target.value}))}
                    placeholder="2000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="health-meals">Meals</Label>
                  <Input
                    id="health-meals"
                    type="number"
                    value={healthData.meals}
                    onChange={(e) => setHealthData(prev => ({...prev, meals: e.target.value}))}
                    placeholder="3"
                  />
                </div>
              </div>
              
              <Button onClick={handleAddHealth} disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Health"}
              </Button>
            </TabsContent>

            <TabsContent value="study" className="space-y-4">
              <div>
                <Label htmlFor="study-topic">Study Topic *</Label>
                <Input
                  id="study-topic"
                  value={studyData.topic}
                  onChange={(e) => setStudyData(prev => ({...prev, topic: e.target.value}))}
                  placeholder="What are you studying?"
                />
              </div>
              
              <div>
                <Label htmlFor="study-notes">Notes</Label>
                <Textarea
                  id="study-notes"
                  value={studyData.notes}
                  onChange={(e) => setStudyData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Study notes and progress..."
                />
              </div>
              
              <Button onClick={handleAddStudy} disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Study Topic"}
              </Button>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div>
                <Label htmlFor="design-title">Design Title *</Label>
                <Input
                  id="design-title"
                  value={designData.title}
                  onChange={(e) => setDesignData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Name your design..."
                />
              </div>
              
              <div>
                <Label htmlFor="design-tool">Tool Used</Label>
                <Input
                  id="design-tool"
                  value={designData.tool}
                  onChange={(e) => setDesignData(prev => ({...prev, tool: e.target.value}))}
                  placeholder="Figma, Photoshop, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="design-link">External Link</Label>
                <Input
                  id="design-link"
                  value={designData.external_link}
                  onChange={(e) => setDesignData(prev => ({...prev, external_link: e.target.value}))}
                  placeholder="https://..."
                />
              </div>
              
              <Button onClick={handleAddDesign} disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Design"}
              </Button>
            </TabsContent>

            <TabsContent value="reflection" className="space-y-4">
              <div>
                <Label htmlFor="reflection-type">Type</Label>
                <Select value={reflectionData.type} onValueChange={(value) => setReflectionData(prev => ({...prev, type: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reflection-content">Reflection *</Label>
                <Textarea
                  id="reflection-content"
                  value={reflectionData.content}
                  onChange={(e) => setReflectionData(prev => ({...prev, content: e.target.value}))}
                  placeholder="Write your reflection..."
                />
              </div>
              
              <div>
                <Label htmlFor="reflection-wins">Wins</Label>
                <Textarea
                  id="reflection-wins"
                  value={reflectionData.wins}
                  onChange={(e) => setReflectionData(prev => ({...prev, wins: e.target.value}))}
                  placeholder="What went well?"
                />
              </div>
              
              <div>
                <Label htmlFor="reflection-challenges">Challenges</Label>
                <Textarea
                  id="reflection-challenges"
                  value={reflectionData.challenges}
                  onChange={(e) => setReflectionData(prev => ({...prev, challenges: e.target.value}))}
                  placeholder="What was challenging?"
                />
              </div>
              
              <Button onClick={handleAddReflection} disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Reflection"}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};