import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeScreen from './components/HomeScreen';
import DealsScreen from './components/DealsScreen';
import CartScreen from './components/CartScreen';
import RecipesView from './components/RecipesView';
import HealthView from './components/HealthView';
import SmartCartDrawer from './components/SmartCartDrawer';
import { PRODUCTS, INITIAL_CART } from './data/products';

export default function App() {
  const [activeTab, setActiveTab] = useState('Groceries');
  const [products, setProducts] = useState(PRODUCTS);
  const [cart, setCart] = useState(INITIAL_CART);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Seattle, WA');
  const [toastMessage, setToastMessage] = useState(null);
  const [smartCartOpen, setSmartCartOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { productId: product.id, quantity: 1 }];
      }
    });
    showToast(`Added ${product.name} to your cart!`);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId) => {
    const itemToRemove = PRODUCTS.find((p) => p.id === productId);
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    if (itemToRemove) {
      showToast(`Removed ${itemToRemove.name} from cart`);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Total cart items count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-[#1b1c1c] font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#003e6f] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/20 font-work text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-amber-300 text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8">
        
        {activeTab === 'Groceries' && (
          <HomeScreen
            products={products}
            onAddToCart={handleAddToCart}
            onNavigate={setActiveTab}
            searchQuery={searchQuery}
            onToast={showToast}
          />
        )}

        {activeTab === 'Deals' && (
          <DealsScreen
            products={products}
            onAddToCart={handleAddToCart}
            onOpenSmartCart={() => setSmartCartOpen(true)}
            searchQuery={searchQuery}
            onToast={showToast}
          />
        )}

        {activeTab === 'Recipes' && (
          <RecipesView
            onAddToCart={handleAddToCart}
            onToast={showToast}
          />
        )}

        {activeTab === 'Health' && (
          <HealthView />
        )}

        {activeTab === 'Cart' && (
          <CartScreen
            cart={cart}
            products={products}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            selectedLocation={selectedLocation}
            onChangeLocationClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToast={showToast}
          />
        )}

      </main>

      {/* Floating Action Button for AI Smart Assistant */}
      <button
        onClick={() => setSmartCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#003e6f] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#005696] hover:scale-105 transition-all flex items-center gap-2.5 group active:scale-95 border border-white/20"
        title="Open Azure AI Smart Assistant"
      >
        <span className="material-symbols-outlined text-amber-300 text-2xl group-hover:rotate-12 transition-transform">
          auto_awesome
        </span>
        <span className="font-work font-bold text-xs uppercase tracking-wider hidden sm:inline">
          Ask Azure AI
        </span>
      </button>

      {/* AI Smart Cart Drawer */}
      <SmartCartDrawer
        isOpen={smartCartOpen}
        onClose={() => setSmartCartOpen(false)}
        onAddToCart={handleAddToCart}
        onToast={showToast}
      />

      {/* Global Footer */}
      <Footer onNavigate={setActiveTab} />

    </div>
  );
}
