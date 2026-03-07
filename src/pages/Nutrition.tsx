import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_WATER_TIMEZONE, getDateKeyForTimezone } from "@/features/water/waterUtils";
import {
  addNutritionEntry,
  calculateNutritionFromFood,
  deleteNutritionEntry,
  getFavoriteFoods,
  getNutritionDaySummary,
  getNutritionEntriesByMeal,
  listFoodDatabaseCategories,
  listRecentNutritionEntries,
  saveFavoriteFood,
  searchFoodDatabase,
  type NutritionEntry,
  type FoodDatabaseItem,
  type NutritionMealType,
} from "@/services/nutrition";

const MEAL_SECTIONS: Array<{ key: NutritionMealType; label: string }> = [
  { key: "breakfast", label: "Desayuno" },
  { key: "lunch", label: "Almuerzo" },
  { key: "dinner", label: "Cena" },
  { key: "snack", label: "Snacks" },
];

type AddMode = "manual" | "database" | "favorite" | "yesterday" | "recent";

const Nutrition = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user, isGuest, profile } = useAuth();
  const userId = user?.id ?? null;
  const timeZone = (profile as { timezone?: string } | null)?.timezone || DEFAULT_WATER_TIMEZONE;
  const [selectedDate, setSelectedDate] = useState(() => {
    const fromQuery = searchParams.get("date");
    if (fromQuery && /^\d{4}-\d{2}-\d{2}$/.test(fromQuery)) {
      return new Date(`${fromQuery}T12:00:00`);
    }
    return new Date();
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<NutritionMealType>("breakfast");
  const [mode, setMode] = useState<AddMode>("manual");

  const [foodName, setFoodName] = useState("");
  const [servingSize, setServingSize] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [fat, setFat] = useState("0");
  const [fiber, setFiber] = useState("0");
  const [sugar, setSugar] = useState("0");
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string>("");
  const [selectedYesterdayId, setSelectedYesterdayId] = useState<string>("");
  const [selectedRecentId, setSelectedRecentId] = useState<string>("");
  const [searchFood, setSearchFood] = useState("");
  const [foodCategory, setFoodCategory] = useState("all");
  const [selectedFoodDatabaseId, setSelectedFoodDatabaseId] = useState("");
  const [consumedAmount, setConsumedAmount] = useState("100");
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);

  const todayKey = getDateKeyForTimezone(selectedDate, timeZone);
  const previousDate = addDays(selectedDate, -1);

  const summaryQuery = useQuery({
    queryKey: ["nutrition_day_summary", userId, todayKey, isGuest, timeZone],
    queryFn: () => getNutritionDaySummary(userId, selectedDate, { isGuest, timeZone }),
    enabled: Boolean(userId) || isGuest,
  });

  const favoritesQuery = useQuery({
    queryKey: ["nutrition_favorites", userId, isGuest],
    queryFn: () => getFavoriteFoods(userId, { isGuest }),
    enabled: Boolean(userId) || isGuest,
  });

  const yesterdayQuery = useQuery({
    queryKey: ["nutrition_yesterday_entries", userId, getDateKeyForTimezone(previousDate, timeZone), isGuest, timeZone],
    queryFn: () => getNutritionEntriesByMeal(userId, previousDate, { isGuest, timeZone }),
    enabled: Boolean(userId) || isGuest,
  });

  const recentQuery = useQuery({
    queryKey: ["nutrition_recent_entries", userId, isGuest],
    queryFn: () => listRecentNutritionEntries(userId, 20, { isGuest }),
    enabled: Boolean(userId) || isGuest,
  });

  const categoriesQuery = useQuery({
    queryKey: ["food_database_categories"],
    queryFn: () => listFoodDatabaseCategories().catch(() => []),
    enabled: Boolean(userId) || isGuest,
  });

  const foodSearchQuery = useQuery({
    queryKey: ["food_database_search", searchFood, foodCategory],
    queryFn: () => searchFoodDatabase({ query: searchFood, category: foodCategory, limit: 35 }).catch(() => []),
    enabled: Boolean(userId) || isGuest,
  });

  const invalidateNutrition = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["nutrition_day_summary"] }),
      queryClient.invalidateQueries({ queryKey: ["nutrition_recent_entries"] }),
      queryClient.invalidateQueries({ queryKey: ["nutrition_range_summary"] }),
      queryClient.invalidateQueries({ queryKey: ["calendar_data"] }),
      queryClient.invalidateQueries({ queryKey: ["calendar_day_nutrition"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard_snapshot"] }),
      queryClient.invalidateQueries({ queryKey: ["weekly_review_summary"] }),
      queryClient.invalidateQueries({ queryKey: ["stats_nutrition"] }),
    ]);
  };

  const addMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addNutritionEntry>[0]) => addNutritionEntry(payload),
    onSuccess: async () => {
      toast.success("Comida registrada.");
      setDialogOpen(false);
      await invalidateNutrition();
    },
    onError: (error: any) => toast.error(error?.message || "No se pudo guardar la comida."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNutritionEntry(id, userId, { isGuest }),
    onSuccess: invalidateNutrition,
    onError: (error: any) => toast.error(error?.message || "No se pudo eliminar la comida."),
  });

  const saveFavoriteMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      serving_size: number;
      serving_unit: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g?: number | null;
    }) => saveFavoriteFood(userId, payload, { isGuest }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition_favorites"] });
      toast.success("Guardado en favoritos.");
    },
  });

  const openDialogForMeal = (meal: NutritionMealType) => {
    setActiveMeal(meal);
    setMode("manual");
    setDialogOpen(true);
  };

  const daySummary = summaryQuery.data;
  const goals = daySummary?.goals;
  const totals = daySummary?.totals;
  const caloriesPct = goals ? Math.min(100, Math.round((totals!.calories / Math.max(goals.calorie_goal, 1)) * 100)) : 0;
  const proteinPct = goals ? Math.min(100, Math.round((totals!.protein_g / Math.max(goals.protein_goal_g, 1)) * 100)) : 0;
  const carbsPct = goals ? Math.min(100, Math.round((totals!.carbs_g / Math.max(goals.carb_goal_g, 1)) * 100)) : 0;
  const fatPct = goals ? Math.min(100, Math.round((totals!.fat_g / Math.max(goals.fat_goal_g, 1)) * 100)) : 0;

  const yesterdayEntries = useMemo(() => {
    const grouped = yesterdayQuery.data;
    if (!grouped) return [] as NutritionEntry[];
    return [...grouped.breakfast, ...grouped.lunch, ...grouped.dinner, ...grouped.snack];
  }, [yesterdayQuery.data]);

  const handleAddEntry = async () => {
    if (mode === "manual") {
      const payload = {
        userId,
        date: selectedDate,
        meal_type: activeMeal,
        food_name: foodName,
        serving_size: Number(servingSize),
        serving_unit: servingUnit,
        calories: Number(calories),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fat_g: Number(fat),
        fiber_g: Number(fiber),
        sugar_g: Number(sugar),
        isGuest,
        timeZone,
      } as const;
      await addMutation.mutateAsync(payload);

      if (saveAsFavorite) {
        await saveFavoriteMutation.mutateAsync({
          name: payload.food_name,
          serving_size: payload.serving_size,
          serving_unit: payload.serving_unit,
          calories: payload.calories,
          protein_g: payload.protein_g,
          carbs_g: payload.carbs_g,
          fat_g: payload.fat_g,
          fiber_g: payload.fiber_g,
        });
      }
      return;
    }

    if (mode === "database") {
      const food = (foodSearchQuery.data || []).find((row) => row.id === selectedFoodDatabaseId);
      if (!food) {
        toast.error("Selecciona un alimento de la base.");
        return;
      }
      const amount = Number(consumedAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Ingresa una cantidad valida.");
        return;
      }
      const computed = calculateNutritionFromFood(food as FoodDatabaseItem, amount);
      await addMutation.mutateAsync({
        userId,
        date: selectedDate,
        meal_type: activeMeal,
        food_name: food.food_name,
        serving_size: computed.serving_size,
        serving_unit: computed.serving_unit,
        calories: computed.calories,
        protein_g: computed.protein_g,
        carbs_g: computed.carbs_g,
        fat_g: computed.fat_g,
        fiber_g: computed.fiber_g,
        sugar_g: computed.sugar_g,
        notes: `Base food_database (${food.category})`,
        isGuest,
        timeZone,
      });
      return;
    }

    if (mode === "favorite") {
      const favorite = (favoritesQuery.data || []).find((row) => row.id === selectedFavoriteId);
      if (!favorite) {
        toast.error("Selecciona un favorito.");
        return;
      }
      await addMutation.mutateAsync({
        userId,
        date: selectedDate,
        meal_type: activeMeal,
        food_name: favorite.name,
        serving_size: favorite.serving_size,
        serving_unit: favorite.serving_unit,
        calories: favorite.calories,
        protein_g: favorite.protein_g,
        carbs_g: favorite.carbs_g,
        fat_g: favorite.fat_g,
        fiber_g: favorite.fiber_g,
        isGuest,
        timeZone,
      });
      return;
    }

    if (mode === "yesterday") {
      const entry = yesterdayEntries.find((row) => row.id === selectedYesterdayId);
      if (!entry) {
        toast.error("Selecciona una comida de ayer.");
        return;
      }
      await addMutation.mutateAsync({
        userId,
        date: selectedDate,
        meal_type: activeMeal,
        food_name: entry.food_name,
        serving_size: entry.serving_size,
        serving_unit: entry.serving_unit,
        calories: entry.calories,
        protein_g: entry.protein_g,
        carbs_g: entry.carbs_g,
        fat_g: entry.fat_g,
        fiber_g: entry.fiber_g,
        sugar_g: entry.sugar_g,
        notes: entry.notes,
        isGuest,
        timeZone,
      });
      return;
    }

    const recent = (recentQuery.data || []).find((row) => row.id === selectedRecentId);
    if (!recent) {
      toast.error("Selecciona una comida reciente.");
      return;
    }
    await addMutation.mutateAsync({
      userId,
      date: selectedDate,
      meal_type: activeMeal,
      food_name: recent.food_name,
      serving_size: recent.serving_size,
      serving_unit: recent.serving_unit,
      calories: recent.calories,
      protein_g: recent.protein_g,
      carbs_g: recent.carbs_g,
      fat_g: recent.fat_g,
      fiber_g: recent.fiber_g,
      sugar_g: recent.sugar_g,
      notes: recent.notes,
      isGuest,
      timeZone,
    });
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nutrition</h1>
          <p className="text-sm text-muted-foreground">Food diary diario por comida y seguimiento de macros.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate((prev) => addDays(prev, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium min-w-36 text-center">{format(selectedDate, "dd/MM/yyyy")}</p>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate((prev) => addDays(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen diario</CardTitle>
          <CardDescription>Calorias y macros consumidos vs objetivo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Calorias</p>
              <p className="text-2xl font-semibold">
                {totals?.calories ?? 0} / {goals?.calorie_goal ?? 2000}
              </p>
              <Progress value={caloriesPct} className="mt-2" />
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Proteina (g)</p>
              <p className="text-2xl font-semibold">
                {totals?.protein_g ?? 0} / {goals?.protein_goal_g ?? 150}
              </p>
              <Progress value={proteinPct} className="mt-2" />
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Carbohidratos (g)</p>
              <p className="text-2xl font-semibold">
                {totals?.carbs_g ?? 0} / {goals?.carb_goal_g ?? 250}
              </p>
              <Progress value={carbsPct} className="mt-2" />
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Grasas (g)</p>
              <p className="text-2xl font-semibold">
                {totals?.fat_g ?? 0} / {goals?.fat_goal_g ?? 70}
              </p>
              <Progress value={fatPct} className="mt-2" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Fibra: {totals?.fiber_g ?? 0} g | Azucar: {totals?.sugar_g ?? 0} g
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {MEAL_SECTIONS.map((meal) => {
          const entries = daySummary?.groups[meal.key] || [];
          const subtotal = daySummary?.mealTotals[meal.key];
          return (
            <Card key={meal.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{meal.label}</CardTitle>
                  <Button size="sm" onClick={() => openDialogForMeal(meal.key)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar comida
                  </Button>
                </div>
                <CardDescription>
                  {subtotal?.calories ?? 0} kcal | P {subtotal?.protein_g ?? 0}g | C {subtotal?.carbs_g ?? 0}g | G{" "}
                  {subtotal?.fat_g ?? 0}g
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {entries.length === 0 && <p className="text-sm text-muted-foreground">Sin registros en esta comida.</p>}
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-md border p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{entry.food_name}</p>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.serving_size} {entry.serving_unit} | {entry.calories} kcal | P {entry.protein_g} | C {entry.carbs_g} | G{" "}
                      {entry.fat_g}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar comida ({MEAL_SECTIONS.find((m) => m.key === activeMeal)?.label})</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Modo rapido</Label>
            <Select value={mode} onValueChange={(value: AddMode) => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="database">Buscar en base</SelectItem>
                <SelectItem value="favorite">Favorito</SelectItem>
                <SelectItem value="yesterday">Duplicar de ayer</SelectItem>
                <SelectItem value="recent">Reutilizar reciente</SelectItem>
              </SelectContent>
            </Select>

            {mode === "database" && (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input value={searchFood} onChange={(e) => setSearchFood(e.target.value)} placeholder="Buscar alimento..." />
                  <Select value={foodCategory} onValueChange={setFoodCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {(categoriesQuery.data || []).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={selectedFoodDatabaseId} onValueChange={setSelectedFoodDatabaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona alimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {(foodSearchQuery.data || []).map((food) => (
                      <SelectItem key={food.id} value={food.id}>
                        {food.food_name} ({food.calories} kcal/{food.serving_size}
                        {food.serving_unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    value={consumedAmount}
                    onChange={(e) => setConsumedAmount(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Cantidad consumida"
                  />
                  <div className="flex items-center rounded-md border px-3 text-sm text-muted-foreground">
                    {(foodSearchQuery.data || []).find((row) => row.id === selectedFoodDatabaseId)?.serving_unit || "g"}
                  </div>
                </div>

                {(() => {
                  const selectedFood = (foodSearchQuery.data || []).find((row) => row.id === selectedFoodDatabaseId);
                  if (!selectedFood) return null;
                  const amount = Number(consumedAmount);
                  if (!Number.isFinite(amount) || amount <= 0) return null;
                  const computed = calculateNutritionFromFood(selectedFood as FoodDatabaseItem, amount);
                  return (
                    <p className="text-xs text-muted-foreground">
                      Preview: {computed.calories} kcal | P {computed.protein_g} | C {computed.carbs_g} | G {computed.fat_g}
                    </p>
                  );
                })()}
              </div>
            )}

            {mode === "manual" && (
              <div className="space-y-2">
                <Input value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="Nombre alimento" />
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input value={servingSize} onChange={(e) => setServingSize(e.target.value)} type="number" min="0" placeholder="Porcion" />
                  <Input value={servingUnit} onChange={(e) => setServingUnit(e.target.value)} placeholder="unidad" className="w-24" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" min="0" placeholder="kcal" />
                  <Input value={protein} onChange={(e) => setProtein(e.target.value)} type="number" min="0" placeholder="Proteina g" />
                  <Input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" min="0" placeholder="Carbs g" />
                  <Input value={fat} onChange={(e) => setFat(e.target.value)} type="number" min="0" placeholder="Grasas g" />
                  <Input value={fiber} onChange={(e) => setFiber(e.target.value)} type="number" min="0" placeholder="Fibra g" />
                  <Input value={sugar} onChange={(e) => setSugar(e.target.value)} type="number" min="0" placeholder="Azucar g" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={saveAsFavorite} onChange={(e) => setSaveAsFavorite(e.target.checked)} />
                  Guardar en favoritos
                </label>
                <p className="text-xs text-muted-foreground">
                  Preview: {Number(calories || 0)} kcal | P {Number(protein || 0)} | C {Number(carbs || 0)} | G {Number(fat || 0)}
                </p>
              </div>
            )}

            {mode === "favorite" && (
              <Select value={selectedFavoriteId} onValueChange={setSelectedFavoriteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona favorito" />
                </SelectTrigger>
                <SelectContent>
                  {(favoritesQuery.data || []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.calories} kcal)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {mode === "yesterday" && (
              <Select value={selectedYesterdayId} onValueChange={setSelectedYesterdayId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona comida de ayer" />
                </SelectTrigger>
                <SelectContent>
                  {yesterdayEntries.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.food_name} ({item.calories} kcal)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {mode === "recent" && (
              <Select value={selectedRecentId} onValueChange={setSelectedRecentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona reciente" />
                </SelectTrigger>
                <SelectContent>
                  {(recentQuery.data || []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.food_name} ({item.calories} kcal)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEntry} disabled={addMutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Nutrition;
