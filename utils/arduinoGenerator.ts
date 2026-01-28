import { AppConfig } from "../types";

export const generateArduinoSketch = (config: AppConfig): string => {
  const {
    location,
    nightBrightness,
    minKelvin,
    maxKelvin,
    maxBrightness,
    brightnessStartAlt,
    brightnessFullAlt,
    minWarmBias,
    kelvinStartAlt,
    kelvinFullAlt,
  } = config;

  // Calculamos valores iniciales por defecto
  const defLat = location.lat;
  const defLon = location.lng;

  return String.raw`/*
  CONTROLADOR DE VENTANA CIRCADIANA (Luminia V4.5 - Advanced Color Control)
  -----------------------------------------------
  Control total desde el móvil incluyendo curvas de color.
  
  NUEVOS COMANDOS COLOR (V4.5):
  KSTART:X   -> Altitud solar donde empieza a enfriarse (Ej: -4.0)
  KFULL:X    -> Altitud solar donde alcanza el blanco máximo (Ej: 20.0)
  WARMBIAS:X -> % de LED cálido que SIEMPRE se queda encendido (0.0 - 1.0)
  
  COMANDOS BASICOS:
  STATUS, SAVE, RESET, SETTIME:YYYYMMDDHHMM
  LAT:X, LNG:X, MINK:X, MAXK:X
*/

#include <Wire.h>
#include <RTClib.h>
#include <SoftwareSerial.h>
#include <EEPROM.h>

// --- HARDWARE PINOUT ---
#define PIN_WARM 9
#define PIN_COLD 10
#define BTN_DEMO 2
#define BTN_BRI  3
#define BTN_NGT  4
#define LED_NGT  5
#define LED_DEMO 6
#define LED_RED  7
#define LED_YEL  8
#define LED_GRN  11
#define BT_RX 12
#define BT_TX 13

// --- ESTRUCTURA DE DATOS ---
struct Config {
  byte magic;           
  float lat;
  float lon;
  int minK;
  int maxK;
  byte maxBri;          
  byte nightBri;        
  float briStartAlt;    
  float briFullAlt;     
  int sunriseOffset;    
  int sunsetOffset;
  float kStartAlt;      // Nuevo V4.5
  float kFullAlt;       // Nuevo V4.5
  float warmBias;       // Nuevo V4.5 (0.0 - 1.0)
};

Config conf;
const byte MAGIC_NUMBER = 0x45; // Version bump para forzar recarga defaults

RTC_DS3231 rtc;
SoftwareSerial bt(BT_RX, BT_TX);

// Estado volátil
int currentLevelIdx = 0; 
bool isNightMode = false;
bool isDemoMode = false;
unsigned long lastDemoUpdate = 0;
int demoMinutes = 0;

void(* resetFunc) (void) = 0;

void loadConfig() {
  EEPROM.get(0, conf);
  if (conf.magic != MAGIC_NUMBER) {
    Serial.println("EEPROM vacia o antigua. Cargando defaults...");
    conf.magic = MAGIC_NUMBER;
    conf.lat = \${defLat};
    conf.lon = \${defLon};
    conf.minK = \${minKelvin};
    conf.maxK = \${maxKelvin};
    conf.maxBri = \${maxBrightness};
    conf.nightBri = \${nightBrightness};
    conf.briStartAlt = \${brightnessStartAlt};
    conf.briFullAlt = \${brightnessFullAlt};
    conf.sunriseOffset = \${config.sunriseOffset};
    conf.sunsetOffset = \${config.sunsetOffset};
    // Nuevos defaults V4.5
    conf.kStartAlt = \${kelvinStartAlt};
    conf.kFullAlt = \${kelvinFullAlt};
    conf.warmBias = \${minWarmBias};
    
    EEPROM.put(0, conf); 
  }
}

void printStatus() {
  DateTime now = rtc.now();
  bt.println(F("--- ESTADO LUMINIA V4.5 ---"));
  bt.print(F("HORA: ")); 
  bt.print(now.year()); bt.print('/'); bt.print(now.month()); bt.print('/'); bt.print(now.day());
  bt.print(' '); bt.print(now.hour()); bt.print(':'); bt.println(now.minute());
  
  bt.print(F("LAT/LON: ")); bt.print(conf.lat); bt.print("/"); bt.println(conf.lon);
  bt.print(F("K Range: ")); bt.print(conf.minK); bt.print("-"); bt.println(conf.maxK);
  bt.print(F("Bri Curve (Start/Full): ")); bt.print(conf.briStartAlt); bt.print("/"); bt.println(conf.briFullAlt);
  bt.print(F("Color Curve (Start/Full): ")); bt.print(conf.kStartAlt); bt.print("/"); bt.println(conf.kFullAlt);
  bt.print(F("Warm Bias: ")); bt.println(conf.warmBias);
  
  if (isNightMode) bt.println(F("[MODO NOCHE ACTIVO]"));
  if (isDemoMode) bt.println(F("[MODO DEMO ACTIVO]"));
  bt.println(F("----------------------"));
}

void processCommand(String cmd) {
  cmd.trim();
  cmd.toUpperCase();
  
  // --- COMANDOS DE CONTROL (ATAJOS) ---
  if (cmd == "D" || cmd == "DEMO") {
    isDemoMode = !isDemoMode;
    bt.println(isDemoMode ? "DEMO: ON" : "DEMO: OFF");
  }
  else if (cmd == "N" || cmd == "NOCHE") {
    isNightMode = !isNightMode;
    bt.println(isNightMode ? "NOCHE: ON" : "NOCHE: OFF");
  }
  else if (cmd == "+" || cmd == "MAX") {
     currentLevelIdx = 0;
     bt.println("BRILLO: 100%");
  }
  else if (cmd == "-" || cmd == "MIN") {
     currentLevelIdx = 2;
     bt.println("BRILLO: 50%");
  }
  else if (cmd == "B" || cmd == "BRILLO") {
     currentLevelIdx = (currentLevelIdx + 1) % 3;
     bt.print("NIVEL: "); bt.println(currentLevelIdx);
  }

  // --- COMANDOS TECNICOS ---
  else if (cmd == "STATUS") {
    printStatus();
  } 
  else if (cmd == "SAVE") {
    EEPROM.put(0, conf);
    bt.println("CONFIG GUARDADA!");
  }
  else if (cmd == "RESET") {
    bt.println("REINICIANDO...");
    delay(100);
    resetFunc();
  }
  else if (cmd.startsWith("SETTIME:")) {
      String t = cmd.substring(8);
      if (t.length() >= 12) {
          int y = t.substring(0, 4).toInt();
          int m = t.substring(4, 6).toInt();
          int d = t.substring(6, 8).toInt();
          int h = t.substring(8, 10).toInt();
          int mn = t.substring(10, 12).toInt();
          
          rtc.adjust(DateTime(y, m, d, h, mn, 0));
          bt.println("HORA OK");
      }
  }
  // --- PARAMETROS DE CONFIGURACION ---
  else if (cmd.startsWith("LAT:")) { conf.lat = cmd.substring(4).toFloat(); bt.println("OK"); }
  else if (cmd.startsWith("LNG:")) { conf.lon = cmd.substring(4).toFloat(); bt.println("OK"); }
  else if (cmd.startsWith("MAXBRI:")) { conf.maxBri = cmd.substring(7).toInt(); bt.println("OK"); }
  else if (cmd.startsWith("NIGHTBRI:")) { conf.nightBri = cmd.substring(9).toInt(); bt.println("OK"); }
  else if (cmd.startsWith("MINK:")) { conf.minK = cmd.substring(5).toInt(); bt.println("OK"); }
  else if (cmd.startsWith("MAXK:")) { conf.maxK = cmd.substring(5).toInt(); bt.println("OK"); }
  
  else if (cmd.startsWith("SUNRISE:")) { conf.sunriseOffset = cmd.substring(8).toInt(); bt.println("OK"); }
  else if (cmd.startsWith("SUNSET:")) { conf.sunsetOffset = cmd.substring(7).toInt(); bt.println("OK"); }
  
  else if (cmd.startsWith("BRISTART:")) { conf.briStartAlt = cmd.substring(9).toFloat(); bt.println("OK"); }
  else if (cmd.startsWith("BRIFULL:")) { conf.briFullAlt = cmd.substring(8).toFloat(); bt.println("OK"); }
  
  // NUEVOS V4.5
  else if (cmd.startsWith("KSTART:")) { conf.kStartAlt = cmd.substring(7).toFloat(); bt.println("OK"); }
  else if (cmd.startsWith("KFULL:")) { conf.kFullAlt = cmd.substring(6).toFloat(); bt.println("OK"); }
  else if (cmd.startsWith("WARMBIAS:")) { conf.warmBias = cmd.substring(9).toFloat(); bt.println("OK"); }

  else {
    if (cmd.length() > 0) bt.println("CMD ?? (Usa STATUS)");
  }
}

void setup() {
  Serial.begin(9600);
  bt.begin(9600);
  
  pinMode(PIN_WARM, OUTPUT);
  pinMode(PIN_COLD, OUTPUT);
  pinMode(LED_NGT, OUTPUT);
  pinMode(LED_DEMO, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YEL, OUTPUT);
  pinMode(LED_GRN, OUTPUT);
  pinMode(BTN_DEMO, INPUT_PULLUP);
  pinMode(BTN_BRI, INPUT_PULLUP);
  pinMode(BTN_NGT, INPUT_PULLUP);
  
  if (!rtc.begin()) { Serial.println("Error RTC"); }
  if (rtc.lostPower()) { rtc.adjust(DateTime(F(__DATE__), F(__TIME__))); }

  loadConfig();
  Serial.println("Luminia V4.5 Iniciado");
  bt.println("LUMINIA V4.5 READY");
}

void updateIndicators() {
  digitalWrite(LED_NGT, isNightMode);
  digitalWrite(LED_DEMO, isDemoMode);
  digitalWrite(LED_RED, currentLevelIdx == 0);
  digitalWrite(LED_YEL, currentLevelIdx == 1);
  digitalWrite(LED_GRN, currentLevelIdx == 2);
}

bool readButton(int pin) {
  if (digitalRead(pin) == LOW) {
    delay(50);
    if (digitalRead(pin) == LOW) {
      while(digitalRead(pin) == LOW);
      return true;
    }
  }
  return false;
}

int getDayOfYear(DateTime t) {
  uint8_t days[] = {31,28,31,30,31,30,31,31,30,31,30,31};
  if (t.year() % 4 == 0) days[1] = 29;
  int d = t.day();
  for (int i=0; i<t.month()-1; i++) d += days[i];
  return d;
}

float getSunAltitude(DateTime t) {
  int d = getDayOfYear(t); 
  float decl = 23.45 * sin(0.0172 * (d - 81));
  float ha = (t.hour() + t.minute()/60.0 - 12.0) * 15.0;
  float sinAlt = sin(conf.lat * 0.0174) * sin(decl * 0.0174) * cos(decl * 0.0174) * cos(ha * 0.0174);
  return asin(sinAlt) * 57.29;
}

void applyLight(int kelvin, int bri) {
  int globalMax = map(conf.maxBri, 0, 100, 0, 255);
  int nightMax = map(conf.nightBri, 0, 100, 0, 255);
  
  float levelFactor = 1.0;
  if (currentLevelIdx == 1) levelFactor = 0.75;
  if (currentLevelIdx == 2) levelFactor = 0.50;
  
  int finalBri = bri * (globalMax / 255.0) * levelFactor;
  
  if (finalBri < nightMax) {
    finalBri = isNightMode ? 0 : nightMax;
  }
  
  float ratio = (float)(kelvin - conf.minK) / (conf.maxK - conf.minK);
  
  // APLICAR WARM BIAS CONFIGURABLE
  float biasLimit = 1.0 - conf.warmBias;
  ratio = constrain(ratio, 0.0, biasLimit); 
  
  analogWrite(PIN_WARM, (1.0 - ratio) * finalBri);
  analogWrite(PIN_COLD, ratio * finalBri);
}

void loop() {
  if (readButton(BTN_DEMO)) isDemoMode = !isDemoMode;
  if (readButton(BTN_BRI)) currentLevelIdx = (currentLevelIdx + 1) % 3;
  if (readButton(BTN_NGT)) isNightMode = !isNightMode;
  
  if (bt.available()) {
    String cmd = bt.readStringUntil('\\n');
    processCommand(cmd);
  }
  
  updateIndicators();

  DateTime now = rtc.now();
  if (isDemoMode) {
    if (millis() - lastDemoUpdate > 50) {
      demoMinutes = (demoMinutes + 5) % 1440;
      lastDemoUpdate = millis();
    }
    now = DateTime(now.year(), now.month(), now.day(), demoMinutes/60, demoMinutes%60, 0);
  }

  float alt = getSunAltitude(now);
  
  // 1. CALCULO BRILLO (Usa offsets horarios)
  int offsetMin = (now.hour() < 12) ? conf.sunriseOffset : -conf.sunsetOffset;
  float effectiveStart = conf.briStartAlt + (offsetMin * 0.25);
  float briSpan = conf.briFullAlt - effectiveStart;
  if(briSpan <= 0) briSpan = 1.0; 
  float bFact = constrain((alt - effectiveStart) / briSpan, 0.0, 1.0);
  int targetBri = bFact * 255;
  
  // 2. CALCULO COLOR (Usa curva configurable KSTART/KFULL)
  float kSpan = conf.kFullAlt - conf.kStartAlt;
  if (kSpan <= 0) kSpan = 1.0;
  float kFact = constrain((alt - conf.kStartAlt) / kSpan, 0.0, 1.0);
  int targetK = conf.minK + (conf.maxK - conf.minK) * kFact;

  applyLight(targetK, targetBri);
  
  // --- LOGGING ---
  static unsigned long lastLog = 0;
  if (millis() - lastLog > 1000) {
    lastLog = millis();
    Serial.print(now.hour()); Serial.print(':'); Serial.print(now.minute());
    Serial.print(" | K: "); Serial.print(targetK);
    Serial.print(" | B: "); Serial.print(targetBri);
    Serial.print(" | Sol: "); Serial.println(alt);
  }

  delay(30);
}
`;
};
