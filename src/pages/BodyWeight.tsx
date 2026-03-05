import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Scale } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  BodyMetricEntry,
  deleteBodyMetric,
  getGuestBodyMetrics,
  getWeightTrendAnalysis,
  listBodyMetrics,
  saveGuestBodyMetrics,
  upsertBodyMetric,
} from "@/services/bodyMetrics";
import GuestWarningBanner from "@/components/GuestWarningBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const todayISO = () => new Date().toISOString().slice(0, 10);

const BodyWeight = () => {
  const { user, isGuest } = useAuth();
  const queryClient = useQueryClient();

  const [measuredAt, setMeasuredAt] = useState(todayISO());
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingOriginalDate, setEditingOriginalDate] = useState<string | null>(null);
  const [guestEntries, setGuestEntries] = useState<BodyMetricEntry[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BodyMetricEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["body_metrics", user?.id],
    queryFn: () => listBodyMetrics(user?.id ?? null, isGuest),
    enabled: Boolean(user?.id) && !isGuest,
  });
  const { data: trendAnalysis } = useQuery({
    queryKey: ["body_metrics_trend", user?.id, isGuest],
    queryFn: () => getWeightTrendAnalysis(user?.id ?? null, isGuest),
    enabled: Boolean(user?.id) || isGuest,
  });

  useEffect(() => {
    if (!isGuest) return;
    setGuestEntries(getGuestBodyMetrics());
  }, [isGuest]);

  const displayedEntries = isGuest ? guestEntries : entries;

  const saveMutation = useMutation({
    mutationFn: async (payload: { measured_at: string; weight_kg: number; notes: string | null }) => {
      if (isGuest) return null;
      return upsertBodyMetric({
        userId: user?.id ?? null,
        isGuest,
        measured_at: payload.measured_at,
        weight_kg: payload.weight_kg,
        notes: payload.notes,
      });
    },
    onSuccess: async () => {
      if (!isGuest && user?.id) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["body_metrics", user.id] }),
          queryClient.invalidateQueries({ queryKey: ["body_metrics_trend"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["stats"] }),
        ]);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) return;
      await deleteBodyMetric(id, user?.id ?? null, isGuest);
    },
    onSuccess: async () => {
      if (!isGuest && user?.id) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["body_metrics", user.id] }),
          queryClient.invalidateQueries({ queryKey: ["body_metrics_trend"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["stats"] }),
        ]);
      }
    },
  });

  const resetForm = () => {
    setMeasuredAt(todayISO());
    setWeightKg("");
    setNotes("");
    setEditingEntryId(null);
    setEditingOriginalDate(null);
  };

  const validate = () => {
    const numericWeight = Number(weightKg);
    if (!measuredAt) {
      toast.error("Date is required.");
      return null;
    }
    if (!Number.isFinite(numericWeight) || numericWeight < 20 || numericWeight > 400) {
      toast.error("Weight must be between 20 and 400 kg.");
      return null;
    }
    return numericWeight;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericWeight = validate();
    if (numericWeight === null) return;

    try {
      if (isGuest) {
        let nextEntries = [...guestEntries];

        if (editingEntryId) {
          nextEntries = nextEntries.filter((entry) => entry.id !== editingEntryId);
        }

        const sameDayIdx = nextEntries.findIndex((entry) => entry.measured_at === measuredAt);
        const localEntry: BodyMetricEntry = {
          id: editingEntryId || crypto.randomUUID(),
          user_id: "guest",
          measured_at: measuredAt,
          weight_kg: numericWeight,
          notes: notes || null,
          created_at: new Date().toISOString(),
        };

        if (sameDayIdx >= 0) {
          nextEntries[sameDayIdx] = localEntry;
        } else {
          nextEntries.push(localEntry);
        }

        nextEntries.sort((a, b) => b.measured_at.localeCompare(a.measured_at));
        setGuestEntries(nextEntries);
        saveGuestBodyMetrics(nextEntries);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["body_metrics_trend"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["stats"] }),
        ]);
        toast.info("Guest mode: weight entries won't be saved to your account.");
        resetForm();
        return;
      }

      await saveMutation.mutateAsync({
        measured_at: measuredAt,
        weight_kg: numericWeight,
        notes: notes || null,
      });

      if (editingEntryId && editingOriginalDate && editingOriginalDate !== measuredAt) {
        await deleteMutation.mutateAsync(editingEntryId);
      }

      toast.success("Weight entry saved.");
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save weight entry.");
    }
  };

  const handleEdit = (entry: BodyMetricEntry) => {
    setEditingEntryId(entry.id);
    setEditingOriginalDate(entry.measured_at);
    setMeasuredAt(entry.measured_at);
    setWeightKg(String(entry.weight_kg));
    setNotes(entry.notes || "");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (isGuest) {
        const nextEntries = guestEntries.filter((entry) => entry.id !== deleteTarget.id);
        setGuestEntries(nextEntries);
        saveGuestBodyMetrics(nextEntries);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["body_metrics_trend"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["stats"] }),
        ]);
      } else {
        await deleteMutation.mutateAsync(deleteTarget.id);
      }
      toast.success("Weight entry deleted.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete weight entry.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const latestWeight = useMemo(() => displayedEntries[0]?.weight_kg ?? null, [displayedEntries]);
  const trendLabel = useMemo(() => {
    if (!trendAnalysis) return "Sin datos";
    if (trendAnalysis.trend === "up") return "Subiendo";
    if (trendAnalysis.trend === "down") return "Bajando";
    return "Estable";
  }, [trendAnalysis]);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {isGuest && <GuestWarningBanner />}

      <div className="flex items-center gap-3">
        <Scale className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Weight</h1>
          <p className="text-sm text-muted-foreground">
            Track your body weight over time.
            {latestWeight !== null ? ` Latest: ${latestWeight} kg` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Media movil 7d:{" "}
            {trendAnalysis?.movingAvg7 === null || trendAnalysis?.movingAvg7 === undefined
              ? "--"
              : `${trendAnalysis.movingAvg7.toFixed(2)} kg`}{" "}
            | Cambio semanal:{" "}
            {trendAnalysis?.weeklyChange === null || trendAnalysis?.weeklyChange === undefined
              ? "--"
              : `${trendAnalysis.weeklyChange > 0 ? "+" : ""}${trendAnalysis.weeklyChange.toFixed(2)} kg`}{" "}
            | Tendencia: {trendLabel}
          </p>
          {isGuest && (
            <p className="text-xs text-amber-700 mt-1">Guest mode: weight entries won't be saved to your account.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Moving average 7d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {trendAnalysis?.movingAvg7 === null || trendAnalysis?.movingAvg7 === undefined
                ? "--"
                : `${trendAnalysis.movingAvg7.toFixed(2)} kg`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weekly change</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {trendAnalysis?.weeklyChange === null || trendAnalysis?.weeklyChange === undefined
                ? "--"
                : `${trendAnalysis.weeklyChange > 0 ? "+" : ""}${trendAnalysis.weeklyChange.toFixed(2)} kg`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trend classification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{trendLabel}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingEntryId ? "Edit Entry" : "Add Entry"}</CardTitle>
          <CardDescription>Save one entry per day.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="measuredAt">Date</Label>
                <Input
                  id="measuredAt"
                  type="date"
                  value={measuredAt}
                  onChange={(e) => setMeasuredAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  min="20"
                  max="400"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel today?"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending || deleteMutation.isPending}>
                {editingEntryId ? "Update Entry" : "Save Entry"}
              </Button>
              {editingEntryId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !isGuest ? (
            <p className="text-sm text-muted-foreground">Loading entries...</p>
          ) : displayedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.measured_at}</TableCell>
                    <TableCell>{entry.weight_kg} kg</TableCell>
                    <TableCell>{entry.notes || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(entry)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete weight entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BodyWeight;
