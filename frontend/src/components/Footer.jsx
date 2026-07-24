import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#eae8e7] border-t border-[#c1c7d2] mt-16 font-work">
      <div className="w-full px-4 md:px-8 py-12 max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Brand & Info */}
        <div className="col-span-2 space-y-4">
          <button 
            onClick={() => onNavigate && onNavigate('Groceries')}
            className="text-xl font-extrabold font-hanken text-[#1b1c1c] hover:text-[#003e6f] transition-colors"
          >
            FreshMarket
          </button>
          <p className="text-sm text-[#414750] pr-4 leading-relaxed">
            Delivering the freshest organic produce and grocery essentials from local farms directly to your doorstep. Committed to sustainability and health.
          </p>
          <div className="flex gap-3 pt-2">
            <a 
              href="#web" 
              onClick={(e) => e.preventDefault()} 
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#003e6f] hover:bg-[#003e6f] hover:text-white transition-all shadow-xs"
              aria-label="Website"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a 
              href="#chat" 
              onClick={(e) => e.preventDefault()} 
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#003e6f] hover:bg-[#003e6f] hover:text-white transition-all shadow-xs"
              aria-label="Chat"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
            </a>
            <a 
              href="#mail" 
              onClick={(e) => e.preventDefault()} 
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#003e6f] hover:bg-[#003e6f] hover:text-white transition-all shadow-xs"
              aria-label="Email"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h5 className="font-work font-bold text-xs uppercase tracking-wider text-[#003e6f] mb-4">
            Company
          </h5>
          <ul className="space-y-2 text-sm text-[#414750]">
            <li><a href="#about" onClick={(e) => e.preventDefault()} className="hover:underline hover:text-[#003e6f] transition-colors">About Us</a></li>
            <li><a href="#sustainability" onClick={(e) => e.preventDefault()} className="hover:underline hover:text-[#003e6f] transition-colors">Sustainability</a></li>
            <li><a href="#stores" onClick={(e) => e.preventDefault()} className="hover:underline hover:text-[#003e6f] transition-colors">Store Locator</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h5 className="font-work font-bold text-xs uppercase tracking-wider text-[#003e6f] mb-4">
            Support
          </h5>
          <ul className="space-y-2 text-sm text-[#414750]">
            <li><a href="#help" onClick={(e) => e.preventDefault()} className="hover:underline hover:text-[#003e6f] transition-colors">Help Center</a></li>
            <li><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline hover:text-[#003e6f] transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline hover:text-[#003e6f] transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Download App */}
        <div className="col-span-2">
          <h5 className="font-work font-bold text-xs uppercase tracking-wider text-[#003e6f] mb-4">
            Download Our App
          </h5>
          <p className="text-sm text-[#414750] mb-4">
            Get the full FreshMarket experience on your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => alert('App Store download link coming soon!')}
              className="flex items-center gap-3 bg-[#1b1c1c] text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-[#003e6f] transition-all group"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">smartphone</span>
              <div className="text-left">
                <p className="text-[10px] leading-tight opacity-70 uppercase tracking-wide">Download on the</p>
                <p className="font-bold text-xs leading-tight">App Store</p>
              </div>
            </button>
            <button 
              onClick={() => alert('Google Play download link coming soon!')}
              className="flex items-center gap-3 bg-[#1b1c1c] text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-[#003e6f] transition-all group"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">play_arrow</span>
              <div className="text-left">
                <p className="text-[10px] leading-tight opacity-70 uppercase tracking-wide">Get it on</p>
                <p className="font-bold text-xs leading-tight">Google Play</p>
              </div>
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 border-t border-[#c1c7d2]/60 flex flex-col md:flex-row justify-between items-center text-xs text-[#414750]">
        <p>© 2024 FreshMarket Essentials. All rights reserved.</p>
        <p className="mt-2 md:mt-0 font-bold text-[#003e6f] flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">verified</span>
          Certified Sustainable Organic Partner
        </p>
      </div>
    </footer>
  );
}
