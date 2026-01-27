
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface AppConfig {
  location: GeoLocation;
  maxBrightness: number; // 0-255
  nightBrightness: number; // 0-255
  minKelvin: number;
  maxKelvin: number;
  sunriseOffset: number; // minutes
  sunsetOffset: number; // minutes
  simulatedDate: string; // ISO Date string for seasonal curves
  
  // Advanced Curve Settings
  minWarmBias: number; // 0.0 - 1.0 (Percentage of warm LED kept at max cold)
  brightnessStartAlt: number; // Sun altitude (degrees) where brightness starts
  brightnessFullAlt: number; // Sun altitude (degrees) where brightness peaks
  kelvinStartAlt: number; // Sun altitude (degrees) where temperature starts cooling
  kelvinFullAlt: number; // Sun altitude (degrees) where temperature is coldest
}

export interface TimePoint {
  hour: number;
  minute: number;
  kelvin: number;
  brightness: number;
  warm: number;
  cold: number;
  sunAltitude: number;
  label?: string;
}

export enum TabView {
  SIMULATOR = 'SIMULATOR',
  WIRING = 'WIRING',
  CODE = 'CODE',
  DOCUMENTATION = 'DOCUMENTATION',
}
