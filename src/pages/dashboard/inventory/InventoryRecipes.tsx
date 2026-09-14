import { CheckCircle2, ChefHat, CircleDashed, Plus } from 'lucide-react';
import type { InventoryDialog, InventoryRecipe, MenuItemOption, RawMaterial } from './inventory-types';
import { consumptionUnit, formatCurrency } from './inventory-utils';
import { ActionButton, EmptyState, SectionHeader } from './InventoryPrimitives';

interface Props {
  recipes: InventoryRecipe[];
  menuItems: MenuItemOption[];
  rawMaterials: RawMaterial[];
  openDialog: (dialog: InventoryDialog) => void;
}

export function InventoryRecipes({ recipes, menuItems, rawMaterials, openDialog }: Props) {
  const recipeByMenuItem = new Map(recipes.map(recipe => [recipe.menuItem?.id ?? recipe.menuItemId, recipe]));
  const rows = menuItems.map(menuItem => ({ menuItem, recipe: recipeByMenuItem.get(menuItem.id) }));

  return (
    <div className="space-y-5">
      <SectionHeader title="Recipes" description="Connect each dish to the ingredients consumed when a paid order is settled." action={<ActionButton disabled={!menuItems.length || !rawMaterials.length} onClick={() => openDialog({ type: 'recipe' })}><Plus className="h-4 w-4" /> Configure recipe</ActionButton>} />
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
        <strong>Automatic consumption is active.</strong> For configured recipes, inventory is deducted after an order is marked paid. KG recipes are entered in GM and L/LTR recipes in ML; other units are consumed as entered. Modifiers are not mapped by the current inventory API.
      </div>
      {!rows.length ? <EmptyState title="No menu items available" description="Create menu items first, then connect them to inventory ingredients." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map(({ menuItem, recipe }) => {
            const complete = Boolean(recipe?.ingredients?.length);
            return (
              <article key={menuItem.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3"><span className="rounded-xl bg-orange-50 p-2.5 text-[#FF6B35] dark:bg-orange-500/10"><ChefHat className="h-5 w-5" /></span><div><h3 className="truncate font-black text-slate-900 dark:text-white">{menuItem.name}</h3><p className="text-xs text-slate-500">Selling price {formatCurrency(Number(menuItem.price ?? 0))}</p></div></div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${complete ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{complete ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}{complete ? 'Complete recipe' : 'No recipe'}</span>
                </div>
                {recipe ? (
                  <>
                    <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <div><span className="block text-[10px] font-bold uppercase text-slate-400">Ingredient cost</span><strong className="mt-1 block text-sm">{formatCurrency(recipe.metrics.foodCost)}</strong></div>
                      <div><span className="block text-[10px] font-bold uppercase text-slate-400">Food cost</span><strong className="mt-1 block text-sm">{recipe.metrics.foodCostPercentage.toFixed(1)}%</strong></div>
                      <div><span className="block text-[10px] font-bold uppercase text-slate-400">Contribution</span><strong className="mt-1 block text-sm text-emerald-600">{formatCurrency(recipe.metrics.grossProfit)}</strong></div>
                    </div>
                    <div className="mt-4 space-y-2">{recipe.ingredients?.map(ingredient => <div key={ingredient.id} className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">{ingredient.rawMaterial?.name}</span><strong>{ingredient.quantity} {consumptionUnit(ingredient.rawMaterial?.unit ?? '')}</strong></div>)}</div>
                    <button onClick={() => openDialog({ type: 'recipe', recipe })} className="mt-5 text-xs font-extrabold text-[#FF6B35] hover:underline">Edit recipe</button>
                  </>
                ) : <button disabled={!rawMaterials.length} onClick={() => openDialog({ type: 'recipe', menuItemId: menuItem.id })} className="mt-5 text-xs font-extrabold text-[#FF6B35] disabled:opacity-40">Configure ingredients</button>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
