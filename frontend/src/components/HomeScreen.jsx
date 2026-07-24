import React, { useState } from 'react';

export default function HomeScreen({ products, onAddToCart, onNavigate, searchQuery, onToast }) {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  // Filter flash deals based on search query if present
  const flashDeals = products.filter(p => {
    if (!searchQuery) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.category.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 4);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribedEmail) {
      setSubscribeSuccess(true);
      if (onToast) onToast(`Welcome to Fresh Club! Discount code FRESH20 sent to ${subscribedEmail}`);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-[#fbf9f8] overflow-hidden border-b border-[#c1c7d2]/40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 lg:py-16 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Text Column */}
          <div className="w-full lg:w-1/2 z-10 space-y-6">
            <span className="inline-block px-3.5 py-1 bg-[#c8e6ff] text-[#001e2f] font-work font-bold text-xs rounded-full tracking-wide">
              EST. 2024
            </span>

            <h1 className="font-hanken font-bold text-3xl sm:text-4xl lg:text-5xl text-[#003e6f] leading-tight">
              Grown with Care, <br className="hidden sm:inline" />
              Delivered with Speed.
            </h1>

            <p className="font-work text-base text-[#414750] max-w-lg leading-relaxed">
              Experience the peak of freshness with Azure Harvest. We source directly from sustainable local farms to bring premium produce to your doorstep within hours.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => {
                  const element = document.getElementById('flash-deals');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-11 px-7 bg-[#003e6f] text-white font-work font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:bg-[#005696] hover:-translate-y-0.5 transition-all duration-200"
              >
                SHOP FRESH PRODUCE
              </button>

              <button 
                onClick={() => onNavigate('Deals')}
                className="h-11 px-7 border-2 border-[#003e6f] text-[#003e6f] font-work font-bold text-xs tracking-wider uppercase rounded-lg hover:bg-[#d2e4ff] transition-all duration-200"
              >
                VIEW WEEKLY DEALS
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 flex items-center gap-8 border-t border-[#c1c7d2]/60">
              <div className="flex flex-col">
                <span className="font-hanken font-extrabold text-2xl text-[#003e6f]">45min</span>
                <span className="font-work font-bold text-[11px] text-[#414750] uppercase tracking-wider">AVG. DELIVERY</span>
              </div>
              <div className="w-px h-10 bg-[#c1c7d2]"></div>
              <div className="flex flex-col">
                <span className="font-hanken font-extrabold text-2xl text-[#003e6f]">100+</span>
                <span className="font-work font-bold text-[11px] text-[#414750] uppercase tracking-wider">LOCAL FARMS</span>
              </div>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="w-full lg:w-1/2 relative">
            <div className="aspect-square sm:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5YC4uXDRzTa_A7bstjpJNQ5-E_guq5BzFDORPCCMCTDoME7cRuNAjl9QSTIV-daDxgEri1e3xI9oBbwwuw3-27h4-b21ELerjQ75-UkzpHqJAPHSOzBFSWoCuODZHQWqDB9u_PKX3T1iOvO6TicY8HXNHDQBoOaeiR4EnnpDPKv_7OXw0Jea69jokEN6F81Fjwf0q5hkH6NUMTr3nsyDtuI1tv4NU6s84K5XXzysS1vJRbA5bFjuIdCmxCj6yTWpwSX8vKpmCuCDI"
                alt="Fresh farm produce crate"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Organic Badge Floating Overlay */}
            <div className="absolute -bottom-6 -left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-lg border border-[#c1c7d2]/80 hidden sm:block">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#5b3400] text-3xl">
                  verified
                </span>
                <div>
                  <p className="font-work font-bold text-sm text-[#003e6f]">Certified Organic</p>
                  <p className="font-work text-xs text-[#414750]">Sourced with integrity</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Value Propositions Bento Section */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c1c7d2] hover:border-[#003e6f] transition-all duration-300 group shadow-xs">
            <span className="material-symbols-outlined text-[#003e6f] text-4xl mb-4 group-hover:scale-110 transition-transform">
              qr_code_2
            </span>
            <h3 className="font-hanken font-bold text-xl text-[#003e6f] mb-2">
              Hyper-Fast Delivery
            </h3>
            <p className="font-work text-sm text-[#414750] leading-relaxed">
              Our logistics network ensures your groceries arrive within an hour of your order, maintaining the cold chain perfectly.
            </p>
          </div>

          <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c1c7d2] hover:border-[#003e6f] transition-all duration-300 group shadow-xs">
            <span className="material-symbols-outlined text-[#003e6f] text-4xl mb-4 group-hover:scale-110 transition-transform">
              agriculture
            </span>
            <h3 className="font-hanken font-bold text-xl text-[#003e6f] mb-2">
              Direct From Farm
            </h3>
            <p className="font-work text-sm text-[#414750] leading-relaxed">
              By cutting out the middlemen, we provide better prices for you and better margins for our local farming partners.
            </p>
          </div>

          <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c1c7d2] hover:border-[#003e6f] transition-all duration-300 group shadow-xs">
            <span className="material-symbols-outlined text-[#003e6f] text-4xl mb-4 group-hover:scale-110 transition-transform">
              eco
            </span>
            <h3 className="font-hanken font-bold text-xl text-[#003e6f] mb-2">
              Zero Plastic Waste
            </h3>
            <p className="font-work text-sm text-[#414750] leading-relaxed">
              We lead with sustainability. Your orders are delivered in 100% compostable or reusable Azure Harvest bags.
            </p>
          </div>

        </div>
      </section>

      {/* Flash Deals Section */}
      <section id="flash-deals" className="py-8 bg-[#fbf9f8]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="flex justify-between items-end mb-8 border-b border-[#c1c7d2]/40 pb-4">
            <div>
              <h2 className="font-hanken font-bold text-2xl sm:text-3xl text-[#1b1c1c]">
                Flash Deals
              </h2>
              <p className="font-work text-sm text-[#414750] mt-1">
                Limited time offers on our freshest items.
              </p>
            </div>

            <button 
              onClick={() => onNavigate('Deals')}
              className="text-[#003e6f] font-work font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:underline group"
            >
              SEE ALL DEALS 
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {flashDeals.map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-[#c1c7d2] rounded-lg overflow-hidden flex flex-col product-card-hover relative group shadow-xs"
              >
                {/* Discount Badge */}
                {product.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10 bg-[#7c4800] text-[#ffbc76] px-2.5 py-1 text-[11px] font-work font-bold rounded shadow-xs">
                    {product.badge}
                  </div>
                )}

                {/* Image Container */}
                <div className="aspect-square bg-[#efeded] overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <span className="font-work font-bold text-[10px] text-[#727781] uppercase tracking-wider mb-1">
                    {product.categoryLabel || product.category}
                  </span>
                  
                  <h4 className="font-hanken font-bold text-sm sm:text-base text-[#1b1c1c] mb-2 line-clamp-1">
                    {product.name}
                  </h4>

                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#efeded]">
                    <div>
                      <span className="font-hanken font-bold text-lg text-[#003e6f]">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="font-work text-xs text-[#727781] line-through ml-2">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {product.unit && !product.originalPrice && (
                        <span className="font-work text-xs text-[#727781] ml-1">
                          {product.unit}
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => onAddToCart(product)}
                      className="w-9 h-9 rounded-full border border-[#003e6f] text-[#003e6f] flex items-center justify-center hover:bg-[#003e6f] hover:text-white transition-all active:scale-90 shadow-xs"
                      title="Add to Cart"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-[#005696] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#003e6f] opacity-30 -skew-x-12 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-[#fbf9f8] p-8 lg:p-12 rounded-2xl flex flex-col lg:flex-row items-center gap-10 shadow-xl border border-[#c1c7d2]/40">
            
            <div className="w-full lg:w-1/2 space-y-4">
              <h2 className="font-hanken font-bold text-3xl text-[#003e6f]">
                Join the Fresh Club
              </h2>
              <p className="font-work text-base text-[#414750] leading-relaxed">
                Get weekly recipes, exclusive discounts, and 20% off your first order when you subscribe to our newsletter.
              </p>

              {subscribeSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-work font-bold flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  Thank you for joining! Code FRESH20 applied to your account.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input 
                    type="email" 
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-grow h-12 px-5 rounded-lg border border-[#c1c7d2] focus:ring-2 focus:ring-[#003e6f] outline-none font-work text-sm text-[#1b1c1c] bg-white"
                    required
                  />
                  <button 
                    type="submit"
                    className="h-12 px-8 bg-[#003e6f] text-white font-work font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#005696] transition-all shadow-md active:scale-95 whitespace-nowrap"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              )}

              <p className="font-work font-bold text-[11px] text-[#727781] pt-1">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>

            {/* Side Inspiration Images */}
            <div className="hidden lg:block lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-[#efeded] rounded-lg overflow-hidden border border-[#c1c7d2]">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGk89j15RDl12iuFLWji7ybc-HMEAMl-QSOtyTJ4CF8XwinUU04Okuanth0bT0sMm52QoyS9Szh1_MnfBmVzhtV8yhkfotFhQQjoVtWSEjgHXxCc_W0og9LkHsG5wQa4OTiliTNyqdK4rxunEo1CXvKIGDkfIjZmhgFeFbyd9TCz84UT3-B0BAZwWujkjBEj1ggeEghlUxL95Ts7w3NWpf16yQ3_M4-kp2-imI91sTyTRmotVj5wChnMyUo4FZBQylr-AlP-lvYswg"
                    alt="Green smoothie ingredients"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="aspect-video bg-[#efeded] rounded-lg overflow-hidden border border-[#c1c7d2]">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1430-Ry73zy3ucajt0hlHSOqTzq1k9-WI-Ljd7BfWopB21UKpohO0iGa8-lBRUVvLTlNrAKSLldrfVrZbydzN-ccVlWhjHmXsgC9_yv_3kg0ZCBR3YL0025HX0n6IXTRi4rPCgdE3FiZ7Qf3nPjzy7DTpWn3psP02AaESNkRk3GgGfyysdtpuVLxL64LgqADkGMTElz-Vwv9qrvCoMKseal8U15vGwEeN80j2unYZxaTP_CwPD9GYKwJllYs-B7BKqmt41jihcU_z"
                    alt="Artisanal sourdough breads"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
