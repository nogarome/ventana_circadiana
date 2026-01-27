import React from 'react';

export const WiringDiagram: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto shadow-inner">
      <div className="min-w-[900px] h-[750px] relative mx-auto select-none bg-white rounded-lg shadow-sm">
        <div className="absolute top-0 left-0 bg-slate-800 text-white px-4 py-2 rounded-tl-lg rounded-br-lg text-xs font-bold font-mono tracking-wider z-10">
          ESQUEMA DE CONEXIONADO V4.2 (HC-05 FOCUS)
        </div>
        
        <svg viewBox="0 0 1000 750" className="w-full h-full font-sans">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
            </marker>
            <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L6,3 z" fill="#06b6d4" />
            </marker>
             <marker id="arrow-magenta" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L6,3 z" fill="#d946ef" />
            </marker>
          </defs>

          {/* --- BLOQUE 1: ARDUINO NANO (CENTRAL) --- */}
          <g transform="translate(320, 50)" filter="url(#shadow)">
            <rect width="260" height="600" rx="12" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
            <text x="130" y="40" textAnchor="middle" fill="white" fontWeight="bold" fontSize="22" letterSpacing="1">NANO</text>

            {/* PINES IZQUIERDA (Digital) */}
            <g transform="translate(20, 80)" fontSize="13" fill="white" fontWeight="600">
               {/* D12 - RX (Critical) */}
               <g transform="translate(0, 0)">
                 <text x="30" y="5">D12 (RX)</text> 
                 <circle cx="5" cy="0" r="6" fill="#d946ef" stroke="white" strokeWidth="2" />
               </g>
               
               <g transform="translate(0, 40)"> <text x="30" y="5">D11 (LED)</text> <circle cx="5" cy="0" r="6" fill="#4ade80" /> </g>
               <g transform="translate(0, 80)"> <text x="30" y="5">D10 (PWM F)</text> <circle cx="5" cy="0" r="6" fill="#38bdf8" /> </g>
               <g transform="translate(0, 120)"> <text x="30" y="5">D09 (PWM C)</text> <circle cx="5" cy="0" r="6" fill="#fb923c" /> </g>
               <g transform="translate(0, 160)"> <text x="30" y="5">D08</text> <circle cx="5" cy="0" r="6" fill="#94a3b8" /> </g>
               <g transform="translate(0, 200)"> <text x="30" y="5">D07</text> <circle cx="5" cy="0" r="6" fill="#94a3b8" /> </g>
               <g transform="translate(0, 240)"> <text x="30" y="5">D06</text> <circle cx="5" cy="0" r="6" fill="#94a3b8" /> </g>
               <g transform="translate(0, 280)"> <text x="30" y="5">D05</text> <circle cx="5" cy="0" r="6" fill="#94a3b8" /> </g>
               <g transform="translate(0, 320)"> <text x="30" y="5">D04 (BTN)</text> <circle cx="5" cy="0" r="6" fill="#a8a29e" /> </g>
               <g transform="translate(0, 360)"> <text x="30" y="5">D03 (BTN)</text> <circle cx="5" cy="0" r="6" fill="#a8a29e" /> </g>
               <g transform="translate(0, 400)"> <text x="30" y="5">D02 (BTN)</text> <circle cx="5" cy="0" r="6" fill="#a8a29e" /> </g>
               <g transform="translate(0, 440)"> <text x="30" y="5">GND</text> <circle cx="5" cy="0" r="6" fill="#0f172a" stroke="white" strokeWidth="2" /> </g>
            </g>

            {/* PINES DERECHA (Power/Comm) */}
            <g transform="translate(240, 80)" fontSize="13" fill="white" fontWeight="600" textAnchor="end">
               <g transform="translate(0, 0)"> <text x="-30" y="5">VIN (12V)</text> <circle cx="-5" cy="0" r="6" fill="#ef4444" stroke="white" strokeWidth="2" /> </g>
               <g transform="translate(0, 40)"> <text x="-30" y="5">GND</text> <circle cx="-5" cy="0" r="6" fill="#0f172a" stroke="white" strokeWidth="2" /> </g>
               <g transform="translate(0, 80)"> <text x="-30" y="5">RST</text> <circle cx="-5" cy="0" r="6" fill="#94a3b8" /> </g>
               <g transform="translate(0, 120)"> <text x="-30" y="5">5V (OUT)</text> <circle cx="-5" cy="0" r="6" fill="#ef4444" stroke="white" strokeWidth="2" /> </g>
               
               {/* D13 - TX (Critical) */}
               <g transform="translate(0, 240)"> 
                 <text x="-30" y="5">D13 (TX)</text> 
                 <circle cx="-5" cy="0" r="6" fill="#06b6d4" stroke="white" strokeWidth="2" /> 
               </g>

               <g transform="translate(0, 360)"> <text x="-30" y="5">A4 (SDA)</text> <circle cx="-5" cy="0" r="6" fill="#a78bfa" /> </g>
               <g transform="translate(0, 400)"> <text x="-30" y="5">A5 (SCL)</text> <circle cx="-5" cy="0" r="6" fill="#a78bfa" /> </g>
            </g>
          </g>

          {/* --- BLOQUE 2: BLUETOOTH HC-05 (GRANDE A LA DERECHA) --- */}
          <g transform="translate(650, 200)" filter="url(#shadow)">
             {/* Caja contenedora visual */}
             <rect x="-20" y="-40" width="300" height="250" rx="16" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
             <text x="130" y="-15" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold">CONEXIÓN CRUZADA (CROSSOVER)</text>

             {/* Modulo HC-05 */}
             <rect width="140" height="180" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
             <text x="70" y="30" textAnchor="middle" fill="white" fontWeight="bold" fontSize="16">HC-05 / 06</text>
             <circle cx="70" cy="80" r="40" fill="none" stroke="white" strokeOpacity="0.1" />

             {/* Pines HC-05 */}
             <g transform="translate(0, 130)" fontSize="12" fontWeight="bold" fill="white">
                <g transform="translate(10, 0)">
                    <rect width="25" height="14" fill="#ef4444" rx="2" /> <text x="12.5" y="11" textAnchor="middle">VCC</text>
                </g>
                <g transform="translate(40, 0)">
                    <rect width="25" height="14" fill="#0f172a" rx="2" stroke="white" strokeWidth="1" /> <text x="12.5" y="11" textAnchor="middle">GND</text>
                </g>
                <g transform="translate(70, 0)">
                    <rect width="25" height="14" fill="#d946ef" rx="2" /> <text x="12.5" y="11" textAnchor="middle">TXD</text>
                </g>
                <g transform="translate(100, 0)">
                    <rect width="25" height="14" fill="#06b6d4" rx="2" /> <text x="12.5" y="11" textAnchor="middle">RXD</text>
                </g>
             </g>
          </g>

          {/* --- CABLES DE CONEXIÓN CRÍTICA (HC-05) --- */}
          <g fill="none" strokeWidth="3" strokeLinecap="round">
             {/* 1. VCC (5V) */}
             <path d="M575,200 L620,200 L620,335 L660,335" stroke="#ef4444" strokeDasharray="4,4" opacity="0.6" />
             
             {/* 2. GND */}
             <path d="M575,120 L630,120 L630,335 L690,335" stroke="#0f172a" strokeDasharray="4,4" opacity="0.6" />

             {/* 3. TXD (Modulo) -> D12 (Arduino) :: MAGENTA */}
             <path d="M732,330 L732,360 L600,360 L600,50 L280,50 L280,110 L325,110" stroke="#d946ef" strokeWidth="4" markerEnd="url(#arrow-magenta)" />
             <g transform="translate(450, 40)">
                <rect x="-40" y="-10" width="80" height="20" rx="4" fill="#d946ef" />
                <text x="0" y="5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">CABLE 1</text>
             </g>

             {/* 4. RXD (Modulo) <- D13 (Arduino) :: CIAN */}
             <path d="M575,320 L610,320 L610,380 L762,380 L762,344" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow-cyan)" />
             <g transform="translate(680, 380)">
                <rect x="-40" y="-10" width="80" height="20" rx="4" fill="#06b6d4" />
                <text x="0" y="5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">CABLE 2</text>
             </g>
          </g>

          {/* --- BLOQUE 3: POWER SUPPLY (IZQUIERDA) --- */}
          <g transform="translate(50, 50)" filter="url(#shadow)">
             <rect width="180" height="120" rx="8" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
             <text x="90" y="30" textAnchor="middle" fill="#334155" fontWeight="bold" fontSize="14">FUENTE 12V</text>
             
             <g transform="translate(30, 60)">
                <rect width="40" height="25" fill="#ef4444" rx="4" />
                <text x="20" y="17" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">+12V</text>
             </g>
             <g transform="translate(110, 60)">
                <rect width="40" height="25" fill="#1e293b" rx="4" />
                <text x="20" y="17" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">GND</text>
             </g>
             
             {/* Cables Power */}
             <path d="M50,85 L50,160 L320,160" stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.6" />
             <path d="M130,85 L130,120 L320,120" stroke="#0f172a" strokeWidth="3" fill="none" opacity="0.6" />
          </g>

          {/* --- BLOQUE 4: MOSFETS (ABAJO CENTRO) --- */}
          <g transform="translate(320, 670)">
             {/* WARM */}
             <g transform="translate(0, 0)">
                <rect x="0" y="0" width="100" height="60" rx="4" fill="#f1f5f9" stroke="#94a3b8" />
                <text x="50" y="20" textAnchor="middle" fontSize="10" fill="#64748b">MOSFET WARM</text>
                <text x="50" y="40" textAnchor="middle" fontWeight="bold" fill="#fb923c">PIN D9</text>
                <path d="M50,-10 L50,0" stroke="#fb923c" strokeWidth="2" />
             </g>
             {/* COLD */}
             <g transform="translate(160, 0)">
                <rect x="0" y="0" width="100" height="60" rx="4" fill="#f1f5f9" stroke="#94a3b8" />
                <text x="50" y="20" textAnchor="middle" fontSize="10" fill="#64748b">MOSFET COLD</text>
                <text x="50" y="40" textAnchor="middle" fontWeight="bold" fill="#38bdf8">PIN D10</text>
                <path d="M50,-10 L50,0" stroke="#38bdf8" strokeWidth="2" />
             </g>
             
             {/* Cables PWM desde Nano */}
             <path d="M345,200 L280,200 L280,660 L370,660" stroke="#fb923c" strokeWidth="2" strokeDasharray="4,4" fill="none" />
             <path d="M345,160 L260,160 L260,690 L480,690 L480,660" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" fill="none" />
          </g>

          {/* --- BLOQUE 5: RTC (DERECHA ARRIBA) --- */}
          <g transform="translate(650, 50)" filter="url(#shadow)">
             <rect width="140" height="100" rx="8" fill="#1e3a8a" stroke="#172554" strokeWidth="2" />
             <text x="70" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">RTC DS3231</text>
             <circle cx="110" cy="60" r="20" fill="#cbd5e1" opacity="0.5" />
             <g transform="translate(20, 50)" fontSize="10" fill="white">
                <text x="0" y="10">SDA</text> <path d="M25,5 L-50,5 L-50,365 L-30,365" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.5" />
                <text x="0" y="30">SCL</text> <path d="M25,25 L-60,25 L-60,405 L-30,405" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.5" />
             </g>
          </g>

        </svg>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 max-w-[900px] mx-auto">
        <div className="bg-fuchsia-50 p-3 rounded-lg border border-fuchsia-200 flex items-center gap-3">
            <div className="w-8 h-1 bg-fuchsia-500 rounded-full"></div>
            <span className="text-xs font-bold text-fuchsia-800">CABLE MAGENTA: Módulo TXD → Nano D12</span>
        </div>
        <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 flex items-center gap-3">
            <div className="w-8 h-1 bg-cyan-500 rounded-full"></div>
            <span className="text-xs font-bold text-cyan-800">CABLE CIAN: Módulo RXD ← Nano D13</span>
        </div>
      </div>
    </div>
  );
};
