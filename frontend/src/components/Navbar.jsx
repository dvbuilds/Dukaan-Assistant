import React, { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab, cartCount, searchQuery, setSearchQuery, selectedLocation, setSelectedLocation }) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [tempZip, setTempZip] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (tempZip.trim()) {
      setSelectedLocation(`Postal Code: ${tempZip.trim()}`);
    }
    setShowLocationModal(false);
  };

  return (
    <header className="bg-[#fbf9f8] border-b border-[#c1c7d2] sticky top-0 z-50 shadow-sm transition-all duration-200">
      <nav className="flex justify-between items-center w-full px-4 md:px-8 py-3 max-w-[1280px] mx-auto min-h-[72px]">
        
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-[#003e6f] p-1 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('Groceries'); setSearchQuery(''); }}
            className="flex items-center gap-2 text-left group"
          >
            <span className="material-symbols-outlined text-[#003e6f] text-3xl group-hover:scale-105 transition-transform">
              local_mall
            </span>
            <span className="text-2xl font-extrabold font-hanken text-[#003e6f] tracking-tight">
              FreshMarket
            </span>
          </button>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-8 font-work font-bold text-sm tracking-wider">
          <button
            onClick={() => { setActiveTab('Groceries'); setSearchQuery(''); }}
            className={`pb-1 transition-colors duration-200 ${
              activeTab === 'Groceries'
                ? 'text-[#003e6f] border-b-2 border-[#003e6f] opacity-100'
                : 'text-[#414750] hover:text-[#003e6f] opacity-80'
            }`}
          >
            Groceries
          </button>

          <button
            onClick={() => { setActiveTab('Deals'); setSearchQuery(''); }}
            className={`pb-1 transition-colors duration-200 ${
              activeTab === 'Deals'
                ? 'text-[#003e6f] border-b-2 border-[#003e6f] opacity-100'
                : 'text-[#414750] hover:text-[#003e6f] opacity-80'
            }`}
          >
            Deals
          </button>

          <button
            onClick={() => setActiveTab('Recipes')}
            className={`pb-1 transition-colors duration-200 ${
              activeTab === 'Recipes'
                ? 'text-[#003e6f] border-b-2 border-[#003e6f] opacity-100'
                : 'text-[#414750] hover:text-[#003e6f] opacity-80'
            }`}
          >
            Recipes
          </button>

          <button
            onClick={() => setActiveTab('Health')}
            className={`pb-1 transition-colors duration-200 ${
              activeTab === 'Health'
                ? 'text-[#003e6f] border-b-2 border-[#003e6f] opacity-100'
                : 'text-[#414750] hover:text-[#003e6f] opacity-80'
            }`}
          >
            Health
          </button>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-md mx-6 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#003e6f]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for groceries..."
            className="w-full pl-10 pr-4 py-2 bg-[#efeded] border border-[#c1c7d2] rounded-full focus:outline-none focus:ring-2 focus:ring-[#003e6f] text-sm text-[#1b1c1c] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Actions: Location, Account, Cart */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Location button */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1 text-[#414750] hover:text-[#003e6f] transition-colors p-1"
            title="Change Location"
          >
            <span className="material-symbols-outlined text-xl">location_on</span>
            <span className="hidden xl:inline text-xs font-bold font-work max-w-[100px] truncate">
              {selectedLocation}
            </span>
          </button>

          {/* Account Button */}
          <button
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-1 text-[#414750] hover:text-[#003e6f] transition-colors p-1"
          >
            <span className="material-symbols-outlined text-2xl">account_circle</span>
            <span className="hidden xl:inline text-xs font-bold font-work">
              {userLoggedIn ? 'My Profile' : 'Account'}
            </span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setActiveTab('Cart')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-work font-bold text-sm transition-all duration-200 shadow-sm active:scale-95 ${
              activeTab === 'Cart'
                ? 'bg-[#005696] text-white ring-2 ring-[#003e6f]'
                : 'bg-[#003e6f] text-white hover:bg-[#005696]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-[#001c37] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fbf9f8] border-b border-[#c1c7d2] px-6 py-4 space-y-3">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#003e6f]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-10 pr-4 py-2 bg-[#efeded] border border-[#c1c7d2] rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center font-work font-bold text-sm">
            <button
              onClick={() => { setActiveTab('Groceries'); setMobileMenuOpen(false); }}
              className={`p-2 rounded ${activeTab === 'Groceries' ? 'bg-[#003e6f] text-white' : 'bg-[#f5f3f3] text-[#414750]'}`}
            >
              Groceries
            </button>
            <button
              onClick={() => { setActiveTab('Deals'); setMobileMenuOpen(false); }}
              className={`p-2 rounded ${activeTab === 'Deals' ? 'bg-[#003e6f] text-white' : 'bg-[#f5f3f3] text-[#414750]'}`}
            >
              Deals
            </button>
            <button
              onClick={() => { setActiveTab('Recipes'); setMobileMenuOpen(false); }}
              className={`p-2 rounded ${activeTab === 'Recipes' ? 'bg-[#003e6f] text-white' : 'bg-[#f5f3f3] text-[#414750]'}`}
            >
              Recipes
            </button>
            <button
              onClick={() => { setActiveTab('Health'); setMobileMenuOpen(false); }}
              className={`p-2 rounded ${activeTab === 'Health' ? 'bg-[#003e6f] text-white' : 'bg-[#f5f3f3] text-[#414750]'}`}
            >
              Health
            </button>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#c1c7d2] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-hanken font-bold text-xl text-[#003e6f] flex items-center gap-2">
                <span className="material-symbols-outlined">location_on</span>
                Select Delivery Location
              </h3>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-[#414750] mb-4 font-work">
              Enter your zip code or city to check local farm availability and delivery times.
            </p>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ZIP / Postal Code or City</label>
                <input
                  type="text"
                  value={tempZip}
                  onChange={(e) => setTempZip(e.target.value)}
                  placeholder="e.g. Seattle, WA or 98101"
                  className="w-full px-4 py-2 border border-[#c1c7d2] rounded-lg focus:ring-2 focus:ring-[#003e6f] outline-none text-sm"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedLocation('Seattle, WA'); setShowLocationModal(false); }}
                  className="flex-1 py-2 px-3 border border-[#003e6f] text-[#003e6f] rounded-lg font-bold text-xs hover:bg-[#d2e4ff]"
                >
                  Use Seattle, WA
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[#003e6f] text-white rounded-lg font-bold text-xs hover:bg-[#005696]"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-[#c1c7d2]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-hanken font-bold text-xl text-[#003e6f]">
                {userLoggedIn ? 'Welcome Back!' : 'FreshMarket Account'}
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-black">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {userLoggedIn ? (
              <div className="space-y-4 font-work text-sm">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#003e6f] text-white flex items-center justify-center font-bold">
                    AH
                  </div>
                  <div>
                    <p className="font-bold text-[#003e6f]">Azure Harvest Member</p>
                    <p className="text-xs text-gray-500">dasdivya589@gmail.com</p>
                  </div>
                </div>
                <div className="text-xs space-y-2 text-[#414750]">
                  <p className="flex justify-between"><span>Fresh Club Status:</span> <span className="font-bold text-emerald-600">Active (-20%)</span></p>
                  <p className="flex justify-between"><span>Default Address:</span> <span className="font-bold">123 Azure Heights</span></p>
                </div>
                <button
                  onClick={() => { setUserLoggedIn(false); setShowAccountModal(false); }}
                  className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold text-xs hover:bg-red-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4 font-work">
                <p className="text-xs text-gray-600">
                  Sign in to access your saved grocery lists, subscription discounts, and 20% off your first order.
                </p>
                <input
                  type="email"
                  defaultValue="dasdivya589@gmail.com"
                  className="w-full px-3 py-2 border border-[#c1c7d2] rounded-lg text-sm"
                  placeholder="Email Address"
                />
                <button
                  onClick={() => { setUserLoggedIn(true); setShowAccountModal(false); }}
                  className="w-full py-2.5 bg-[#003e6f] text-white rounded-lg font-bold text-xs hover:bg-[#005696]"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
