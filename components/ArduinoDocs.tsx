import React, { useState, useEffect } from "react";
import {
  Book,
  Bluetooth,
  Smartphone,
  Terminal,
  Settings,
  PlayCircle,
  Moon,
  Sun,
  Save,
  RefreshCw,
  ToggleLeft,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  SearchX,
  HelpCircle,
  Command,
  Clock,
  Copy,
} from "lucide-react";
console.log("Despliegue automático funcionando");

export const ArduinoDocs: React.FC = () => {
  const [currentTimeCmd, setCurrentTimeCmd] = useState("");
  const [copiedTime, setCopiedTime] = useState(false);

  useEffect(() => {
    const updateTimeCmd = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      setCurrentTimeCmd(`SETTIME:${yyyy}${mm}${dd}${hh}${min}`);
    };

    updateTimeCmd();
    const interval = setInterval(updateTimeCmd, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleCopyTime = () => {
    navigator.clipboard.writeText(currentTimeCmd);
    setCopiedTime(true);
    setTimeout(() => setCopiedTime(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Introducción */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
          <Smartphone className="text-indigo-600" size={32} />
          Guía Maestra: Control por App
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Para controlar tu Ventana Circadiana necesitas una app de "Terminal
          Serial". Recomendamos encarecidamente{" "}
          <strong>"Serial Bluetooth Terminal"</strong> (Android) por ser la más
          estable y configurable.
        </p>
      </section>

      {/* HERRAMIENTA RÁPIDA DE HORA */}
      <section className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-md">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-1">
              ¿Hora incorrecta en el Arduino?
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              Si el monitor serie muestra una fecha extraña (ej: 2026), copia
              este comando y envíalo por Bluetooth para sincronizar el reloj.
            </p>

            <div className="flex items-center gap-2 max-w-md">
              <div className="flex-1 bg-white border border-amber-300 rounded px-3 py-2 font-mono text-sm text-slate-700">
                {currentTimeCmd}
              </div>
              <button
                onClick={handleCopyTime}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-bold text-xs flex items-center gap-2 transition-colors"
              >
                {copiedTime ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copiedTime ? "COPIADO" : "COPIAR"}
              </button>
            </div>
            <p className="text-[10px] text-amber-600 mt-2 italic">
              *Formato: SETTIME:AAAAMMDDHHMM
            </p>
          </div>
        </div>
      </section>

      {/* CHEATSHEET DE COMANDOS */}
      <section className="bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Terminal size={120} />
        </div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <Command className="text-green-400" />
          Lista de Comandos (Copiar y Pegar)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {/* Columna 1: Uso Diario */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-2">
              Control Diario
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded hover:bg-slate-700 transition-colors">
                <code className="font-mono text-green-400 font-bold">
                  STATUS
                </code>
                <span className="text-xs text-slate-400">
                  Ver configuración actual
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded hover:bg-slate-700 transition-colors">
                <code className="font-mono text-green-400 font-bold">D</code>
                <span className="text-xs text-slate-400">
                  Activar/Desactivar Demo
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded hover:bg-slate-700 transition-colors">
                <code className="font-mono text-green-400 font-bold">N</code>
                <span className="text-xs text-slate-400">
                  Modo Noche (Forzar apagado)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded hover:bg-slate-700 transition-colors">
                <code className="font-mono text-green-400 font-bold">SAVE</code>
                <span className="text-xs text-yellow-400">
                  ¡Guardar cambios en memoria!
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded hover:bg-slate-700 transition-colors">
                <code className="font-mono text-green-400 font-bold">
                  RESET
                </code>
                <span className="text-xs text-red-400">Reiniciar Arduino</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Configuración Técnica */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-2">
              Configuración Avanzada
            </h4>
            <div className="bg-slate-800/50 p-4 rounded text-xs text-slate-400 italic mb-2 border border-slate-700">
              Sustituye <strong>X</strong> por el valor numérico.
              <br />
              Ejemplo: <span className="font-mono text-white">LAT:40.5</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-cyan-400">LAT:X</span>
                <span className="text-slate-500">Latitud (ej: 40.4)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-cyan-400">LNG:X</span>
                <span className="text-slate-500">Longitud (ej: -3.7)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-cyan-400">MAXBRI:X</span>
                <span className="text-slate-500">Brillo Máx (0-100)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-cyan-400">NIGHTBRI:X</span>
                <span className="text-slate-500">Brillo Noche (0-20)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-cyan-400">MINK:X</span>
                <span className="text-slate-500">Kelvin Mín (ej: 2700)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-cyan-400">MAXK:X</span>
                <span className="text-slate-500">Kelvin Máx (ej: 6500)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-orange-400">SUNRISE:X</span>
                <span className="text-slate-500">Offset Amanecer (mins)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-orange-400">SUNSET:X</span>
                <span className="text-slate-500">Offset Atardecer (mins)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-1">
                <span className="text-yellow-400">SETTIME:...</span>
                <span className="text-slate-500">SETTIME:202401011200</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE TROUBLESHOOTING (SOLUCIÓN DE PROBLEMAS - SIN BOTÓN) */}
      <section className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-md">
        <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <SearchX className="text-red-600" />
          Caso Especial: Módulo SIN Botón e Invisible
        </h3>

        <div className="bg-white p-5 rounded-xl border border-red-100 mb-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="text-indigo-500 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-slate-800 text-lg">
                ¿Tu módulo no tiene botón?
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Entonces tienes un <strong>HC-06</strong> o un clon moderno
                (JDY-31). Estos módulos NO entran en "modo configuración".
                Siempre están listos para emparejar.
                <br />
                <br />
                Si el LED parpadea (lento o rápido) significa que tiene
                corriente y funciona.{" "}
                <strong>
                  Si tu móvil no lo ve, el problema es de Android, no del
                  módulo.
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SOLUCIÓN 1: LA TRAMPA DEL GPS */}
          <div className="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700 rounded-bl">
              SOLUCIÓN #1
            </div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-indigo-600" size={24} />
              <span className="font-bold text-slate-900">
                Activa el GPS / Ubicación
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              <strong>¡CRÍTICO!</strong> Desde Android 10, Google{" "}
              <strong>bloquea</strong> la búsqueda de dispositivos Bluetooth
              nuevos si la Ubicación (GPS) está desactivada.
            </p>
            <ul className="text-xs space-y-2 bg-indigo-50 p-3 rounded text-indigo-900">
              <li>1. Baja la barra de notificaciones.</li>
              <li>
                2. Enciende el icono de <strong>Ubicación/GPS</strong>.
              </li>
              <li>3. Vuelve a Ajustes {">"} Bluetooth y busca de nuevo.</li>
            </ul>
          </div>

          {/* SOLUCIÓN 2: BÚSQUEDA MANUAL */}
          <div className="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 rounded-bl">
              SOLUCIÓN #2
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Bluetooth className="text-amber-600" size={24} />
              <span className="font-bold text-slate-900">
                Busca por nombre raro
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Los módulos sin botón (clones JDY) a veces no se llaman
              "HC-05/06". Busca nombres genéricos:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold text-slate-500">
              <span className="bg-slate-100 p-1 rounded text-center border">
                JDY-30 / 31
              </span>
              <span className="bg-slate-100 p-1 rounded text-center border">
                BT04-A
              </span>
              <span className="bg-slate-100 p-1 rounded text-center border">
                SPP-C
              </span>
              <span className="bg-slate-100 p-1 rounded text-center border">
                HC-06
              </span>
            </div>
            <p className="mt-3 text-[10px] text-amber-700 italic">
              *Prueba a reiniciar el teléfono si acabas de activar el GPS.
            </p>
          </div>
        </div>
      </section>

      {/* PASO 1: EMPAREJAMIENTO */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
            1
          </span>
          Emparejamiento Inicial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p className="mb-2">
              <strong>Si es HC-06 / Clones (Sin botón):</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Asegúrate de tener el <strong>GPS Activado</strong>.
              </li>
              <li>
                Ve a <strong>Ajustes {">"} Bluetooth</strong> en Android.
              </li>
              <li>Busca nuevos dispositivos.</li>
              <li>
                Introduce el PIN: suele ser <strong>1234</strong> (más común en
                HC-06) o <strong>0000</strong>.
              </li>
            </ol>
          </div>
          <div>
            <p className="mb-2">
              <strong>Nota sobre el LED:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
              <li>Parpadeo: Esperando conexión.</li>
              <li>Fijo (Sin parpadear): Conectado.</li>
              <li className="text-red-500 font-bold mt-1">
                Si no parpadea nunca, revisa los cables VCC y GND.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PASO 2: CONFIGURACIÓN CRÍTICA */}
      <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 ring-2 ring-indigo-500/20">
        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
            2
          </span>
          Configuración de la App (CRÍTICO)
        </h3>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 space-y-4">
            <p className="text-sm text-indigo-800">
              El Arduino espera un carácter de "Fin de Línea" para saber que el
              comando ha terminado.{" "}
              <strong>
                Si no configuras esto, el Arduino ignorará todo lo que escribas.
              </strong>
            </p>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                <Settings size={18} className="text-gray-500" />
                <span className="text-sm font-bold text-gray-700">
                  1. Abre el Menú {">"} Settings
                </span>
              </div>
              <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                <Terminal size={18} className="text-gray-500" />
                <span className="text-sm font-bold text-gray-700">
                  2. Ve a la sección "Send"
                </span>
              </div>
              <div className="flex items-center gap-3 bg-indigo-100 p-2 rounded-lg">
                <Hash size={18} className="text-indigo-600" />
                <div>
                  <span className="text-sm font-bold text-indigo-700 block">
                    3. Opción "Newline"
                  </span>
                  <span className="text-xs text-indigo-600">
                    Cambialo a{" "}
                    <strong className="bg-indigo-600 text-white px-1 rounded">
                      CR+LF
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Aid */}
          <div className="w-full md:w-64 bg-slate-900 rounded-xl p-4 text-green-400 font-mono text-xs shadow-xl border border-slate-700">
            <div className="border-b border-slate-700 pb-2 mb-2 text-center text-slate-400">
              Terminal Output
            </div>
            <div className="opacity-50">Connecting to HC-06...</div>
            <div className="opacity-50">Connected</div>
            <div>LUMINIA READY.</div>
            <div className="text-white mt-2 flex">
              <span>{">"} STATUS</span>
              <span className="animate-pulse">_</span>
            </div>
            <div className="mt-4 bg-red-900/50 text-red-200 p-2 rounded text-[10px] text-center border border-red-700">
              Sin CR+LF, esto no funciona.
            </div>
          </div>
        </div>
      </section>

      {/* PASO 3: PROGRAMAR BOTONES */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
            3
          </span>
          Crear tu Mando a Distancia (Macros)
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          En lugar de escribir comandos, puedes programar los botones que
          aparecen encima del teclado (M1, M2...) dejando pulsado sobre ellos.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Botón Noche */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center text-center group hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Moon size={20} />
            </div>
            <div className="text-xs font-bold text-slate-700">Botón 1</div>
            <div className="mt-2 w-full text-[10px] text-left space-y-1 bg-white p-2 rounded border border-slate-100">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <strong>Noche</strong>
              </div>
              <div>
                <span className="text-slate-400">Value:</span>{" "}
                <strong className="font-mono text-indigo-600">n</strong>
              </div>
            </div>
          </div>

          {/* Botón Demo */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center text-center group hover:border-pink-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <PlayCircle size={20} />
            </div>
            <div className="text-xs font-bold text-slate-700">Botón 2</div>
            <div className="mt-2 w-full text-[10px] text-left space-y-1 bg-white p-2 rounded border border-slate-100">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <strong>Demo</strong>
              </div>
              <div>
                <span className="text-slate-400">Value:</span>{" "}
                <strong className="font-mono text-pink-600">d</strong>
              </div>
            </div>
          </div>

          {/* Botón Brillo */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center text-center group hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sun size={20} />
            </div>
            <div className="text-xs font-bold text-slate-700">Botón 3</div>
            <div className="mt-2 w-full text-[10px] text-left space-y-1 bg-white p-2 rounded border border-slate-100">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <strong>Brillo</strong>
              </div>
              <div>
                <span className="text-slate-400">Value:</span>{" "}
                <strong className="font-mono text-amber-600">b</strong>
              </div>
            </div>
          </div>

          {/* Botón Status */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center text-center group hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <RefreshCw size={20} />
            </div>
            <div className="text-xs font-bold text-slate-700">Botón 4</div>
            <div className="mt-2 w-full text-[10px] text-left space-y-1 bg-white p-2 rounded border border-slate-100">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <strong>Estado</strong>
              </div>
              <div>
                <span className="text-slate-400">Value:</span>{" "}
                <strong className="font-mono text-blue-600">STATUS</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
