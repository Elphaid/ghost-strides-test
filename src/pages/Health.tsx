import { useEffect, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus } from "lucide-react";

interface HM { id: string; date: string; weight: number | null; water_ml: number | null; calories: number | null; meals: number | null; }

export default function Health() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<HM[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState<number | ''>('');
  const [water, setWater] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');
  const [meals, setMeals] = useState<number | ''>('');

  useEffect(() => { document.title = "Health | Ghost Goal"; }, []);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("health_metrics")
      .select("id,date,weight,water_ml,calories,meals")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setRows((data as any) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("health_metrics")
      .insert([{ user_id: user.id, date, weight: weight || null, water_ml: water || null, calories: calories || null, meals: meals || null }])
      .select();
    if (error) return toast({ title: "Failed", variant: "destructive" });
    setRows([...(data as any), ...rows]);
    toast({ title: "Updated" });
    setWeight(''); setWater(''); setCalories(''); setMeals('');
  };

  return (
    <FullScreenLayout currentSection="health">
      <div className="h-full overflow-auto p-6 space-y-6">
        <Card className="ghost-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-destructive"/> Health Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} />
              <Input type="number" placeholder="Water (ml)" value={water} onChange={(e) => setWater(e.target.value === '' ? '' : Number(e.target.value))} />
              <Input type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))} />
              <Input type="number" placeholder="Meals" value={meals} onChange={(e) => setMeals(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <Button onClick={add} className="gap-2"><Plus className="h-4 w-4"/> Save</Button>
          </CardContent>
        </Card>

        <Card className="ghost-card">
          <CardHeader><CardTitle>Recent</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Water (ml)</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Meals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.weight ?? '-'}</TableCell>
                    <TableCell>{r.water_ml ?? '-'}</TableCell>
                    <TableCell>{r.calories ?? '-'}</TableCell>
                    <TableCell>{r.meals ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </FullScreenLayout>
  );
}
