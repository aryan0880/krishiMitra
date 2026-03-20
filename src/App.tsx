/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  LayoutGrid, 
  ClipboardList, 
  User, 
  ArrowRight, 
  Droplets, 
  Wind, 
  CloudSun,
  Leaf,
  Info,
  Bell,
  Languages,
  Menu,
  Sparkles,
  Sprout,
  CircleUser
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Screen = 'landing' | 'input' | 'dashboard';
type Language = 'English' | 'Hindi' | 'Marathi';
type CropStage = 'Seedling' | 'Vegetative' | 'Flowering' | 'Harvest';

// --- Components ---

const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: Screen) => void }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, screen: 'landing' as Screen },
    { id: 'input', label: 'Input', icon: LayoutGrid, screen: 'input' as Screen },
    { id: 'analysis', label: 'Analysis', icon: ClipboardList, screen: 'dashboard' as Screen },
    { id: 'profile', label: 'Profile', icon: User, screen: 'landing' as Screen },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 bg-[#f9f8f2] z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.screen)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive ? 'bg-[#1f4d2b] text-white' : 'text-gray-400'
              }`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const LandingPage = ({ onNext }: { onNext: () => void }) => {
  const [selectedLang, setSelectedLang] = useState<Language>('English');

  const languages: { name: Language, label: string, sub: string }[] = [
    { name: 'English', label: 'English', sub: 'Primary Global Language' },
    { name: 'Hindi', label: 'Hindi', sub: 'हिंदी - आधिकारिक भाषा' },
    { name: 'Marathi', label: 'Marathi', sub: 'मराठी - प्रादेशिक भाषा' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-[#1f4d2b]" />
          <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
        </div>
        <Languages size={18} className="text-gray-400" />
      </div>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80" 
          alt="Farmer in Modern Field" 
          className="w-full h-[320px] object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f8f2] via-[#f9f8f2]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 bg-gradient-to-t from-[#f9f8f2] to-transparent">
          <h2 className="text-3xl font-bold leading-tight text-[#1f4d2b] drop-shadow-sm">
            Smart Farming<br />Decisions, Simplified
          </h2>
          <p className="text-sm text-gray-800 font-semibold leading-relaxed">
            Empowering farmers with AI-driven insights for better yields and healthier soil.
          </p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1 bg-[#e6f4ea] rounded-full text-[#1f4d2b]">
            <Languages size={14} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Choose Your Language</h3>
        </div>
        <div className="flex flex-col gap-2">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setSelectedLang(lang.name)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedLang === lang.name 
                ? 'bg-white border-[#1f4d2b] shadow-sm' 
                : 'bg-white/50 border-transparent text-gray-700'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">{lang.label}</span>
                <span className="text-[10px] text-gray-400">{lang.sub}</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedLang === lang.name ? 'border-[#1f4d2b]' : 'border-gray-200'
              }`}>
                {selectedLang === lang.name && <div className="w-2 h-2 rounded-full bg-[#1f4d2b]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Eco-Smart Card */}
      <div className="bg-[#e6f4ea] p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#1f4d2b]">
            <Leaf size={18} fill="currentColor" />
            <h3 className="font-bold text-sm">Eco-Smart</h3>
          </div>
          <p className="text-[10px] text-gray-600 font-medium">
            AI insights optimized for sustainable land management.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 bg-[#d1e7d8] p-3 rounded-xl flex flex-col items-center justify-center gap-1">
            <span className="text-sm font-bold text-[#1f4d2b]">98%</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Accuracy</span>
          </div>
          <div className="flex-1 bg-[#d1e7d8] p-3 rounded-xl flex flex-col items-center justify-center gap-1">
            <Droplets size={14} className="text-[#1f4d2b]" />
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Irrigation</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-center gap-1 opacity-40">
        <Sprout size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">KrishiMitra</span>
      </div>

      {/* CTA Button */}
      <button 
        onClick={onNext}
        className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20"
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );
};

const InputFormPage = ({ onNext }: { onNext: () => void }) => {
  const [moisture, setMoisture] = useState(45);
  const [nutrients, setNutrients] = useState({ n: 0, p: 0, k: 0 });
  const [stage, setStage] = useState<CropStage>('Vegetative');

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-[#1f4d2b]" />
          <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={18} className="text-gray-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full border-2 border-[#f9f8f2]" />
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
            A
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field Analysis</span>
        <h2 className="text-2xl font-bold text-gray-900">Field Status Update</h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Enter current soil and crop metrics to receive your AI-powered optimization strategy.
        </p>
      </div>

      {/* Soil Moisture Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e6f4ea] rounded-xl text-[#1f4d2b]">
            <Droplets size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">Soil Moisture (%)</span>
            <span className="text-[10px] text-gray-400 font-medium">Current volumetric water content</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-[#f5f5f0] px-6 py-3 rounded-xl flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-800">{moisture}</span>
            <span className="text-xl font-bold text-gray-400">%</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={moisture}
            onChange={(e) => setMoisture(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1f4d2b]"
          />
          <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Dry</span>
            <span className="text-[#1f4d2b]">Optimal</span>
            <span>Saturated</span>
          </div>
        </div>
      </div>

      {/* Nutrients Section */}
      <div className="flex flex-col gap-3">
        {[
          { id: 'n', label: 'Nitrogen (N)', value: nutrients.n },
          { id: 'p', label: 'Phosphorus (P)', value: nutrients.p },
          { id: 'k', label: 'Potassium (K)', value: nutrients.k },
        ].map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Sprout size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </div>
            <input 
              type="number" 
              value={item.value}
              onChange={(e) => setNutrients({...nutrients, [item.id as keyof typeof nutrients]: parseInt(e.target.value) || 0})}
              className="text-3xl font-bold text-gray-800 bg-transparent focus:outline-none text-center w-full"
            />
          </div>
        ))}
      </div>

      {/* Crop Stage */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1f4d2b] rounded-lg text-white">
            <Sprout size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">Crop Stage</span>
            <span className="text-[10px] text-gray-400 font-medium">Select the current growth phase</span>
          </div>
        </div>
        <select 
          value={stage}
          onChange={(e) => setStage(e.target.value as CropStage)}
          className="w-full bg-[#f5f5f0] p-4 rounded-xl text-sm font-bold text-gray-700 focus:outline-none appearance-none"
        >
          <option value="Seedling">Seedling</option>
          <option value="Vegetative">Vegetative</option>
          <option value="Flowering">Flowering</option>
          <option value="Harvest">Harvest</option>
        </select>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col gap-3 mt-2">
        <button 
          onClick={onNext}
          className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20"
        >
          Get Recommendation <Sparkles size={18} />
        </button>
        <p className="text-[10px] text-center text-gray-400 font-medium">
          Calculated using real-time satellite & sensor data
        </p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-gray-800" />
          <h1 className="text-lg font-bold text-[#1f4d2b]">KrishiMitra</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs border-2 border-white shadow-sm">
          A
        </div>
      </div>

      {/* Weather Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Weather</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-800">28°</span>
              <span className="text-xl font-bold text-gray-400">C</span>
            </div>
            <span className="text-xs font-bold text-gray-500">Sunny forecast</span>
          </div>
          <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center text-[#1f4d2b]">
            <CloudSun size={32} />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
            <Droplets size={18} className="text-blue-400" />
            <span className="text-sm font-bold text-gray-800">65%</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Humidity</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
            <Wind size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-800">12 km/h</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Wind Speed</span>
          </div>
        </div>
      </div>

      {/* Today's Protocol */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Today's Protocol</span>
        <div className="bg-[#1f4d2b] p-6 rounded-3xl shadow-lg flex flex-col gap-6">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-sm">Smart Recommendations</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/10 rounded-full">
                <Droplets size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Action Required</span>
                <span className="text-sm font-bold">Irrigate today</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/10 rounded-full">
                <Sprout size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Fertilization</span>
                <span className="text-sm font-bold">Apply 20kg Nitrogen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Rationale */}
      <div className="bg-[#f5f5f0] p-6 rounded-3xl flex flex-col gap-4 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-800">
          <Info size={18} />
          <h3 className="font-bold text-sm">Analysis Rationale</h3>
        </div>
        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          Soil moisture is <span className="text-orange-600 font-bold">low</span> and temperature is <span className="text-orange-600 font-bold">high</span>, which increases water loss through evapotranspiration.<br /><br />
          Nitrogen levels are currently <span className="text-orange-600 font-bold">below the optimal threshold</span> for the vegetative stage, risking stunted growth if not addressed within 24 hours.
        </p>
        <button className="w-full bg-white py-3 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-2 shadow-sm border border-gray-100">
          View Detailed Soil Report <ArrowRight size={14} />
        </button>
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-4 px-1 pb-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-gray-800">Maize Growth Stage</span>
          <span className="text-xs font-bold text-gray-800">V6 Stage</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#1f4d2b] rounded-full" style={{ width: '65%' }} />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Sowing</span>
          <span>Vegetative</span>
          <span>Flowering</span>
          <span>Harvest</span>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNext={() => setCurrentScreen('input')} />;
      case 'input':
        return <InputFormPage onNext={() => setCurrentScreen('dashboard')} />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <LandingPage onNext={() => setCurrentScreen('input')} />;
    }
  };

  const getActiveTab = () => {
    if (currentScreen === 'landing') return 'home';
    if (currentScreen === 'input') return 'input';
    if (currentScreen === 'dashboard') return 'analysis';
    return 'home';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex justify-center font-sans selection:bg-[#1f4d2b] selection:text-white">
      <div className="w-full max-w-md bg-[#f9f8f2] min-h-screen relative overflow-x-hidden shadow-2xl">
        <main className="px-5 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav 
          activeTab={getActiveTab()} 
          onTabChange={(screen) => setCurrentScreen(screen)} 
        />
      </div>
    </div>
  );
}
