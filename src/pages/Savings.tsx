import { useEffect, useState } from "react";
import FullScreenLayout from "@/components/FullScreenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus } from "lucide-react";

interface SavingRow { id: string; date: string; amount: number; note: string | null; }

export default function Savings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<SavingRow[]>([]);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => { document.title = "Savings | Ghost Goal"; }, []);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("savings")
      .select("id,date,amount,note")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (!error) setRows((data as any) || []);
  };

  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("savings")
      .insert([{ user_id: user.id, date, amount, note: note || null }])
      .select();
    if (error) {
      toast({ title: "Failed to add", variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setAmount(0);
      setNote("");
      setRows([...(data as any), ...rows]);
    }
  };

  return (
    <FullScreenLayout currentSection="savings">
      <div className="h-full overflow-auto p-6 space-y-6">
        <Card className="ghost-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" /> Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button onClick={add} className="gap-2"><Plus className="h-4 w-4" /> Log Savings</Button>
          </CardContent>
        </Card>

        <Card className="ghost-card">
          <CardHeader><CardTitle>History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.amount}</TableCell>
                    <TableCell>{r.note || "-"}</TableCell>
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
