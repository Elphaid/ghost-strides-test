import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Camera, Trash2, RotateCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileData {
  display_name: string;
  phone: string;
}

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    phone: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
    }
  }, [user, isOpen]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, phone')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setProfileData({
          display_name: data.display_name || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profileData.display_name || null,
          phone: profileData.phone || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleClearAllGoals = async () => {
    if (!user || !confirm('Are you sure you want to archive all goals? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .update({ archived: true })
        .eq('user_id', user.id)
        .eq('archived', false);
      
      if (error) throw error;
      
      toast({
        title: "Goals Archived!",
        description: "All active goals have been archived.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error archiving goals:', error);
      toast({
        title: "Error",
        description: "Failed to archive goals. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleDeleteCompletedGoals = async () => {
    if (!user || !confirm('Are you sure you want to permanently delete all completed goals?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'achieved');
      
      if (error) throw error;
      
      toast({
        title: "Completed Goals Deleted!",
        description: "All completed goals have been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting completed goals:', error);
      toast({
        title: "Error",
        description: "Failed to delete completed goals. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleRestoreGoals = async () => {
    if (!user || !confirm('Restore all archived goals to active status?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          archived: false,
          status: 'pending'
        })
        .eq('user_id', user.id)
        .eq('archived', true);
      
      if (error) throw error;
      
      toast({
        title: "Goals Restored!",
        description: "All archived goals have been restored to active status.",
      });
    } catch (error) {
      console.error('Error restoring goals:', error);
      toast({
        title: "Error",
        description: "Failed to restore goals. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile & Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile" className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-lg bg-primary/20 text-primary">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  {avatarUrl && (
                    <Button variant="outline" size="sm" onClick={() => setAvatarUrl('')}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData(prev => ({...prev, display_name: e.target.value}))}
                    placeholder="Your display name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="+254 xxx xxx xxx"
                  />
                </div>
                
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-border/50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-warning" />
                    Archive All Active Goals
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Move all active goals to archive. You can restore them later.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearAllGoals}
                    disabled={loading}
                    className="border-warning text-warning hover:bg-warning/10"
                  >
                    Archive All Goals
                  </Button>
                </div>

                <div className="p-4 border border-border/50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-success" />
                    Restore Archived Goals
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Restore all archived goals back to active status.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRestoreGoals}
                    disabled={loading}
                    className="border-success text-success hover:bg-success/10"
                  >
                    Restore Goals
                  </Button>
                </div>

                <div className="p-4 border border-destructive/50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete Completed Goals
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Permanently delete all completed goals. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteCompletedGoals}
                    disabled={loading}
                  >
                    Delete Completed Goals
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};