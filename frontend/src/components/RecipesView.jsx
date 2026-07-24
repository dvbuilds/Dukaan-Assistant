import React, { useState } from 'react';
import { RECIPES } from '../data/products';

export default function RecipesView({ onAddToCart, onToast }) {
  const [selectedRecipe, setSelectedRecipe] = useState(RECIPES[0]);

  const handleAddIngredients = (recipe) => {
    recipe.ingredients.forEach(item => {
      onAddToCart({
        id: Math.floor(Math.random() * 90000) + 1000,
        name: item,
        categoryLabel: 'ORGANIC RECIPE INGREDIENT',
        category: 'Produce',
        price: 3.25,
        image: recipe.image,
        description: `Farm-fresh ingredient for ${recipe.title}`
      });
    });
    if (onToast) onToast(`Added all ingredients for ${recipe.title} to your cart!`);
  };

  return (
    <div className="space-y-10 max-w-[1280px] mx-auto">
      <div className="border-b border-[#c1c7d2]/60 pb-4">
        <span className="text-xs font-bold font-work text-[#006590] uppercase tracking-wider">
          FARM-TO-TABLE KITCHEN
        </span>
        <h1 className="text-3xl sm:text-4xl font-hanken font-bold text-[#1b1c1c] mt-1">
          Seasonal Recipes & Meal Prep
        </h1>
        <p className="text-sm font-work text-[#414750] mt-1">
          Cook delicious meals using 100% fresh, locally sourced organic groceries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recipe Cards List */}
        <div className="space-y-4">
          <h3 className="font-hanken font-bold text-lg text-[#003e6f]">Featured Recipes</h3>
          {RECIPES.map(recipe => (
            <div 
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                selectedRecipe.id === recipe.id
                  ? 'bg-white border-[#003e6f] ring-2 ring-[#003e6f]/20 shadow-md'
                  : 'bg-[#f5f3f3] border-[#c1c7d2] hover:bg-white'
              }`}
            >
              <img src={recipe.image} alt={recipe.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              <div>
                <h4 className="font-hanken font-bold text-base text-[#1b1c1c]">{recipe.title}</h4>
                <p className="font-work text-xs text-[#727781] mt-1">{recipe.prepTime} • {recipe.calories}</p>
                <span className="inline-block mt-2 text-[11px] font-bold text-[#003e6f] underline">
                  View Full Recipe →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Recipe Detail View */}
        <div className="lg:col-span-2 bg-white border border-[#c1c7d2] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="aspect-video rounded-xl overflow-hidden relative">
            <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded text-xs font-bold">
              {selectedRecipe.prepTime} Prep Time
            </div>
          </div>

          <div>
            <h2 className="font-hanken font-bold text-2xl sm:text-3xl text-[#003e6f]">{selectedRecipe.title}</h2>
            <p className="font-work text-sm text-[#414750] mt-1">
              Nutritious and balanced organic dish curated by Azure Harvest chefs.
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-hanken font-bold text-base text-[#1b1c1c] mb-3">Required Ingredients:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-work text-[#414750] mb-6">
              {selectedRecipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-[#f5f3f3] p-2.5 rounded-lg">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  <span>{ing}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleAddIngredients(selectedRecipe)}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#003e6f] text-white font-work font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#005696] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
              Add All Ingredients to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
