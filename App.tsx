import React, { useState, useEffect } from 'react';
import { Settings, Code, Zap, Copy, Check, BookOpen } from 'lucide-react';
import { AppConfig, TabView } from './types';
import { CircadianSimulator } from './components/CircadianSimulator';
import { WiringDiagram } from './components/WiringDiagram';
import { ArduinoDocs } from './components/ArduinoDocs';
import { generateArduinoSketch } from './utils/arduinoGenerator';

const STORAGE_KEY = 'circadian_config_v1';

const DEFAULT_CONFIG: AppConfig = {
  location: { lat: 40.4168, lng: -3.7038 }, // Madrid default
  maxBrightness: 100,
  nightBrightness: 5,
  minKelvin: 3000,
  maxKelvin: 6000,
  sunriseOffset: 0,
  sunsetOffset: 0,
  simulatedDate: new Date().toISOString().split('T')[0],
  minWarmBias: 0.25,
  brightnessStartAlt: -6,
  brightnessFullAlt: 45,
  kelvinStartAlt: -4, 
  kelvinFullAlt: 20
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>(TabView.SIMULATOR);
  const [copied, setCopied] = useState(false);
  
  // Initialize from localStorage or defaults with safety merge
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge for location to ensure lat/lng exist
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          location: {
            ...DEFAULT_CONFIG.location,
            ...(parsed.location || {})
          }
        };
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    return DEFAULT_CONFIG;
  });

  // Persist config on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyCode = () => {
    const code = generateArduinoSketch(config);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
               <Zap size={24} />
            </div>
            <div>
               <h1 className="text-xl font-bold text-slate-900 leading-none">Ventana Circadiana</h1>
               <span className="text-xs text-slate-500">Diseñador y Generador de Firmware</span>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {[
              { id: TabView.SIMULATOR, label: 'Simulador', icon: Settings },
              { id: TabView.WIRING, label: 'Hardware', icon: Zap },
              { id: TabView.CODE, label: 'Arduino', icon: Code },
              { id: TabView.DOCUMENTATION, label: 'Guía', icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === TabView.SIMULATOR && (
          <CircadianSimulator config={config} updateConfig={updateConfig} />
        )}

        {activeTab === TabView.WIRING && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold mb-4">Esquema de Conexiones</h2>
              <WiringDiagram />
            </div>
          </div>
        )}

        {activeTab === TabView.CODE && (
          <div className="h-[calc(100vh-12rem)] flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-xl">
             <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
               <h3 className="text-slate-100 font-mono text-sm">arduino_firmware.ino</h3>
               <button 
                 onClick={handleCopyCode}
                 className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-colors"
               >
                 {copied ? <Check size={14} /> : <Copy size={14} />}
                 {copied ? '¡CÓDIGO COPIADO!' : 'COPIAR CÓDIGO'}
               </button>
             </div>
             <div className="flex-1 overflow-auto p-6">
               <pre className="font-mono text-xs md:text-sm text-green-400 leading-relaxed">
                 {generateArduinoSketch(config)}
               </pre>
             </div>
          </div>
        )}

        {activeTab === TabView.DOCUMENTATION && <ArduinoDocs />}
      </main>
    </div>
  );
};

export default App;