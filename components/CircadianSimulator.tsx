import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Sun, MapPin, Clock, Thermometer, Sliders, Calendar, Navigation, Info, ArrowLeftRight, Bluetooth, Cpu, Radio, Power, Eye } from 'lucide-react';
import { AppConfig, TimePoint } from '../types';
import { getSunPosition, kelvinToRgb, formatTime } from '../utils/solar';

interface Props {
  config: AppConfig;
  updateConfig: (key: keyof AppConfig, value: any) => void;
}

export const CircadianSimulator: React.FC<Props> = ({ config, updateConfig }) => {
  const [simulationTime, setSimulationTime] = useState<number>(12 * 60); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false); 
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const smoothStep = (min: number, max: number, value: number) => {
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return t * t * (3 - 2 * t);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateConfig('location', { lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        alert("No se pudo obtener la ubicación. Por favor, ingrésala manualmente.");
        setIsLocating(false);
      }
    );
  };

  const getAltitudeLabel = (alt: number) => {
    if (alt < -18) return "Noche profunda";
    if (alt < -12) return "Crepúsculo astronómico";
    if (alt < -6) return "Crepúsculo náutico";
    if (alt < 0) return "Crepúsculo civil (Claridad)";
    if (alt < 10) return "Salida / Puesta de sol";
    if (alt < 30) return "Mañana / Tarde";
    return "Cénit / Pleno día";
  };

  const calculateSolarState = (totalMinutes: number): TimePoint => {
    const date = new Date(config.simulatedDate);
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    date.setHours(hour);
    date.setMinutes(minute);
    
    const sunPos = getSunPosition(date, config.location.lat, config.location.lng);
    
    const isMorning = totalMinutes < 12 * 60;
    const offsetMin = isMorning ? config.sunriseOffset : -config.sunsetOffset;
    const thresholdShift = offsetMin * 0.25; 
    const effectiveBriStart = config.brightnessStartAlt + thresholdShift;
    
    const brightnessProgress = smoothStep(effectiveBriStart, config.brightnessFullAlt, sunPos);
    let brightness = config.maxBrightness * brightnessProgress;
    
    if (brightness < config.nightBrightness) {
        brightness = config.nightBrightness;
    }

    const kelvinProgress = smoothStep(config.kelvinStartAlt, config.kelvinFullAlt, sunPos);
    const kelvin = config.minKelvin + (config.maxKelvin - config.minKelvin) * kelvinProgress;

    let mixRatio = (kelvin - config.minKelvin) / (config.maxKelvin - config.minKelvin);
    if (config.maxKelvin === config.minKelvin) mixRatio = 0;
    
    mixRatio = Math.min(mixRatio, 1.0 - config.minWarmBias);

    const coldVal = mixRatio * brightness;
    const warmVal = (1 - mixRatio) * brightness;

    return {
      hour,
      minute,
      kelvin: Math.round(kelvin),
      brightness: Math.round(brightness),
      warm: Math.round(warmVal),
      cold: Math.round(coldVal),
      sunAltitude: sunPos
    };
  };

  const chartData = useMemo(() => {
    const data: TimePoint[] = [];
    for (let i = 0; i < 24 * 60; i += 15) { 
      data.push(calculateSolarState(i));
    }
    return data;
  }, [config]);

  const currentPoint = useMemo(() => calculateSolarState(simulationTime), [simulationTime, config]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !isRealTime) {
      interval = setInterval(() => {
        setSimulationTime(prev => (prev + 10) % 1440);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRealTime]);

  useEffect(() => {
    let interval: any;
    const syncTime = () => {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        setSimulationTime(minutes);
    };
    if (isRealTime) {
        syncTime();
        interval = setInterval(syncTime, 10000);
        setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isRealTime]);

  const windowStyle = {
    backgroundColor: kelvinToRgb(currentPoint.kelvin),
    opacity: Math.max(currentPoint.brightness / 100, 0.1),
    boxShadow: `0 0 ${currentPoint.brightness}px ${kelvinToRgb(currentPoint.kelvin)}`,
    transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const kelvinGradient = "linear-gradient(to right, #ff8a00, #ffc000, #fff4e5, #d6eaff, #a3d2ff)";

  const BTBadge = () => (
    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-200 ml-2" title="Modificable por Bluetooth sin reprogramar">
      <Bluetooth size={10} /> BT
    </span>
  );

  const ChipBadge = () => (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-200 ml-2" title="Requiere subir código nuevo al Arduino">
      <Cpu size={10} /> CORE
    </span>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={20} /> Ubicación y Estación
            </h2>
            <button 
              onClick={handleGetLocation}
              disabled={isLocating}
              className="flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <Navigation size={14} className={isLocating ? 'animate-pulse' : ''} />
              {isLocating ? 'Detectando...' : 'Mi ubicación'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="flex items-center text-[10px] font-bold text-slate-400 mb-1 uppercase">
                 Latitud <BTBadge />
              </label>
              <input 
                type="number" step="0.0001"
                value={config.location.lat}
                onChange={(e) => updateConfig('location', { ...config.location, lat: parseFloat(e.target.value) })}
                className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="flex items-center text-[10px] font-bold text-slate-400 mb-1 uppercase">
                 Longitud <BTBadge />
              </label>
              <input 
                type="number" step="0.0001"
                value={config.location.lng}
                onChange={(e) => updateConfig('location', { ...config.location, lng: parseFloat(e.target.value) })}
                className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm font-mono text-slate-900"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="flex items-center text-[10px] font-bold text-slate-400 mb-1 uppercase gap-1">
                <Calendar size={10} /> Fecha Simulación
              </label>
              <input 
                type="date"
                value={config.simulatedDate}
                onChange={(e) => updateConfig('simulatedDate', e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Thermometer size={16} className="text-indigo-500" /> Rango de Temperatura (CCT)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 uppercase flex items-center">
                        Mínimo (Cálido) <BTBadge />
                    </span>
                    <span className="text-xs font-mono text-slate-400">{config.minKelvin}K</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute inset-0 rounded-full opacity-30" style={{ background: kelvinGradient }} />
                    <input 
                      type="range" min="1000" max="4000" step="100"
                      value={config.minKelvin}
                      onChange={(e) => updateConfig('minKelvin', parseInt(e.target.value))}
                      className="w-full relative z-10 accent-orange-600 h-1.5 bg-transparent appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 uppercase flex items-center">
                        Máximo (Frío) <BTBadge />
                    </span>
                    <span className="text-xs font-mono text-slate-400">{config.maxKelvin}K</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute inset-0 rounded-full opacity-30" style={{ background: kelvinGradient }} />
                    <input 
                      type="range" min="4000" max="10000" step="100"
                      value={config.maxKelvin}
                      onChange={(e) => updateConfig('maxKelvin', parseInt(e.target.value))}
                      className="w-full relative z-10 accent-blue-600 h-1.5 bg-transparent appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
               <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-600 flex items-center">
                        Brillo Máx <BTBadge />
                    </span>
                    <span className="text-sm text-slate-400">{config.maxBrightness}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={config.maxBrightness}
                    onChange={(e) => updateConfig('maxBrightness', parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
               </div>
               <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-600 flex items-center">
                        Luz Noche <BTBadge />
                    </span>
                    <span className="text-sm text-slate-400">{config.nightBrightness}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" 
                    value={config.nightBrightness}
                    onChange={(e) => updateConfig('nightBrightness', parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors w-full"
              >
                <Sliders size={16} />
                Personalizar Horarios y Umbrales
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 ml-auto">
                  {showAdvanced ? 'Ocultar' : 'Configuración Avanzada'}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-6 border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Explicación de Offsets */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                         <Clock size={14} className="text-indigo-500" /> Ajustes Temporales (Offsets)
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                                Amanecer <BTBadge />
                            </label>
                            <span className="text-[10px] font-mono font-bold text-indigo-600">
                              {config.sunriseOffset > 0 ? `+${config.sunriseOffset}` : config.sunriseOffset} min
                            </span>
                          </div>
                          <input 
                            type="range" min="-120" max="120" step="15"
                            value={config.sunriseOffset}
                            onChange={(e) => updateConfig('sunriseOffset', parseInt(e.target.value))}
                            className="w-full accent-indigo-500 h-1.5"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                                Atardecer <BTBadge />
                            </label>
                            <span className="text-[10px] font-mono font-bold text-orange-600">
                              {config.sunsetOffset > 0 ? `+${config.sunsetOffset}` : config.sunsetOffset} min
                            </span>
                          </div>
                          <input 
                            type="range" min="-120" max="120" step="15"
                            value={config.sunsetOffset}
                            onChange={(e) => updateConfig('sunsetOffset', parseInt(e.target.value))}
                            className="w-full accent-orange-500 h-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Umbrales de BRILLO */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                         <Sun size={14} className="text-amber-500" /> Umbrales de BRILLO
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                              Inicio (Trigger) <BTBadge />
                          </label>
                          <input 
                            type="number" step="1"
                            value={config.brightnessStartAlt}
                            onChange={(e) => updateConfig('brightnessStartAlt', parseFloat(e.target.value))}
                            className="w-full p-2 text-xs border border-slate-300 rounded font-mono bg-white text-slate-900"
                          />
                          <p className="text-[9px] text-slate-400 italic">{getAltitudeLabel(config.brightnessStartAlt)}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase text-amber-600 flex items-center">
                              Pleno Día (Max) <BTBadge />
                          </label>
                          <input 
                            type="number" step="1"
                            value={config.brightnessFullAlt}
                            onChange={(e) => updateConfig('brightnessFullAlt', parseFloat(e.target.value))}
                            className="w-full p-2 text-xs border border-slate-300 rounded font-mono bg-white text-slate-900"
                          />
                          <p className="text-[9px] text-slate-400 italic">{getAltitudeLabel(config.brightnessFullAlt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Umbrales de COLOR (NUEVO) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                         <Thermometer size={14} className="text-blue-500" /> Umbrales de COLOR (Kelvin)
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                              Inicio Enfriado <BTBadge />
                          </label>
                          <input 
                            type="number" step="1"
                            value={config.kelvinStartAlt}
                            onChange={(e) => updateConfig('kelvinStartAlt', parseFloat(e.target.value))}
                            className="w-full p-2 text-xs border border-slate-300 rounded font-mono bg-white text-slate-900"
                          />
                          <p className="text-[9px] text-slate-400 italic">Sol bajo ({config.kelvinStartAlt}°)</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase text-blue-600 flex items-center">
                              Máximo Frío <BTBadge />
                          </label>
                          <input 
                            type="number" step="1"
                            value={config.kelvinFullAlt}
                            onChange={(e) => updateConfig('kelvinFullAlt', parseFloat(e.target.value))}
                            className="w-full p-2 text-xs border border-slate-300 rounded font-mono bg-white text-slate-900"
                          />
                          <p className="text-[9px] text-slate-400 italic">Sol alto ({config.kelvinFullAlt}°)</p>
                        </div>
                      </div>
                    </div>

                    {/* Warm Bias Control (NUEVO) */}
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Eye size={12} /> Warm Bias (Confort) <BTBadge />
                            </label>
                            <span className="text-[10px] font-mono font-bold text-slate-600">
                              {(config.minWarmBias * 100).toFixed(0)}%
                            </span>
                       </div>
                       <input 
                            type="range" min="0" max="0.5" step="0.05"
                            value={config.minWarmBias}
                            onChange={(e) => updateConfig('minWarmBias', parseFloat(e.target.value))}
                            className="w-full accent-slate-500 h-1.5"
                       />
                       <p className="text-[9px] text-slate-500 leading-tight">
                            Porcentaje de LED cálido que <strong>nunca se apaga</strong>, incluso a mediodía. Evita que la luz se vea demasiado "clínica" o estéril.
                       </p>
                    </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visualizador de Ventana */}
        <div className="bg-slate-900 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[250px]">
          
          {isRealTime && (
            <div className="absolute top-4 right-4 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red]"></div>
                <span className="text-[10px] font-bold text-red-400 tracking-wider">LIVE MONITOR</span>
            </div>
          )}

          <div className="absolute top-4 left-4 text-white/50 text-[10px] font-mono z-10 space-y-1">
             <div className="flex items-center gap-2"><Clock size={10} /> {formatTime(currentPoint.hour, currentPoint.minute)}</div>
             <div>{currentPoint.kelvin}K | {currentPoint.brightness}%</div>
             <div className="flex gap-2">
                <span className="text-amber-400">W: {currentPoint.warm}</span> 
                <span className="text-blue-400">C: {currentPoint.cold}</span>
             </div>
             <div className="text-slate-500 italic">Sol: {currentPoint.sunAltitude.toFixed(1)}°</div>
          </div>

          <div 
            className="w-32 h-44 rounded-t-full border-4 border-slate-800 relative z-20"
            style={windowStyle}
          >
             <div className="absolute inset-0 border-b-4 border-slate-800 top-1/2 -mt-0.5 opacity-20"></div>
             <div className="absolute inset-0 border-r-4 border-slate-800 left-1/2 -ml-0.5 opacity-20"></div>
          </div>
          
          <div 
            className="absolute inset-0 blur-3xl opacity-20 transition-all duration-500"
            style={{ backgroundColor: kelvinToRgb(currentPoint.kelvin) }}
          />
        </div>
        
         <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-4">
             {/* CONTROLES DE REPRODUCCION */}
             <div className="flex items-center gap-3">
                 <button 
                    onClick={() => {
                        setIsRealTime(false);
                        setIsPlaying(!isPlaying);
                    }}
                    disabled={isRealTime}
                    className={`p-2 px-4 rounded-lg text-xs font-bold transition-all shadow-sm flex-1 ${
                        isPlaying 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    } ${isRealTime ? 'opacity-30 cursor-not-allowed' : ''}`}
                 >
                    {isPlaying ? 'PAUSAR' : 'SIMULAR 24H'}
                 </button>

                 <button 
                    onClick={() => setIsRealTime(!isRealTime)}
                    className={`p-2 px-4 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 flex-1 ${
                        isRealTime
                        ? 'bg-red-600 text-white shadow-red-200 ring-2 ring-red-100' 
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                 >
                    <Radio size={14} className={isRealTime ? "animate-pulse" : ""} />
                    {isRealTime ? 'EN VIVO (SINC)' : 'MODO MONITOR'}
                 </button>
             </div>
             
             <div className="flex items-center gap-4">
                 <input 
                    type="range" 
                    min="0" max="1439" 
                    value={simulationTime}
                    disabled={isRealTime}
                    onChange={(e) => {
                        setSimulationTime(parseInt(e.target.value));
                        setIsPlaying(false);
                    }}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isRealTime ? 'bg-slate-100 accent-slate-300' : 'bg-slate-100 accent-indigo-600'}`}
                 />
                 <div className="text-xs font-mono text-slate-500 w-12 text-right">
                    {formatTime(currentPoint.hour, currentPoint.minute)}
                 </div>
             </div>
             
             {isRealTime && (
                <div className="text-[10px] text-center text-slate-400 bg-slate-50 p-1 rounded">
                    Mostrando estado calculado para tu hora local ({new Date().toLocaleTimeString()}). Coincide con el Arduino.
                </div>
             )}
         </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden">
          <h3 className="font-bold text-slate-700 mb-6 text-sm flex justify-between">
            <span>Curva Dinámica Circadiana</span>
            <span className="text-xs text-slate-400 font-normal">Resolución 15m</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="warmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="coldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                    dataKey="hour" 
                    tickFormatter={(h) => `${h}h`} 
                    interval={3}
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#cbd5e1" domain={[0, 100]} hide />
                <Tooltip 
                    labelFormatter={(val) => {
                        const pt = chartData.find(p => p.hour === val);
                        return pt ? formatTime(pt.hour, pt.minute) : val;
                    }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
                
                <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="warm" 
                    stackId="1"
                    stroke="#d97706" 
                    strokeWidth={1.5}
                    fill="url(#warmGrad)" 
                    name="Cálido (W)"
                />
                <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cold" 
                    stackId="1"
                    stroke="#2563eb"
                    strokeWidth={1.5} 
                    fill="url(#coldGrad)" 
                    name="Frío (C)"
                />

                <ReferenceLine yAxisId="left" x={currentPoint.hour + (currentPoint.minute/60)} stroke={isRealTime ? "#ef4444" : "#94a3b8"} strokeWidth={2} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 p-6 rounded-xl border border-indigo-800 text-indigo-100">
           <h4 className="font-bold mb-2 flex items-center gap-2 text-sm">
            <Radio size={16} className="text-red-400" /> Sobre el Monitor en Vivo
           </h4>
           <p className="text-xs leading-relaxed opacity-80">
             Los navegadores web no pueden conectarse a Bluetooth clásico (HC-05). Sin embargo, como esta web y tu Arduino comparten el mismo código matemático, el <strong>Modo Monitor</strong> te muestra exactamente lo que el Arduino está haciendo ahora mismo, sin necesidad de conectarse.
           </p>
        </div>
      </div>
    </div>
  );
};