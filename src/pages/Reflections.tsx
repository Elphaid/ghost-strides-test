import { useEffect, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PenTool, Plus } from "lucide-react";

interface Row { id: string; type: string; date: string; content: string | null; wins: string | null; challenges: string | null; prayer_verse: string | null; }

export default function Reflections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("daily");
  const [content, setContent] = useState("");
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [verse, setVerse] = useState("");

  useEffect(() => { document.title = "Reflections | Ghost Goal"; }, []);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reflections")
      .select("id,type,date,content,wins,challenges,prayer_verse")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setRows((data as any) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("reflections")
      .insert([{ user_id: user.id, type, date, content: content || null, wins: wins || null, challenges: challenges || null, prayer_verse: verse || null }])
      .select();
    if (error) return toast({ title: "Failed", variant: "destructive" });
    setRows([...(data as any), ...rows]);
    setContent(""); setWins(""); setChallenges(""); setVerse("");
    toast({ title: "Added" });
  };

  return (
    <FullScreenLayout currentSection="reflections">
      <div className="h-full overflow-auto p-6 space-y-6">
        <Card className="ghost-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5"/> New Reflection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="Type (daily, weekly, ...)" value={type} onChange={(e) => setType(e.target.value)} />
              <Input placeholder="Wins" value={wins} onChange={(e) => setWins(e.target.value)} />
              <Input placeholder="Challenges" value={challenges} onChange={(e) => setChallenges(e.target.value)} />
            </div>
            <Input placeholder="Prayer/Verse (optional)" value={verse} onChange={(e) => setVerse(e.target.value)} />
            <Textarea placeholder="Reflection content (optional)" value={content} onChange={(e) => setContent(e.target.value)} />
            <Button onClick={add} className="gap-2"><Plus className="h-4 w-4"/> Add</Button>
          </CardContent>
        </Card>

        <Card className="ghost-card">
          <CardHeader><CardTitle>History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Challenges</TableHead>
                  <TableHead>Verse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell className="max-w-[240px] truncate">{r.wins || '-'}</TableCell>
                    <TableCell className="max-w-[240px] truncate">{r.challenges || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.prayer_verse || '-'}</TableCell>
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
