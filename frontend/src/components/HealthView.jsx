import React from 'react';

export default function HealthView() {
  return (
    <div className="space-y-10 max-w-[1280px] mx-auto font-work">
      <div className="border-b border-[#c1c7d2]/60 pb-4">
        <span className="text-xs font-bold text-[#006590] uppercase tracking-wider">
          ORGANIC STANDARDS & QUALITY
        </span>
        <h1 className="text-3xl sm:text-4xl font-hanken font-bold text-[#1b1c1c] mt-1">
          Health & Freshness Commitment
        </h1>
        <p className="text-sm text-[#414750] mt-1">
          How Azure Harvest guarantees non-GMO produce, 0% pesticides, and 45-minute farm delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#c1c7d2] rounded-2xl shadow-xs space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#003e6f]">verified</span>
          <h3 className="font-hanken font-bold text-lg text-[#003e6f]">USDA Organic Certified</h3>
          <p className="text-xs text-[#414750] leading-relaxed">
            Every fruit, vegetable, and dairy product listed is grown without synthetic fertilizers or chemical pesticides.
          </p>
        </div>

        <div className="p-6 bg-white border border-[#c1c7d2] rounded-2xl shadow-xs space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#003e6f]">thermostat</span>
          <h3 className="font-hanken font-bold text-lg text-[#003e6f]">Unbroken Cold Chain</h3>
          <p className="text-xs text-[#414750] leading-relaxed">
            Temperature-controlled delivery vehicles keep produce crisp at 38°F from farm gate to your front door.
          </p>
        </div>

        <div className="p-6 bg-white border border-[#c1c7d2] rounded-2xl shadow-xs space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#003e6f]">distance</span>
          <h3 className="font-hanken font-bold text-lg text-[#003e6f]">Zero Food Miles Wasted</h3>
          <p className="text-xs text-[#414750] leading-relaxed">
            Our hyperlocal fulfillment routing reduces CO2 emissions by 80% compared to traditional grocery store supply chains.
          </p>
        </div>
      </div>

      <div className="bg-[#f5f3f3] border border-[#c1c7d2] rounded-2xl p-8 space-y-4">
        <h2 className="font-hanken font-bold text-2xl text-[#003e6f]">Nutritional Transparency</h2>
        <p className="text-sm text-[#414750] leading-relaxed max-w-3xl">
          At Azure Harvest, every product page provides full ingredient traceability including the exact farm name, harvest date, and soil certification profile. Filter your weekly grocery cart by allergy, vegan, keto, or low-sodium requirements using our AI Smart Cart Assistant.
        </p>
      </div>
    </div>
  );
}
