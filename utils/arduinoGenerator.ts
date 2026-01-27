import { AppConfig } from "../types";

export const generateArduinoSketch = (config: AppConfig): string => {
  const { 
      location, nightBrightness, minKelvin, maxKelvin, maxBrightness, 
      brightnessStartAlt, brightnessFullAlt, minWarmBias 
  } = config;

  // Calculamos valores iniciales por defecto (Hardcoded para el primer arranque)
  const defLat = location.lat;
  const defLon = location.lng;
  const warmBiasLimit = (1.0 - minWarmBias).toFixed(2);
  
  return `/*
  CONTROLADOR DE VENTANA CIRCADIANA (Luminia V4.4 - Time Sync Fix)
  -----------------------------------------------
  Control total desde el móvil.
  
  FIX HORA INCORRECTA:
  Si el reloj marca una hora rara (ej: 2026), usa el comando:
  SETTIME:YYYYMMDDHHMM (Ej: SETTIME:202401271745)
  
  COMANDOS BLUETOOTH:
  > Atajos: 'd' (Demo), 'n' (Noche), '+' (Max), '-' (Min)
  > Config: STATUS, SAVE, RESET
  > Hora:   SETTIME:202401011200
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
};

Config conf;
const byte MAGIC_NUMBER = 0x43; 

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
    conf.lat = ${defLat};
    conf.lon = ${defLon};
    conf.minK = ${minKelvin};
    conf.maxK = ${maxKelvin};
    conf.maxBri = ${maxBrightness};
    conf.nightBri = ${nightBrightness};
    conf.briStartAlt = ${brightnessStartAlt};
    conf.briFullAlt = ${brightnessFullAlt};
    conf.sunriseOffset = ${config.sunriseOffset};
    conf.sunsetOffset = ${config.sunsetOffset};
    EEPROM.put(0, conf); 
  }
}

void printStatus() {
  DateTime now = rtc.now();
  bt.println(F("--- ESTADO LUMINIA ---"));
  bt.print(F("HORA: ")); 
  bt.print(now.year()); bt.print('/'); bt.print(now.month()); bt.print('/'); bt.print(now.day());
  bt.print(' '); bt.print(now.hour()); bt.print(':'); bt.println(now.minute());
  
  bt.print(F("LAT: ")); bt.print(conf.lat); bt.print(" LON: "); bt.println(conf.lon);
  bt.print(F("K Range: ")); bt.print(conf.minK); bt.print("-"); bt.println(conf.maxK);
  
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

  // --- CONFIGURACION TECNICA ---
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
  // --- CORRECCION DE HORA ---
  // Formato: SETTIME:YYYYMMDDHHMM (12 caracteres)
  // Ejemplo: SETTIME:202401271745
  else if (cmd.startsWith("SETTIME:")) {
      String t = cmd.substring(8);
      if (t.length() >= 12) {
          int y = t.substring(0, 4).toInt();
          int m = t.substring(4, 6).toInt();
          int d = t.substring(6, 8).toInt();
          int h = t.substring(8, 10).toInt();
          int mn = t.substring(10, 12).toInt();
          
          rtc.adjust(DateTime(y, m, d, h, mn, 0));
          bt.println("HORA ACTUALIZADA CORRECTAMENTE");
          printStatus();
      } else {
          bt.println("ERROR. USE: SETTIME:YYYYMMDDHHMM");
      }
  }
  // GEO Y PARAMETROS
  else if (cmd.startsWith("LAT:")) {
    conf.lat = cmd.substring(4).toFloat();
    bt.print("OK LAT: "); bt.println(conf.lat);
  }
  else if (cmd.startsWith("LNG:")) {
    conf.lon = cmd.substring(4).toFloat();
    bt.print("OK LNG: "); bt.println(conf.lon);
  }
  else if (cmd.startsWith("MAXBRI:")) {
    conf.maxBri = cmd.substring(7).toInt();
    bt.print("OK MaxBri: "); bt.println(conf.maxBri);
  }
  else if (cmd.startsWith("NIGHTBRI:")) {
    conf.nightBri = cmd.substring(9).toInt();
    bt.print("OK NightBri: "); bt.println(conf.nightBri);
  }
  else if (cmd.startsWith("MINK:")) {
    conf.minK = cmd.substring(5).toInt();
    bt.print("OK MinK: "); bt.println(conf.minK);
  }
  else if (cmd.startsWith("MAXK:")) {
    conf.maxK = cmd.substring(5).toInt();
    bt.print("OK MaxK: "); bt.println(conf.maxK);
  }
  else if (cmd.startsWith("SUNRISE:")) {
    conf.sunriseOffset = cmd.substring(8).toInt();
    bt.print("OK SunRise Off: "); bt.println(conf.sunriseOffset);
  }
  else if (cmd.startsWith("SUNSET:")) {
    conf.sunsetOffset = cmd.substring(7).toInt();
    bt.print("OK SunSet Off: "); bt.println(conf.sunsetOffset);
  }
  else if (cmd.startsWith("BRISTART:")) {
    conf.briStartAlt = cmd.substring(9).toFloat();
    bt.print("OK CurveStart: "); bt.println(conf.briStartAlt);
  }
  else if (cmd.startsWith("BRIFULL:")) {
    conf.briFullAlt = cmd.substring(8).toFloat();
    bt.print("OK CurveFull: "); bt.println(conf.briFullAlt);
  }
  else {
    if (cmd.length() > 0) bt.println("CMD ?? (Prueba: STATUS, SAVE, SETTIME:...)");
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
  Serial.println("Luminia V4.4 Iniciado");
  bt.println("LUMINIA READY. Usa STATUS para ver info.");
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
  ratio = constrain(ratio, 0.0, ${warmBiasLimit}); 
  
  analogWrite(PIN_WARM, (1.0 - ratio) * finalBri);
  analogWrite(PIN_COLD, ratio * finalBri);
}

void loop() {
  // 1. Gestión Física
  if (readButton(BTN_DEMO)) isDemoMode = !isDemoMode;
  if (readButton(BTN_BRI)) currentLevelIdx = (currentLevelIdx + 1) % 3;
  if (readButton(BTN_NGT)) isNightMode = !isNightMode;
  
  // 2. Gestión Bluetooth
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
  int offsetMin = (now.hour() < 12) ? conf.sunriseOffset : -conf.sunsetOffset;
  float effectiveStart = conf.briStartAlt + (offsetMin * 0.25);
  
  float briSpan = conf.briFullAlt - effectiveStart;
  if(briSpan <= 0) briSpan = 1.0; 
  
  float bFact = constrain((alt - effectiveStart) / briSpan, 0.0, 1.0);
  int targetBri = bFact * 255;
  
  float kFact = constrain((alt - effectiveStart) / 20.0, 0.0, 1.0);
  int targetK = conf.minK + (conf.maxK - conf.minK) * kFact;

  applyLight(targetK, targetBri);
  
  // --- MONITOR SERIE ---
  static unsigned long lastLog = 0;
  if (millis() - lastLog > 1000) {
    lastLog = millis();
    
    Serial.print(now.year()); Serial.print('/');
    Serial.print(now.month()); Serial.print('/');
    Serial.print(now.day()); Serial.print(" ");
    
    if (now.hour() < 10) Serial.print('0');
    Serial.print(now.hour()); Serial.print(':');
    if (now.minute() < 10) Serial.print('0');
    Serial.print(now.minute()); Serial.print(':');
    if (now.second() < 10) Serial.print('0');
    Serial.print(now.second());
    
    Serial.print(" | Temp: "); Serial.print(targetK); Serial.print("K");
    Serial.print(" | Brillo: "); Serial.print(map(targetBri, 0, 255, 0, 100)); Serial.print("%");
    Serial.print(" | Sol: "); Serial.print(alt);
    
    if (isDemoMode) Serial.print(" [DEMO]");
    if (isNightMode) Serial.print(" [NOCHE]");
    
    Serial.println();
  }

  delay(30);
}
`;