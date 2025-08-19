import { useEffect, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette, Plus } from "lucide-react";

interface Row { id: string; title: string; tool: string | null; date: string; external_link: string | null; }

export default function Portfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [title, setTitle] = useState("");
  const [tool, setTool] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [link, setLink] = useState("");

  useEffect(() => { document.title = "Portfolio | Ghost Goal"; }, []);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("design_portfolio")
      .select("id,title,tool,date,external_link")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setRows((data as any) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!title.trim() || !user) return; 
    const { data, error } = await supabase
      .from("design_portfolio")
      .insert([{ user_id: user.id, title, tool: tool || null, date, external_link: link || null }])
      .select();
    if (error) return toast({ title: "Failed", variant: "destructive" });
    setRows([...(data as any), ...rows]);
    setTitle(""); setTool(""); setLink("");
    toast({ title: "Added" });
  };

  return (
    <FullScreenLayout currentSection="portfolio">
      <div className="h-full overflow-auto p-6 space-y-6">
        <Card className="ghost-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-creative"/> Design Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Tool (e.g. Figma)" value={tool} onChange={(e) => setTool(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="External link (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <Button onClick={add} className="gap-2"><Plus className="h-4 w-4"/> Add</Button>
          </CardContent>
        </Card>

        <Card className="ghost-card">
          <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.tool || '-'}</TableCell>
                    <TableCell>{r.external_link ? <a href={r.external_link} target="_blank" rel="noreferrer" className="story-link">Open</a> : '-'}</TableCell>
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
