import { useEffect, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save } from "lucide-react";

interface Topic { id: string; topic: string; notes: string | null; completed: boolean | null; completed_date: string | null; }

export default function Study() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => { document.title = "Study Progress | Ghost Goal"; }, []);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("html_curriculum")
      .select("id,topic,notes,completed,completed_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setTopics((data as any) || []);
  };
  useEffect(() => { load(); }, [user]);

  const toggle = async (id: string, next: boolean) => {
    const prev = topics;
    setTopics((ts) => ts.map((t) => (t.id === id ? { ...t, completed: next, completed_date: next ? new Date().toISOString().slice(0, 10) : null } : t)));
    const { error } = await supabase
      .from("html_curriculum")
      .update({ completed: next, completed_date: next ? new Date().toISOString().slice(0, 10) : null })
      .eq("id", id);
    if (error) {
      setTopics(prev);
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const saveNote = async (id: string, notes: string) => {
    const prev = topics;
    setTopics((ts) => ts.map((t) => (t.id === id ? { ...t, notes } : t)));
    const { error } = await supabase.from("html_curriculum").update({ notes }).eq("id", id);
    if (error) {
      setTopics(prev);
      toast({ title: "Failed", variant: "destructive" });
    } else {
      toast({ title: "Saved" });
    }
  };

  return (
    <FullScreenLayout currentSection="study">
      <div className="h-full overflow-auto p-6 space-y-6">
        <Card className="ghost-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> HTML Study Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-muted/20 space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox checked={!!t.completed} onCheckedChange={(v) => toggle(t.id, Boolean(v))} />
                  <div className="flex-1">
                    <div className="font-medium">{t.topic}</div>
                    <div className="text-xs text-muted-foreground">{t.completed_date ? `Completed: ${new Date(t.completed_date).toLocaleDateString()}` : "Not completed"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Textarea value={t.notes || ""} onChange={(e) => setTopics((ts) => ts.map((x) => x.id === t.id ? { ...x, notes: e.target.value } : x))} placeholder="Notes..." />
                  <Button onClick={() => saveNote(t.id, topics.find(x => x.id === t.id)?.notes || "")} className="gap-2"><Save className="h-4 w-4"/> Save</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </FullScreenLayout>
  );
}
