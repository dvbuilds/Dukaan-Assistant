import React, { useState } from 'react';
import { RECIPES } from '../data/products';

export default function SmartCartDrawer({ isOpen, onClose, onAddToCart, onToast }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Azure Harvest Smart Shopping Assistant. How can I help you optimize your grocery list today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Append user message
    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('recipe') || lower.includes('smoothie') || lower.includes('avocado')) {
        reply = 'Based on your preferences, I recommend our Immunity Green Smoothie or Artisan Avocado Toast! Would you like me to add all ingredients directly to your cart?';
      } else if (lower.includes('organic') || lower.includes('farm')) {
        reply = 'All Azure Harvest produce is 100% certified organic and harvested within 50 miles of Seattle. GreenLeaf Organics and Orchard Harvest are our top partners today!';
      } else if (lower.includes('discount') || lower.includes('deal') || lower.includes('coupon')) {
        reply = 'Use promo code FRESH20 at checkout for 20% off your entire order, or refer a friend for a $20 reward!';
      } else {
        reply = `I've analyzed your pantry needs for "${query}". I recommend adding our Organic Curly Kale, Heritage Carrots, and Farmstead Whole Milk for a balanced weekly haul!`;
      }

      setMessages([...newMsgs, { sender: 'ai', text: reply }]);
      setLoading(false);
    }, 600);
  };

  const handleAddBundle = (recipe) => {
    recipe.ingredients.forEach(ingName => {
      onAddToCart({
        id: Math.floor(Math.random() * 10000) + 100,
        name: ingName,
        categoryLabel: 'ORGANIC RECIPE INGREDIENT',
        category: 'Produce',
        price: 3.49,
        image: recipe.image,
        description: `Fresh organic ${ingName} curated for ${recipe.title}`
      });
    });
    if (onToast) onToast(`Added ${recipe.ingredients.length} ingredients for ${recipe.title}!`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 transition-opacity">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 bg-[#003e6f] text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-300 text-2xl animate-spin-slow">auto_awesome</span>
            <div>
              <h3 className="font-hanken font-bold text-lg leading-tight">Azure AI Assistant</h3>
              <p className="text-[11px] text-[#a1c9ff] font-work">Smart Pantry & Meal Planning</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fbf9f8] custom-scrollbar font-work text-sm">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-[#003e6f] text-white rounded-br-xs'
                  : 'bg-white border border-[#c1c7d2] text-[#1b1c1c] rounded-bl-xs'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-white border rounded-xl text-xs font-bold text-gray-500 animate-pulse">
                Azure AI is analyzing farm stock...
              </div>
            </div>
          )}

          {/* Quick Action Recipe Bundles */}
          <div className="pt-2 border-t border-[#c1c7d2]/40">
            <p className="text-xs font-bold text-[#003e6f] uppercase mb-2">Recommended Meal Bundles:</p>
            <div className="space-y-2">
              {RECIPES.map(recipe => (
                <div key={recipe.id} className="p-3 bg-white border border-[#c1c7d2] rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <img src={recipe.image} alt={recipe.title} className="w-10 h-10 object-cover rounded-lg" />
                    <div>
                      <p className="font-bold text-xs text-[#1b1c1c] line-clamp-1">{recipe.title}</p>
                      <p className="text-[10px] text-gray-500">{recipe.prepTime} • {recipe.calories}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddBundle(recipe)}
                    className="px-2.5 py-1 bg-[#d2e4ff] text-[#001c37] font-bold text-[11px] rounded hover:bg-[#003e6f] hover:text-white transition-all whitespace-nowrap"
                  >
                    + Add All
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#c1c7d2]">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for high-protein recipes or kale deals..."
              className="flex-1 px-4 py-2 border border-[#c1c7d2] rounded-lg text-sm font-work focus:ring-2 focus:ring-[#003e6f] outline-none"
            />
            <button 
              onClick={() => handleSend()}
              className="px-4 py-2 bg-[#003e6f] text-white rounded-lg font-bold hover:bg-[#005696]"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
