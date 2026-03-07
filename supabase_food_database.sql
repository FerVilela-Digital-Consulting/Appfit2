create extension if not exists pgcrypto;

create table if not exists public.food_database (
  id uuid primary key default gen_random_uuid(),
  food_name text not null,
  category text not null,
  serving_size numeric not null default 100,
  serving_unit text not null default 'g',
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric default 0,
  sugar_g numeric default 0,
  source text not null default 'USDA',
  created_at timestamptz default now()
);

create unique index if not exists food_database_food_name_uidx on public.food_database (food_name);
create index if not exists food_database_category_idx on public.food_database (category);
create index if not exists food_database_food_name_idx on public.food_database (food_name);

alter table public.food_database enable row level security;

drop policy if exists food_database_select_all on public.food_database;
create policy food_database_select_all
on public.food_database
for select
using (true);

insert into public.food_database
  (food_name, category, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, source)
values
  -- PROTEINAS
  ('Chicken breast', 'Proteins', 100, 'g', 165, 31, 0, 3.6, 0, 0, 'USDA'),
  ('Turkey breast', 'Proteins', 100, 'g', 135, 29, 0, 1, 0, 0, 'USDA'),
  ('Lean beef', 'Proteins', 100, 'g', 250, 26, 0, 15, 0, 0, 'USDA'),
  ('Pork loin', 'Proteins', 100, 'g', 242, 27, 0, 14, 0, 0, 'USDA'),
  ('Salmon', 'Proteins', 100, 'g', 208, 20, 0, 13, 0, 0, 'USDA'),
  ('Tuna', 'Proteins', 100, 'g', 132, 28, 0, 1, 0, 0, 'USDA'),
  ('Shrimp', 'Proteins', 100, 'g', 99, 24, 0, 0.3, 0, 0, 'USDA'),
  ('Egg', 'Proteins', 100, 'g', 155, 13, 1.1, 11, 0, 0, 'USDA'),
  ('Egg white', 'Proteins', 100, 'g', 52, 11, 0.7, 0.2, 0, 0, 'USDA'),
  ('Tofu', 'Proteins', 100, 'g', 76, 8, 1.9, 4.8, 0, 0, 'USDA'),
  ('Tempeh', 'Proteins', 100, 'g', 193, 20, 7, 11, 0, 0, 'USDA'),
  ('Greek yogurt', 'Proteins', 100, 'g', 59, 10, 3.6, 0.4, 0, 0, 'USDA'),
  ('Cottage cheese', 'Proteins', 100, 'g', 98, 11, 3.4, 4.3, 0, 0, 'USDA'),
  ('Cheddar cheese', 'Proteins', 100, 'g', 403, 25, 1.3, 33, 0, 0, 'USDA'),
  ('Mozzarella', 'Proteins', 100, 'g', 280, 28, 3, 17, 0, 0, 'USDA'),

  -- CARBOHIDRATOS
  ('White rice', 'Carbohydrates', 100, 'g', 130, 2.4, 28, 0.3, 0, 0, 'USDA'),
  ('Brown rice', 'Carbohydrates', 100, 'g', 123, 2.7, 25, 1, 0, 0, 'USDA'),
  ('Pasta', 'Carbohydrates', 100, 'g', 158, 5.8, 31, 0.9, 0, 0, 'USDA'),
  ('Whole wheat pasta', 'Carbohydrates', 100, 'g', 149, 5.5, 30, 1.1, 0, 0, 'USDA'),
  ('Oats', 'Carbohydrates', 100, 'g', 389, 16.9, 66, 6.9, 0, 0, 'USDA'),
  ('Quinoa', 'Carbohydrates', 100, 'g', 120, 4.4, 21, 1.9, 0, 0, 'USDA'),
  ('Barley', 'Carbohydrates', 100, 'g', 354, 12, 73, 2.3, 0, 0, 'USDA'),
  ('Corn', 'Carbohydrates', 100, 'g', 96, 3.4, 21, 1.5, 0, 0, 'USDA'),
  ('Potato', 'Carbohydrates', 100, 'g', 77, 2, 17, 0.1, 0, 0, 'USDA'),
  ('Sweet potato', 'Carbohydrates', 100, 'g', 86, 1.6, 20, 0.1, 0, 0, 'USDA'),
  ('Bread white', 'Carbohydrates', 100, 'g', 265, 9, 49, 3.2, 0, 0, 'USDA'),
  ('Bread whole wheat', 'Carbohydrates', 100, 'g', 247, 13, 41, 4.2, 0, 0, 'USDA'),
  ('Tortilla corn', 'Carbohydrates', 100, 'g', 218, 5.7, 45, 2.8, 0, 0, 'USDA'),
  ('Tortilla flour', 'Carbohydrates', 100, 'g', 312, 8, 52, 8, 0, 0, 'USDA'),

  -- FRUTAS
  ('Apple', 'Fruits', 100, 'g', 52, 0.3, 14, 0.2, 0, 0, 'USDA'),
  ('Banana', 'Fruits', 100, 'g', 89, 1.1, 23, 0.3, 0, 0, 'USDA'),
  ('Orange', 'Fruits', 100, 'g', 47, 0.9, 12, 0.1, 0, 0, 'USDA'),
  ('Strawberry', 'Fruits', 100, 'g', 32, 0.7, 8, 0.3, 0, 0, 'USDA'),
  ('Blueberry', 'Fruits', 100, 'g', 57, 0.7, 14, 0.3, 0, 0, 'USDA'),
  ('Pineapple', 'Fruits', 100, 'g', 50, 0.5, 13, 0.1, 0, 0, 'USDA'),
  ('Mango', 'Fruits', 100, 'g', 60, 0.8, 15, 0.4, 0, 0, 'USDA'),
  ('Grapes', 'Fruits', 100, 'g', 69, 0.7, 18, 0.2, 0, 0, 'USDA'),
  ('Watermelon', 'Fruits', 100, 'g', 30, 0.6, 8, 0.2, 0, 0, 'USDA'),
  ('Papaya', 'Fruits', 100, 'g', 43, 0.5, 11, 0.3, 0, 0, 'USDA'),
  ('Kiwi', 'Fruits', 100, 'g', 61, 1.1, 15, 0.5, 0, 0, 'USDA'),
  ('Peach', 'Fruits', 100, 'g', 39, 0.9, 10, 0.3, 0, 0, 'USDA'),

  -- VEGETALES
  ('Broccoli', 'Vegetables', 100, 'g', 34, 2.8, 7, 0.4, 0, 0, 'USDA'),
  ('Spinach', 'Vegetables', 100, 'g', 23, 2.9, 3.6, 0.4, 0, 0, 'USDA'),
  ('Carrot', 'Vegetables', 100, 'g', 41, 0.9, 10, 0.2, 0, 0, 'USDA'),
  ('Tomato', 'Vegetables', 100, 'g', 18, 0.9, 3.9, 0.2, 0, 0, 'USDA'),
  ('Cucumber', 'Vegetables', 100, 'g', 16, 0.7, 3.6, 0.1, 0, 0, 'USDA'),
  ('Onion', 'Vegetables', 100, 'g', 40, 1.1, 9, 0.1, 0, 0, 'USDA'),
  ('Garlic', 'Vegetables', 100, 'g', 149, 6.4, 33, 0.5, 0, 0, 'USDA'),
  ('Bell pepper', 'Vegetables', 100, 'g', 31, 1, 6, 0.3, 0, 0, 'USDA'),
  ('Zucchini', 'Vegetables', 100, 'g', 17, 1.2, 3.1, 0.3, 0, 0, 'USDA'),
  ('Eggplant', 'Vegetables', 100, 'g', 25, 1, 6, 0.2, 0, 0, 'USDA'),
  ('Mushrooms', 'Vegetables', 100, 'g', 22, 3.1, 3.3, 0.3, 0, 0, 'USDA'),
  ('Lettuce', 'Vegetables', 100, 'g', 15, 1.4, 2.9, 0.2, 0, 0, 'USDA'),

  -- GRASAS Y FRUTOS SECOS
  ('Olive oil', 'Fats and Nuts', 100, 'g', 884, 0, 0, 100, 0, 0, 'USDA'),
  ('Butter', 'Fats and Nuts', 100, 'g', 717, 0.9, 0, 81, 0, 0, 'USDA'),
  ('Avocado', 'Fats and Nuts', 100, 'g', 160, 2, 9, 15, 0, 0, 'USDA'),
  ('Peanut butter', 'Fats and Nuts', 100, 'g', 588, 25, 20, 50, 0, 0, 'USDA'),
  ('Almonds', 'Fats and Nuts', 100, 'g', 579, 21, 22, 50, 0, 0, 'USDA'),
  ('Walnuts', 'Fats and Nuts', 100, 'g', 654, 15, 14, 65, 0, 0, 'USDA'),
  ('Cashews', 'Fats and Nuts', 100, 'g', 553, 18, 30, 44, 0, 0, 'USDA'),
  ('Chia seeds', 'Fats and Nuts', 100, 'g', 486, 17, 42, 31, 0, 0, 'USDA'),
  ('Flax seeds', 'Fats and Nuts', 100, 'g', 534, 18, 29, 42, 0, 0, 'USDA'),
  ('Sunflower seeds', 'Fats and Nuts', 100, 'g', 584, 21, 20, 51, 0, 0, 'USDA'),

  -- LACTEOS
  ('Milk whole', 'Dairy', 100, 'ml', 61, 3.2, 5, 3.3, 0, 0, 'USDA'),
  ('Milk skim', 'Dairy', 100, 'ml', 34, 3.4, 5, 0.1, 0, 0, 'USDA'),
  ('Yogurt plain', 'Dairy', 100, 'g', 59, 10, 3.6, 0.4, 0, 0, 'USDA'),
  ('Yogurt flavored', 'Dairy', 100, 'g', 95, 3.5, 15, 2, 0, 0, 'USDA'),
  ('Cream', 'Dairy', 100, 'g', 340, 2, 3, 36, 0, 0, 'USDA'),

  -- BEBIDAS
  ('Water', 'Beverages', 100, 'ml', 0, 0, 0, 0, 0, 0, 'USDA'),
  ('Coffee', 'Beverages', 100, 'ml', 2, 0.3, 0, 0, 0, 0, 'USDA'),
  ('Tea', 'Beverages', 100, 'ml', 1, 0, 0, 0, 0, 0, 'USDA'),
  ('Beer', 'Beverages', 100, 'ml', 43, 0.5, 3.6, 0, 0, 0, 'USDA'),
  ('Wine', 'Beverages', 100, 'ml', 85, 0, 2.6, 0, 0, 0, 'USDA'),
  ('Soda', 'Beverages', 100, 'ml', 39, 0, 10, 0, 0, 0, 'USDA'),
  ('Orange juice', 'Beverages', 100, 'ml', 45, 0.7, 10, 0.2, 0, 0, 'USDA'),
  ('Apple juice', 'Beverages', 100, 'ml', 46, 0.1, 11, 0.1, 0, 0, 'USDA')
on conflict (food_name) do update
set
  category = excluded.category,
  serving_size = excluded.serving_size,
  serving_unit = excluded.serving_unit,
  calories = excluded.calories,
  protein_g = excluded.protein_g,
  carbs_g = excluded.carbs_g,
  fat_g = excluded.fat_g,
  fiber_g = excluded.fiber_g,
  sugar_g = excluded.sugar_g,
  source = excluded.source;
