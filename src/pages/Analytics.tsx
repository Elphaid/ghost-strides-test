import { useEffect, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Target, Trophy, DollarSign, BookOpen, Palette, PenTool, Heart } from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    goalsAchieved: 0,
    goalsPending: 0,
    savingsTotal: 0,
    designs: 0,
    reflections: 0,
    studyDone: 0,
    healthEntries: 0,
  });

  useEffect(() => {
    document.title = "Analytics | Ghost Goal";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const [goalsRes, savingsRes, designsRes, reflRes, studyRes, healthRes] = await Promise.all([
        supabase.from("goals").select("status").eq("user_id", user.id),
        supabase.from("savings").select("amount").eq("user_id", user.id),
        supabase.from("design_portfolio").select("id").eq("user_id", user.id),
        supabase.from("reflections").select("id").eq("user_id", user.id),
        supabase.from("html_curriculum").select("completed").eq("user_id", user.id),
        supabase.from("health_metrics").select("id").eq("user_id", user.id),
      ]);

      const goals = goalsRes.data || [];
      const savings = savingsRes.data || [];
      const designs = designsRes.data || [];
      const reflections = reflRes.data || [];
      const study = studyRes.data || [];
      const health = healthRes.data || [];

      setMetrics({
        goalsAchieved: goals.filter((g: any) => g.status === "achieved").length,
        goalsPending: goals.filter((g: any) => g.status === "pending").length,
        savingsTotal: savings.reduce((s: number, r: any) => s + Number(r.amount || 0), 0),
        designs: designs.length,
        reflections: reflections.length,
        studyDone: study.filter((t: any) => t.completed).length,
        healthEntries: health.length,
      });
    };
    load();
  }, [user]);

  const items = [
    { title: "Goals Achieved", value: metrics.goalsAchieved, icon: Trophy },
    { title: "Active Goals", value: metrics.goalsPending, icon: Target },
    { title: "Total Savings", value: metrics.savingsTotal, icon: DollarSign },
    { title: "Study Topics Done", value: metrics.studyDone, icon: BookOpen },
    { title: "Designs", value: metrics.designs, icon: Palette },
    { title: "Reflections", value: metrics.reflections, icon: PenTool },
    { title: "Health Entries", value: metrics.healthEntries, icon: Heart },
  ];

  return (
    <FullScreenLayout currentSection="analytics">
      <div className="h-full overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <Card key={it.title} className="ghost-card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <it.icon className="h-5 w-5 text-primary" />
                  {it.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{typeof it.value === "number" ? it.value.toString() : it.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </FullScreenLayout>
  );
}
