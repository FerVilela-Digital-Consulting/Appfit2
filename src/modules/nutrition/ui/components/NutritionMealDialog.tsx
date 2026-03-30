import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AddMode } from "@/modules/nutrition/ui/nutritionConstants";
import { FOOD_SERVING_UNITS, MEAL_SECTIONS } from "@/modules/nutrition/ui/nutritionConstants";
import type { FavoriteFood, FoodDatabaseItem, NutritionEntry, NutritionMealType } from "@/modules/nutrition/types";

type NutritionMealDialogProps = {
  open: boolean;
  activeMeal: NutritionMealType;
  mode: AddMode;
  effectiveProfileLabel: string;
  searchFood: string;
  foodCategory: string;
  selectedFoodDatabaseId: string;
  consumedAmount: string;
  selectedFoodPreview: { calories: number; protein_g: number; carbs_g: number; fat_g: number } | null;
  foodName: string;
  servingSize: string;
  servingUnit: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  potassium: string;
  saveAsFavorite: boolean;
  selectedFavoriteId: string;
  selectedYesterdayId: string;
  selectedRecentId: string;
  categories: string[];
  foodSearchResults: FoodDatabaseItem[];
  foodLibraryItems: FoodDatabaseItem[];
  favorites: FavoriteFood[];
  yesterdayEntries: NutritionEntry[];
  recentEntries: NutritionEntry[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (value: AddMode) => void;
  onSearchFoodChange: (value: string) => void;
  onFoodCategoryChange: (value: string) => void;
  onSelectedFoodDatabaseIdChange: (value: string) => void;
  onConsumedAmountChange: (value: string) => void;
  onFoodNameChange: (value: string) => void;
  onServingSizeChange: (value: string) => void;
  onServingUnitChange: (value: string) => void;
  onCaloriesChange: (value: string) => void;
  onProteinChange: (value: string) => void;
  onCarbsChange: (value: string) => void;
  onFatChange: (value: string) => void;
  onFiberChange: (value: string) => void;
  onSugarChange: (value: string) => void;
  onSodiumChange: (value: string) => void;
  onPotassiumChange: (value: string) => void;
  onSaveAsFavoriteChange: (value: boolean) => void;
  onSelectedFavoriteIdChange: (value: string) => void;
  onSelectedYesterdayIdChange: (value: string) => void;
  onSelectedRecentIdChange: (value: string) => void;
  onSave: () => void;
};

export function NutritionMealDialog({
  open,
  activeMeal,
  mode,
  effectiveProfileLabel,
  searchFood,
  foodCategory,
  selectedFoodDatabaseId,
  consumedAmount,
  selectedFoodPreview,
  foodName,
  servingSize,
  servingUnit,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
  potassium,
  saveAsFavorite,
  selectedFavoriteId,
  selectedYesterdayId,
  selectedRecentId,
  categories,
  foodSearchResults,
  foodLibraryItems,
  favorites,
  yesterdayEntries,
  recentEntries,
  isPending,
  onOpenChange,
  onModeChange,
  onSearchFoodChange,
  onFoodCategoryChange,
  onSelectedFoodDatabaseIdChange,
  onConsumedAmountChange,
  onFoodNameChange,
  onServingSizeChange,
  onServingUnitChange,
  onCaloriesChange,
  onProteinChange,
  onCarbsChange,
  onFatChange,
  onFiberChange,
  onSugarChange,
  onSodiumChange,
  onPotassiumChange,
  onSaveAsFavoriteChange,
  onSelectedFavoriteIdChange,
  onSelectedYesterdayIdChange,
  onSelectedRecentIdChange,
  onSave,
}: NutritionMealDialogProps) {
  const [databaseUnitFilter, setDatabaseUnitFilter] = useState("all");
  const [databaseSort, setDatabaseSort] = useState<"name_asc" | "calories_desc" | "protein_desc">("name_asc");

  const databaseRows = useMemo(() => {
    const source = foodLibraryItems.length > 0 ? foodLibraryItems : foodSearchResults;
    const normalizedQuery = searchFood.trim().toLowerCase();
    const normalizedCategory = foodCategory.trim().toLowerCase();

    const filtered = source.filter((row) => {
      if (normalizedCategory && normalizedCategory !== "all" && row.category.trim().toLowerCase() !== normalizedCategory) return false;
      if (databaseUnitFilter !== "all" && row.serving_unit !== databaseUnitFilter) return false;
      if (!normalizedQuery) return true;
      const searchable = `${row.food_name} ${row.category} ${row.serving_unit}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });

    filtered.sort((a, b) => {
      if (databaseSort === "name_asc") return a.food_name.localeCompare(b.food_name, "es", { sensitivity: "base" });
      if (databaseSort === "calories_desc") return b.calories - a.calories;
      return b.protein_g - a.protein_g;
    });

    return filtered.slice(0, 60);
  }, [foodLibraryItems, foodSearchResults, searchFood, foodCategory, databaseUnitFilter, databaseSort]);

  const databaseUnitOptions = useMemo(() => {
    const source = foodLibraryItems.length > 0 ? foodLibraryItems : foodSearchResults;
    const unitSet = new Set(source.map((row) => row.serving_unit).filter(Boolean));
    return Array.from(unitSet).sort((a, b) => a.localeCompare(b));
  }, [foodLibraryItems, foodSearchResults]);

  const selectedDatabaseFood = useMemo(
    () => databaseRows.find((row) => row.id === selectedFoodDatabaseId) ?? foodSearchResults.find((row) => row.id === selectedFoodDatabaseId) ?? null,
    [databaseRows, foodSearchResults, selectedFoodDatabaseId],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-dialog-surface max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Agregar comida - {MEAL_SECTIONS.find((m) => m.key === activeMeal)?.label}</DialogTitle>
          <DialogDescription>
            Registra alimentos en la comida activa usando carga manual, base de datos, favoritos o recientes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
            <div className="space-y-2">
              <Label className="app-surface-muted">Modo de carga</Label>
              <Select value={mode} onValueChange={(value) => onModeChange(value as AddMode)}>
                <SelectTrigger className="app-input-surface"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Carga manual</SelectItem>
                  <SelectItem value="database">Base de alimentos</SelectItem>
                  <SelectItem value="favorite">Favoritos</SelectItem>
                  <SelectItem value="yesterday">Duplicar de ayer</SelectItem>
                  <SelectItem value="recent">Recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="app-panel-block app-surface-muted rounded-2xl px-4 py-3 text-sm">
              <div className="app-surface-heading font-medium">Contexto activo</div>
              <div className="mt-1">Comida destino: {MEAL_SECTIONS.find((m) => m.key === activeMeal)?.label}</div>
              <div className="mt-1">Perfil del dia: {effectiveProfileLabel}</div>
            </div>
          </div>

          {mode === "database" && (
            <div className="app-panel-block space-y-4 rounded-2xl p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <Input
                  value={searchFood}
                  onChange={(e) => onSearchFoodChange(e.target.value)}
                  placeholder="Buscar alimento..."
                  className="app-input-surface xl:col-span-2"
                />
                <Select value={foodCategory} onValueChange={onFoodCategoryChange}>
                  <SelectTrigger className="app-input-surface"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorias</SelectItem>
                    {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={databaseUnitFilter} onValueChange={setDatabaseUnitFilter}>
                  <SelectTrigger className="app-input-surface"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las unidades</SelectItem>
                    {databaseUnitOptions.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={databaseSort} onValueChange={(value) => setDatabaseSort(value as "name_asc" | "calories_desc" | "protein_desc")}>
                  <SelectTrigger className="app-input-surface"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc">Nombre A-Z</SelectItem>
                    <SelectItem value="calories_desc">Kcal mayor a menor</SelectItem>
                    <SelectItem value="protein_desc">Proteina mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <div className="app-panel-block rounded-xl px-3 py-2">Total: <span className="font-semibold">{databaseRows.length}</span></div>
                <div className="app-panel-block rounded-xl px-3 py-2">Categorias: <span className="font-semibold">{categories.length}</span></div>
                <div className="app-panel-block rounded-xl px-3 py-2">Seleccionado: <span className="font-semibold">{selectedDatabaseFood ? 1 : 0}</span></div>
              </div>

              <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {databaseRows.length === 0 ? (
                  <div className="app-surface-caption rounded-xl border border-dashed border-border/50 px-3 py-4 text-sm">
                    Sin resultados para los filtros actuales.
                  </div>
                ) : (
                  databaseRows.map((food) => {
                    const isSelected = selectedFoodDatabaseId === food.id;
                    return (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => onSelectedFoodDatabaseIdChange(food.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${isSelected ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40 hover:bg-primary/5"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="app-surface-heading truncate text-sm font-semibold">{food.food_name}</p>
                            <p className="app-surface-caption text-xs">{food.category}</p>
                          </div>
                          <span className="app-surface-caption text-xs">{food.serving_size} {food.serving_unit}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                          <div className="app-panel-block rounded-lg px-2 py-1 text-center">{food.calories} kcal</div>
                          <div className="app-panel-block rounded-lg px-2 py-1 text-center text-emerald-300">P {food.protein_g}</div>
                          <div className="app-panel-block rounded-lg px-2 py-1 text-center text-cyan-300">C {food.carbs_g}</div>
                          <div className="app-panel-block rounded-lg px-2 py-1 text-center text-amber-300">G {food.fat_g}</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                <Input
                  value={consumedAmount}
                  onChange={(e) => onConsumedAmountChange(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Cantidad consumida"
                  className="app-input-surface"
                />
                <div className="app-panel-block app-surface-muted flex items-center justify-center rounded-xl text-sm">
                  {selectedDatabaseFood?.serving_unit || "g"}
                </div>
              </div>
              {selectedFoodPreview && (
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm text-foreground/80">
                  Vista previa: {selectedFoodPreview.calories} kcal | P {selectedFoodPreview.protein_g} | C {selectedFoodPreview.carbs_g} | G {selectedFoodPreview.fat_g}
                </div>
              )}
            </div>
          )}
          {mode === "manual" && <div className="app-panel-block space-y-3 rounded-2xl p-4"><Input value={foodName} onChange={(e) => onFoodNameChange(e.target.value)} placeholder="Nombre alimento" className="app-input-surface" /><div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px]"><Input value={servingSize} onChange={(e) => onServingSizeChange(e.target.value)} type="number" min="0" placeholder="Porcion" className="app-input-surface" /><Select value={servingUnit || undefined} onValueChange={onServingUnitChange}><SelectTrigger className="app-input-surface"><SelectValue placeholder="unidad" /></SelectTrigger><SelectContent>{FOOD_SERVING_UNITS.map((unit) => <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Input value={calories} onChange={(e) => onCaloriesChange(e.target.value)} type="number" min="0" placeholder="kcal" className="app-input-surface" /><Input value={protein} onChange={(e) => onProteinChange(e.target.value)} type="number" min="0" placeholder="Proteina g" className="app-input-surface" /><Input value={carbs} onChange={(e) => onCarbsChange(e.target.value)} type="number" min="0" placeholder="Carbs g" className="app-input-surface" /><Input value={fat} onChange={(e) => onFatChange(e.target.value)} type="number" min="0" placeholder="Grasas g" className="app-input-surface" /><Input value={fiber} onChange={(e) => onFiberChange(e.target.value)} type="number" min="0" placeholder="Fibra g" className="app-input-surface" /><Input value={sugar} onChange={(e) => onSugarChange(e.target.value)} type="number" min="0" placeholder="Azucar g" className="app-input-surface" /><Input value={sodium} onChange={(e) => onSodiumChange(e.target.value)} type="number" min="0" placeholder="Sodio mg" className="app-input-surface" /><Input value={potassium} onChange={(e) => onPotassiumChange(e.target.value)} type="number" min="0" placeholder="Potasio mg" className="app-input-surface" /></div><label className="app-surface-muted flex items-center gap-2 text-sm"><input type="checkbox" checked={saveAsFavorite} onChange={(e) => onSaveAsFavoriteChange(e.target.checked)} />Guardar en favoritos</label></div>}
          {mode === "favorite" && <Select value={selectedFavoriteId} onValueChange={onSelectedFavoriteIdChange}><SelectTrigger className="app-input-surface"><SelectValue placeholder="Selecciona favorito" /></SelectTrigger><SelectContent>{favorites.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} ({item.calories} kcal)</SelectItem>)}</SelectContent></Select>}
          {mode === "yesterday" && <Select value={selectedYesterdayId} onValueChange={onSelectedYesterdayIdChange}><SelectTrigger className="app-input-surface"><SelectValue placeholder="Selecciona comida de ayer" /></SelectTrigger><SelectContent>{yesterdayEntries.map((item) => <SelectItem key={item.id} value={item.id}>{item.food_name} ({item.calories} kcal)</SelectItem>)}</SelectContent></Select>}
          {mode === "recent" && <Select value={selectedRecentId} onValueChange={onSelectedRecentIdChange}><SelectTrigger className="app-input-surface"><SelectValue placeholder="Selecciona reciente" /></SelectTrigger><SelectContent>{recentEntries.map((item) => <SelectItem key={item.id} value={item.id}>{item.food_name} ({item.calories} kcal)</SelectItem>)}</SelectContent></Select>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full app-outline-button sm:w-auto">Cancelar</Button>
          <Button onClick={onSave} disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
