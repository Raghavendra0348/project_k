/*
 * ============================================================
 *  ESP8266 Vending Machine Controller
 *  Board  : NodeMCU 1.0 / D1 Mini (ESP8266)
 * ============================================================
 *  FIX LOG:
 *   - Restored SERVO_FORWARD 120° / SERVO_STOP 90°
 *     (180/0 does not map correctly with 1000-2000µs PWM range)
 *   - Restored DISPENSE_TIME_MS to 2000ms
 *   - Servos are DETACHED after setup and re-attached only at
 *     dispense time — this prevents D4/GPIO2 from being held
 *     LOW by a PWM signal, which was stalling the servos
 * ============================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

#define WIFI_SSID              "Password"
#define WIFI_PASSWORD          "username"
#define FIREBASE_PROJECT_ID    "vending-machine-web"
#define API_KEY                "AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84"
#define USE_EMULATOR           true
#define EMULATOR_HOST          "10.243.190.110"
#define EMULATOR_FIRESTORE_PORT 8080
#define MACHINE_ID             "machine-001"

#define SERVO_PIN_WATER        D4       // GPIO2  – Bisleri/Water
#define SERVO_PIN_COLA         D7       // GPIO13 – Coca Cola
#define SERVO_PIN_PEPSI        D5       // GPIO14 – Pepsi
#define SERVO_PIN_FROOTI       D6       // GPIO12 – Frooti
#define LED_PIN                LED_BUILTIN

// With attach(pin, 1000, 2000) the mapping is:
//   90  deg -> 1500 us -> STOP
//  120  deg -> 1700 us -> Forward CW
//   60  deg -> 1300 us -> Reverse CCW
#define SERVO_FORWARD          180
#define SERVO_STOP             90
#define SERVO_REVERSE          60
#define DISPENSE_TIME_MS       2000

#define POLL_INTERVAL_MS       3000
#define MAX_RETRIES            3
#define RETRY_COOLDOWN_MS      5000
#define LCD_ADDRESS            0x27
#define LCD_COLS               16
#define LCD_ROWS               2

LiquidCrystal_I2C lcd(LCD_ADDRESS, LCD_COLS, LCD_ROWS);
Servo waterServo;    // Bisleri/Water – D4
Servo colaServo;     // Coca Cola – D7
Servo pepsiServo;    // Pepsi – D5
Servo frootiServo;   // Frooti – D6
WiFiClient wifiClient;

unsigned long lastPollTime    = 0;
String        lastProcessedId = "";

void lcdShow(String line1, String line2 = "") {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1.substring(0, LCD_COLS));
  if (line2.length()) {
    lcd.setCursor(0, 1);
    lcd.print(line2.substring(0, LCD_COLS));
  }
}

void blinkLED(int n, int ms = 150) {
  for (int i = 0; i < n; i++) {
    digitalWrite(LED_PIN, LOW);  delay(ms);
    digitalWrite(LED_PIN, HIGH); delay(ms);
  }
}

String baseURL() {
  if (USE_EMULATOR)
    return "http://" + String(EMULATOR_HOST) + ":" + String(EMULATOR_FIRESTORE_PORT) +
           "/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents";
  return "https://firestore.googleapis.com/v1/projects/" +
         String(FIREBASE_PROJECT_ID) + "/databases/(default)/documents";
}

bool httpBegin(HTTPClient &http, const String &url) {
  return http.begin(wifiClient, url);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("WiFi connecting");
  lcdShow("WiFi...", "");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) { delay(500); Serial.print("."); tries++; }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi OK!"); Serial.println(WiFi.localIP());
    lcdShow("WiFi Connected", WiFi.localIP().toString());
    blinkLED(3, 150);
  } else {
    Serial.println("\nWiFi FAILED");
    lcdShow("WiFi Failed!", "Retrying...");
  }
}

struct ProductMapping { const char *productId; const char *label; int servoPin; };
const ProductMapping PRODUCTS[] = {
  { "prod-001-water",    "Water",     SERVO_PIN_WATER },
  { "prod-001-water-1l", "Water 1L",  SERVO_PIN_WATER },
  { "prod-001-bisleri",  "Bisleri",   SERVO_PIN_WATER },
  { "prod-001-coke",     "Coca Cola", SERVO_PIN_COLA  },
  { "prod-001-pepsi",    "Pepsi",     SERVO_PIN_PEPSI },
  { "prod-001-frooti",   "Frooti",    SERVO_PIN_FROOTI},
};
const int NUM_PRODUCTS = sizeof(PRODUCTS) / sizeof(PRODUCTS[0]);

int getServoForProduct(const String &productId) {
  Serial.println("--- Looking up servo for product ---");
  Serial.print("Product ID: "); Serial.println(productId);
  for (int i = 0; i < NUM_PRODUCTS; i++) {
    Serial.print("  Checking ["); Serial.print(PRODUCTS[i].productId); Serial.print("] ");
    if (productId == PRODUCTS[i].productId) {
      Serial.println("✓ MATCH!");
      Serial.print("✓ Using Servo: "); Serial.println(PRODUCTS[i].label);
      return PRODUCTS[i].servoPin;
    }
    Serial.println();
  }
  Serial.println("  No match – defaulting to Water (D4)");
  return SERVO_PIN_WATER;
}

// ─────────────────────────────────────────────────────────────
//  Helper: Get Servo pointer for a given pin
// ─────────────────────────────────────────────────────────────
Servo* getServoForPin(int pin) {
  if (pin == SERVO_PIN_WATER) return &waterServo;
  if (pin == SERVO_PIN_COLA)  return &colaServo;
  if (pin == SERVO_PIN_PEPSI) return &pepsiServo;
  if (pin == SERVO_PIN_FROOTI) return &frootiServo;
  return &waterServo;  // default fallback
}

// ─────────────────────────────────────────────────────────────
//  Dispense
//  Servos are kept detached at rest.  Re-attach here, spin,
//  write stop pulse, then detach again to prevent jitter and
//  to release pins back to a safe idle state.
// ─────────────────────────────────────────────────────────────
void dispense(const String &productId, int servoPin) {
  Serial.println(">>> DISPENSE FUNCTION CALLED <<<");
  Servo *srv = getServoForPin(servoPin);

  // Attach fresh
  if (!srv->attached()) {
    srv->attach(servoPin, 1000, 2000);
    delay(100);
    srv->write(SERVO_STOP);  // make sure it starts stopped
    delay(300);
  }

  digitalWrite(LED_PIN, LOW);

  Serial.print("Writing SERVO_FORWARD: "); Serial.println(SERVO_FORWARD);
  srv->write(SERVO_FORWARD);

  Serial.print("Spinning for "); Serial.print(DISPENSE_TIME_MS); Serial.println(" ms...");
  delay(DISPENSE_TIME_MS);

  Serial.print("Writing SERVO_STOP: "); Serial.println(SERVO_STOP);
  srv->write(SERVO_STOP);
  delay(300);       // Let stop pulse fully transmit
  srv->detach();    // Release PWM so pin goes idle

  digitalWrite(LED_PIN, HIGH);
  Serial.println("✓ Servo command complete");
}

bool markCompleted(const String &dispId) {
  Serial.println("--- Updating Firestore status ---");
  String url = baseURL() + "/dispenseQueue/" + dispId +
               "?updateMask.fieldPaths=status&key=" + API_KEY;
  HTTPClient http;
  if (!httpBegin(http, url)) { Serial.println("HTTP begin failed"); return false; }
  http.addHeader("Content-Type", "application/json");
  String body = "{\"fields\":{\"status\":{\"stringValue\":\"completed\"}}}";
  int code = http.sendRequest("PATCH", body);
  Serial.print("PATCH Response code: "); Serial.println(code);
  http.end();
  if (code == 200) { Serial.println("✓ Status updated successfully!"); return true; }
  Serial.println("✗ Update failed!"); return false;
}

void pollDispenseQueue() {
  Serial.println("--- Polling dispenseQueue ---");
  String url = baseURL() + ":runQuery?key=" + API_KEY;
  Serial.print("POST "); Serial.println(url);

  String query =
    "{\"structuredQuery\":{"
      "\"from\":[{\"collectionId\":\"dispenseQueue\"}],"
      "\"where\":{\"compositeFilter\":{\"op\":\"AND\",\"filters\":["
        "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"machineId\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"" MACHINE_ID "\"}}},"
        "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"status\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"pending\"}}}"
      "]}},"
      "\"limit\":1"
    "}}";

  HTTPClient http;
  if (!httpBegin(http, url)) { lcdShow("HTTP Error", "Can't connect"); return; }
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(query);
  Serial.print("HTTP "); Serial.println(httpCode);
  if (httpCode != 200) { http.end(); lcdShow("Poll Error", String(httpCode)); return; }

  String response = http.getString();
  http.end();
  Serial.println(response.substring(0, 500));

  DynamicJsonDocument doc(4096);
  if (deserializeJson(doc, response)) { Serial.println("JSON parse error"); return; }

  JsonArray arr = doc.as<JsonArray>();
  if (arr.isNull() || arr.size() == 0 || !arr[0].as<JsonObject>().containsKey("document")) {
    lcdShow("Vending Ready", "Waiting..."); return;
  }

  JsonObject document = arr[0]["document"];
  String docName   = document["name"].as<String>();
  int    slash     = docName.lastIndexOf('/');
  String dispId    = (slash >= 0) ? docName.substring(slash + 1) : docName;
  String productId = document["fields"]["productId"]["stringValue"].as<String>();
  String orderId   = document["fields"]["orderId"]["stringValue"].as<String>();

  Serial.println("\n***** DISPENSE COMMAND FOUND *****");
  Serial.print("  dispenseId : "); Serial.println(dispId);
  Serial.print("  productId  : ["); Serial.print(productId); Serial.println("]");
  Serial.print("  orderId    : "); Serial.println(orderId);

  if (dispId == lastProcessedId) { Serial.println("  (already processed – skipping)"); return; }

  lcdShow("Order Received!", productId.substring(0, LCD_COLS));
  int servoPin = getServoForProduct(productId);
  dispense(productId, servoPin);

  bool updated = false;
  for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    Serial.print("Update attempt "); Serial.print(attempt); Serial.print("/"); Serial.println(MAX_RETRIES);
    if (markCompleted(dispId)) { updated = true; break; }
    if (attempt < MAX_RETRIES) { Serial.println("Waiting 5s..."); delay(RETRY_COOLDOWN_MS); }
  }

  if (updated) {
    lcdShow("Dispensed OK!", "");
    Serial.println("✓ DISPENSE SUCCESS");
    lastProcessedId = dispId;
  } else {
    lcdShow("Error updating!", "");
    Serial.println("✗ DISPENSE FAILED");
  }
  Serial.println("***** DISPENSE DONE *****\n");
}

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n=== ESP8266 Vending Machine (4 Servo) ===");

  Wire.begin(SDA, SCL);
  lcd.init();
  lcd.backlight();
  lcdShow("Vending Machine", "Starting...");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  Serial.println(">>> SERVO INITIALIZATION <<<");

  // Attach, send stop pulse, then DETACH immediately.
  // Keeping pins attached (PWM active) at boot can cause
  // the ESP8266 to fail to start reliably on next power cycle.
  Serial.println("Attaching Water Servo to D4...");
  waterServo.attach(SERVO_PIN_WATER, 1000, 2000);
  waterServo.write(SERVO_STOP);
  delay(500);
  waterServo.detach();
  Serial.println("✓ Water Servo (D4 / Bisleri) ready");

  Serial.println("Attaching Cola Servo to D7...");
  colaServo.attach(SERVO_PIN_COLA, 1000, 2000);
  colaServo.write(SERVO_STOP);
  delay(500);
  colaServo.detach();
  Serial.println("✓ Cola Servo (D7 / Coca Cola) ready");

  Serial.println("Attaching Pepsi Servo to D5...");
  pepsiServo.attach(SERVO_PIN_PEPSI, 1000, 2000);
  pepsiServo.write(SERVO_STOP);
  delay(500);
  pepsiServo.detach();
  Serial.println("✓ Pepsi Servo (D5) ready");

  Serial.println("Attaching Frooti Servo to D6...");
  frootiServo.attach(SERVO_PIN_FROOTI, 1000, 2000);
  frootiServo.write(SERVO_STOP);
  delay(500);
  frootiServo.detach();
  Serial.println("✓ Frooti Servo (D6) ready");

  Serial.println(">>> ALL SERVOS INITIALIZED <<<\n");

  connectWiFi();

  Serial.println("Setup done. Polling started.");
  Serial.print("Machine ID : "); Serial.println(MACHINE_ID);
  lcdShow("Machine Ready", MACHINE_ID);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost – reconnecting...");
    connectWiFi();
    return;
  }
  unsigned long now = millis();
  if (now - lastPollTime >= POLL_INTERVAL_MS) {
    lastPollTime = now;
    pollDispenseQueue();
  }
}
