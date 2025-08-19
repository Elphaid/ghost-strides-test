import { useEffect, useMemo, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle2, Clock, Target } from "lucide-react";

interface GoalRow {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  deadline: string | null;
}

export default function Daily() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const todayISO = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    document.title = "Daily View | Ghost Goal";
  }, []);

  useEffect(() => {
    const fetchToday = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("goals")
        .select("id,title,type,category,status,deadline")
        .eq("user_id", user.id)
        .in("status", ["pending"]) as any;
      if (error) {
        console.error(error);
        return;
      }
      setGoals(data || []);
    };
    fetchToday();
  }, [user]);

  const todayList = useMemo(() => {
    return goals.filter((g) => {
      if (!g.deadline) return g.type === "daily" || g.type === "habit";
      return g.deadline === todayISO;
    });
  }, [goals, todayISO]);

  const markDone = async (id: string) => {
    const prev = goals;
    setGoals((gs) => gs.map((g) => (g.id === id ? { ...g, status: "achieved" } : g)));
    const { error } = await supabase.from("goals").update({ status: "achieved" }).eq("id", id);
    if (error) {
      console.error(error);
      setGoals(prev);
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      toast({ title: "Marked achieved" });
    }
  };

  return (
    <FullScreenLayout currentSection="daily">
      <div className="h-full overflow-auto p-6 space-y-6">
        <Card className="ghost-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily View
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayList.length === 0 && (
              <p className="text-sm text-muted-foreground">No items for today yet.</p>
            )}
            {todayList.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <input type="checkbox" onChange={() => markDone(g.id)} />
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{g.title}</span>
                <Badge variant="outline">{g.category}</Badge>
                {g.deadline && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(g.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </FullScreenLayout>
  );
}
