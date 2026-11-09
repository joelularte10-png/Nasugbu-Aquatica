#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// ---------- CHANGE THIS ----------
const char* WIFI_SSID  = "pitipiwiw";
const char* WIFI_PASS  = "24-71547";
const char* SERVER_URL = "http://192.168.1.36/NasugbuAquatica-main/Nasugbu-Aquatica-Web-IoT-System-main/api/insert.php"; // your PC's IP 
// ---------------------------------
const char* API_KEY    = "aquatica123";

#define DHT_PIN    17
#define DHT_TYPE   DHT11
#define LED_PIN    18
#define BUZZER_PIN 19

// Temperature limits (°C)
const float TEMP_SAFE_MIN   = 24.0;
const float TEMP_SAFE_MAX   = 28.0;
const float TEMP_DANGER_MIN = 22.0;
const float TEMP_DANGER_MAX = 30.0;

// Humidity limits (%)
const float HUM_SAFE_MIN   = 40.0;
const float HUM_SAFE_MAX   = 70.0;
const float HUM_DANGER_MIN = 30.0;
const float HUM_DANGER_MAX = 80.0;

// Blink / beep speed (ms)
const unsigned long WARNING_INTERVAL = 1000;  // slow
const unsigned long DANGER_INTERVAL  = 150;   // fast

// Timing (ms)
const unsigned long READ_INTERVAL = 2000;     // read sensor
const unsigned long SEND_INTERVAL = 5000;     // send to server

enum Status { SAFE, WARNING, DANGER };

DHT dht(DHT_PIN, DHT_TYPE);

Status currentStatus = SAFE;
bool alertOn = false;
unsigned long lastToggle = 0;
unsigned long lastRead = 0;
unsigned long lastSend = 0;

Status checkStatus(float t, float h) {
  if (t < TEMP_DANGER_MIN || t > TEMP_DANGER_MAX ||
      h < HUM_DANGER_MIN  || h > HUM_DANGER_MAX) {
    return DANGER;
  }
  if (t < TEMP_SAFE_MIN || t > TEMP_SAFE_MAX ||
      h < HUM_SAFE_MIN  || h > HUM_SAFE_MAX) {
    return WARNING;
  }
  return SAFE;
}

void setAlert(bool on) {
  alertOn = on;
  digitalWrite(LED_PIN, on ? HIGH : LOW);
  digitalWrite(BUZZER_PIN, on ? HIGH : LOW);
}

void sendToServer(float t, float h) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi lost, reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  String body = "key=" + String(API_KEY) +
                "&temperature=" + String(t, 1) +
                "&humidity=" + String(h, 0);

  int code = http.POST(body);
  Serial.print("Server response: ");
  Serial.println(code);   // 200 = success
  http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  setAlert(false);

  Serial.println("Aquarium Monitor Starting...");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long now = millis();

  // 1) Read sensor every 2 seconds
  if (now - lastRead >= READ_INTERVAL) {
    lastRead = now;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read DHT11!");
    } else {
      currentStatus = checkStatus(temperature, humidity);

      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.print(" °C | Humidity: ");
      Serial.print(humidity);
      Serial.print(" % | Status: ");

      if (currentStatus == SAFE)         Serial.println("SAFE");
      else if (currentStatus == WARNING) Serial.println("WARNING");
      else                               Serial.println("DANGER!");

      // Send to database every 5 seconds
      if (now - lastSend >= SEND_INTERVAL) {
        lastSend = now;
        sendToServer(temperature, humidity);
      }
    }
  }

  // 2) Blink LED + beep buzzer based on status
  if (currentStatus == SAFE) {
    if (alertOn) setAlert(false);
  } else {
    unsigned long interval = (currentStatus == WARNING) ? WARNING_INTERVAL : DANGER_INTERVAL;

    if (now - lastToggle >= interval) {
      lastToggle = now;
      setAlert(!alertOn);
    }
  }
}