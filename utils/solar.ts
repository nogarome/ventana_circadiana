// Simplified solar calculation logic adapted for frontend visualization
// This mimics the math we will put into the Arduino sketch

export const degToRad = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const radToDeg = (radians: number) => {
  return radians * (180 / Math.PI);
};

// Returns sun altitude in degrees for a given date/time and location
export const getSunPosition = (date: Date, lat: number, lng: number) => {
  const lw = radToDeg(-lng);
  const phi = radToDeg(lat);
  const d = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);

  const j = 360 * (d - 81) / 365;
  const declination = 23.45 * Math.sin(degToRad(j));
  const equationOfTime = 9.87 * Math.sin(degToRad(2 * j)) - 7.53 * Math.cos(degToRad(j)) - 1.5 * Math.sin(degToRad(j));
  
  const timeOffset = 4 * (lng - (15 * Math.round(lng / 15))) + equationOfTime;
  const tst = date.getHours() * 60 + date.getMinutes() + timeOffset;
  const ha = (tst / 4) - 180;

  const sinAlt = Math.sin(degToRad(lat)) * Math.sin(degToRad(declination)) + 
                 Math.cos(degToRad(lat)) * Math.cos(degToRad(declination)) * Math.cos(degToRad(ha));
  
  return radToDeg(Math.asin(sinAlt));
};

// Converts Kelvin to an approximate RGB hex string for visualization
export const kelvinToRgb = (k: number): string => {
  const temp = k / 100;
  let r, g, b;

  if (temp <= 66) {
    r = 255;
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
    }
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    b = 255;
  }

  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
};

const clamp = (x: number) => Math.min(Math.max(Math.round(x), 0), 255);

// Calculate the mix of Warm/Cold LEDs based on target Kelvin
export const calculatePWM = (targetK: number, brightness: number, minK: number, maxK: number) => {
  // Relax Mode Bias: Keep 25% warm capacity reserved even at max cold settings
  // This prevents the light from becoming too clinical/sterile
  const DAY_WARM_BIAS = 0.25;

  // Linear interpolation between the two LED strips
  // ratio 0 = full warm, 1 = full cold
  let ratio = (targetK - minK) / (maxK - minK);
  
  // Apply the relax bias - cap the cold ratio so it never reaches 1.0 (pure cold)
  // Example: If bias is 0.25, max cold ratio is 0.75, meaning 25% warm is always mixed in
  ratio = Math.min(ratio, 1.0 - DAY_WARM_BIAS);

  // Mix logic: usually constant power or constant voltage approximation
  // Simple linear mix:
  const coldVal = ratio * brightness;
  const warmVal = (1 - ratio) * brightness;

  return {
    warm: Math.round(warmVal),
    cold: Math.round(coldVal)
  };
};

export const formatTime = (hours: number, minutes: number) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};