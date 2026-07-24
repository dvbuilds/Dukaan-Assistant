import React, { useState } from 'react';
import { CATEGORIES, PARTNER_STORES } from '../data/products';

export default function DealsScreen({ products, onAddToCart, onOpenSmartCart, searchQuery, onToast }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [recipeEmail, setRecipeEmail] = useState('');

  // Filter products based on selected category, partner, or search
  const filteredProducts = products.filter(p => {
    // Search query filter
    if (searchQuery) {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (p.category.toLowerCase() !== selectedCategory.toLowerCase() && 
          !p.categoryLabel.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleShareReferral = () => {
    navigator.clipboard?.writeText('https://azureharvest.app/ref/FRESH20');
    setReferralCopied(true);
    if (onToast) onToast('Referral link copied to clipboard! Share with friends for $20 off.');
    setTimeout(() => setReferralCopied(false), 3000);
  };

  const handleRecipeSubscribe = (e) => {
    e.preventDefault();
    if (recipeEmail) {
      if (onToast) onToast(`Subscribed ${recipeEmail} to weekly AI meal plans!`);
      setRecipeEmail('');
    }
  };

  return (
    <div className="space-y-12">
      
      {/* Smart Shopping AI Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#005696] min-h-[320px] flex items-center shadow-lg border border-[#c1c7d2]/30">
        
        {/* Background Image Half */}
        <div className="absolute right-0 top-0 h-full w-full lg:w-1/2 opacity-30 lg:opacity-100 transition-opacity">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLNkZK-HCt1tQ0UK9DXM_tcNXvvpTOTaQtF5hgT_RrDPwmrlZP8F1LDuXJxjkvw-fr2zAJme1eP_W4uMjmAzK9oGTRv-a_U3x75LKUolsTZgdaztZp-cAENm53z9tH5lIxw3mgQjPtU9gQS6WUccRYoeR6NyRHWJc6n-LRdg0ebefq2itFXKTzmZebrcO4co0PlXSr5UT7qym3-1A526K_WaJsN0cdjqsIqbQ0NAJsheYswmPIWgwEOB93V_-Qz1or7JtGQ_zk9xfh"
            alt="AI Smart Shopping background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#005696] via-[#005696]/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-12 max-w-2xl text-white space-y-4">
          <span className="inline-block bg-[#4bbdff] text-[#004a6c] font-work font-bold px-3 py-1 rounded-full text-xs tracking-wider">
            AI-POWERED INSIGHTS
          </span>

          <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl leading-tight">
            Smart Shopping with AI
          </h1>

          <p className="font-work text-sm sm:text-base text-[#a1c9ff] leading-relaxed">
            Let our Azure Intelligence optimize your pantry. Get personalized recommendations based on your health goals and regional availability.
          </p>

          <div className="flex flex-wrap gap-4 pt-3">
            <button 
              onClick={onOpenSmartCart}
              className="bg-white text-[#003e6f] px-7 py-3 rounded-lg font-work font-bold text-xs uppercase tracking-wider hover:bg-[#d2e4ff] transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Start Smart Cart
            </button>

            <button 
              onClick={() => alert('Azure Intelligence analyzes seasonal farm stock to minimize organic food costs and automate recurring weekly grocery lists.')}
              className="border border-white/80 text-white px-7 py-3 rounded-lg font-work font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Nearby Azure Partners Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-hanken font-bold text-xl sm:text-2xl text-[#1b1c1c]">
              Nearby Azure Partners
            </h2>
            <p className="font-work text-sm text-[#414750]">
              Fresh delivery from your local premium stores
            </p>
          </div>

          <button 
            onClick={() => setPartnerFilter(null)}
            className="text-[#003e6f] font-work font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:underline"
          >
            {partnerFilter ? 'Show All Stores' : 'View All'} 
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>

        {/* Store Scroll List */}
        <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
          {PARTNER_STORES.map((store) => (
            <div 
              key={store.id}
              onClick={() => {
                setPartnerFilter(partnerFilter === store.id ? null : store.id);
                if (onToast) onToast(`Filtered for ${store.name}`);
              }}
              className={`flex-none w-44 text-center group cursor-pointer transition-all ${
                partnerFilter === store.id ? 'scale-105' : ''
              }`}
            >
              <div className={`w-28 h-28 mx-auto rounded-full border border-[#c1c7d2] flex items-center justify-center mb-3 bg-white product-card-hover group-hover:border-[#003e6f] p-3 ${
                partnerFilter === store.id ? 'ring-4 ring-[#003e6f]/20 border-[#003e6f]' : ''
              }`}>
                <img 
                  src={store.logo} 
                  alt={store.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-work font-bold text-xs text-[#1b1c1c] group-hover:text-[#003e6f] transition-colors truncate">
                {store.name}
              </p>
              <p className="font-work text-[11px] text-[#727781] mt-0.5">
                {store.distance}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-hanken font-bold text-xl sm:text-2xl text-[#1b1c1c]">
            Browse by Category
          </h2>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-[#003e6f] hover:underline"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                className={`group text-center border rounded-xl p-5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#003e6f] border-[#003e6f] text-white shadow-md'
                    : 'bg-white border-[#c1c7d2] text-[#1b1c1c] hover:border-[#003e6f] hover:shadow-xs'
                }`}
              >
                <div className={`mb-2 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-white' : 'text-[#005696]'
                }`}>
                  <span className="material-symbols-outlined text-4xl">{cat.icon}</span>
                </div>
                <span className="font-work font-bold text-xs block truncate">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Weekly Essential Deals */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-hanken font-bold text-xl sm:text-2xl text-[#1b1c1c]">
              Weekly Essential Deals
            </h2>
            <p className="font-work text-xs text-[#727781] mt-0.5">
              Showing {filteredProducts.length} freshest picks
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                const container = document.getElementById('deals-grid');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="p-2 border border-[#c1c7d2] rounded-lg hover:bg-[#efeded] transition-colors"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button 
              onClick={() => {
                const container = document.getElementById('deals-grid');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="p-2 border border-[#c1c7d2] rounded-lg hover:bg-[#efeded] transition-colors"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#c1c7d2] rounded-xl font-work text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
            <p className="font-bold">No groceries matched your filters.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setPartnerFilter(null); }}
              className="mt-3 text-xs text-[#003e6f] font-bold underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div 
            id="deals-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-[#c1c7d2] rounded-xl p-4 product-card-hover flex flex-col relative group shadow-xs"
              >
                {/* Discount Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10 bg-[#7c4800] text-[#ffbc76] px-2 py-0.5 rounded text-[10px] font-work font-bold shadow-xs">
                    {product.badge}
                  </div>
                )}

                {/* Product Image */}
                <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg bg-[#efeded]">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <p className="text-[#727781] text-[10px] font-work font-bold uppercase tracking-wider mb-1">
                  {product.categoryLabel || product.category}
                </p>

                <h3 className="text-[#1b1c1c] font-work font-bold text-sm mb-2 line-clamp-1">
                  {product.name}
                </h3>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#efeded]">
                  <div>
                    <span className="text-[#003e6f] font-hanken font-bold text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[#727781] line-through text-xs ml-2">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => onAddToCart(product)}
                    className="w-10 h-10 bg-[#003e6f] text-white rounded-lg flex items-center justify-center hover:bg-[#005696] transition-all active:scale-90 shadow-xs"
                    title="Add to Cart"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Referral & Weekly Recipes Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Refer a Friend */}
        <div className="bg-[#c8e6ff]/30 p-8 rounded-xl border border-[#4bbdff]/40 flex items-center justify-between shadow-xs">
          <div className="space-y-3 max-w-xs sm:max-w-md">
            <h3 className="font-hanken font-bold text-xl text-[#006590]">
              Invite a Friend
            </h3>
            <p className="font-work text-sm text-[#414750]">
              Get $20 off your next order when you refer a neighbor to Azure Harvest.
            </p>
            <button 
              onClick={handleShareReferral}
              className="bg-[#006590] text-white px-6 py-2.5 rounded-lg font-work font-bold text-xs uppercase tracking-wider hover:bg-[#004c6e] transition-colors shadow-xs active:scale-95"
            >
              {referralCopied ? 'Copied Link!' : 'Share Referral Link'}
            </button>
          </div>

          <div className="hidden lg:block">
            <span className="material-symbols-outlined text-6xl text-[#006590] opacity-30">
              group_add
            </span>
          </div>
        </div>

        {/* Weekly Recipes Newsletter */}
        <div className="bg-[#eae8e7] p-8 rounded-xl border border-[#c1c7d2] flex items-center shadow-xs">
          <div className="w-full space-y-3">
            <h3 className="font-hanken font-bold text-xl text-[#003e6f]">
              Weekly Recipes
            </h3>
            <p className="font-work text-sm text-[#414750]">
              Subscribe to get seasonal meal plans and AI-generated grocery lists.
            </p>
            <form onSubmit={handleRecipeSubscribe} className="flex gap-2">
              <input 
                type="email" 
                value={recipeEmail}
                onChange={(e) => setRecipeEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-2 rounded-lg border border-[#c1c7d2] bg-white text-sm outline-none focus:ring-2 focus:ring-[#003e6f]"
                required
              />
              <button 
                type="submit"
                className="bg-[#003e6f] text-white px-5 py-2 rounded-lg font-work font-bold text-xs uppercase tracking-wider hover:bg-[#005696] transition-colors active:scale-95 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

      </section>

    </div>
  );
}
