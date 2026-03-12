/**
 * ESP8266 Vending Machine Controller — FINAL WORKING VERSION
 *
 * Uses Firestore REST API to:
 * 1. Poll dispenseQueue for pending commands
 * 2. Dispense product using MG996R servo motor
 * 3. Display status on LCD 16x2 I2C
 * 4. Update status to completed
 *
 * Required Libraries (install via Arduino Library Manager):
 * - ArduinoJson by Benoit Blanchon (v6.x)
 * - LiquidCrystal_I2C by Frank de Brabander
 *
 * Board: ESP8266 (NodeMCU 1.0 / D1 Mini)
 *
 * Hardware Wiring:
 * - MG996R Servo  → D4 (GPIO2)
 * - LCD SDA       → D2 (GPIO4)
 * - LCD SCL       → D1 (GPIO5)
 * - LCD VCC       → 5V,  GND → GND
 * - Servo VCC     → External 5V, GND → Common GND
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// =============================================
// >>>  CONFIGURATION — CHANGE THESE VALUES  <<<
// =============================================

// Wi-Fi credentials
#define WIFI_SSID "Password"     // ← your WiFi name
#define WIFI_PASSWORD "username" // ← your WiFi password

// Firebase project
#define FIREBASE_PROJECT_ID "vending-machine-web"
#define API_KEY "AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84"

// *** EMULATOR vs PRODUCTION toggle ***
//  true  → talk to local Firestore emulator (for development)
//  false → talk to production firestore.googleapis.com
#define USE_EMULATOR true

// Your computer's local-network IP (run `hostname -I` on Linux)
#define EMULATOR_HOST "10.211.191.164"
#define EMULATOR_FIRESTORE_PORT 8080

// Machine ID  —  MUST match the seed data exactly!
//   seed-emulator.js uses "machine-001" (HYPHEN, not underscore)
#define MACHINE_ID "machine-001"

// Hardware pins
#define SERVO_PIN D4 // MG996R signal wire
#define LED_PIN LED_BUILTIN

// Servo (continuous-rotation values: 0-180, 90 = stop)
#define SERVO_FORWARD 120
#define SERVO_STOP 90
#define DISPENSE_TIME_MS 1500 // how long to spin

// Polling
#define POLL_INTERVAL_MS 3000 // check every 3 s

// LCD
#define LCD_ADDRESS 0x27 // try 0x3F if 0x27 doesn't work
#define LCD_COLS 16
#define LCD_ROWS 2

// =============================================
// GLOBALS
// =============================================

#if USE_EMULATOR
const char *fsHost = EMULATOR_HOST;
const int fsPort = EMULATOR_FIRESTORE_PORT;
const bool useSSL = false; // emulator = plain HTTP
#else
const char *fsHost = "firestore.googleapis.com";
const int fsPort = 443;
const bool useSSL = true; // production = HTTPS
#endif

WiFiClientSecure secureClient;
WiFiClient plainClient;

Servo servo;
LiquidCrystal_I2C lcd(LCD_ADDRESS, LCD_COLS, LCD_ROWS);

String lastProcessedDispId = ""; // Track last processed order to prevent loops
unsigned long lastDispenseTime = 0;

// =============================================
// SETUP
// =============================================
void setup()
{
        Serial.begin(115200);
        delay(100);
        Serial.println(F("\n=== ESP8266 Vending Machine ==="));

        // --- LCD ---
        Wire.begin(D2, D1); // SDA=D2, SCL=D1
        lcd.init();
        lcd.backlight();
        lcdShow("Vending Machine", "Starting...");

        // --- LED ---
        pinMode(LED_PIN, OUTPUT);
        digitalWrite(LED_PIN, HIGH); // off (active-low)

        // --- Servo ---
        servo.attach(SERVO_PIN);
        servo.write(SERVO_STOP);
        delay(300);

        // --- WiFi ---
        lcdShow("Connecting WiFi", WIFI_SSID);
        connectWiFi();

        secureClient.setInsecure(); // skip cert check (production)

        // --- Ready ---
        lcdShow("Ready!", "Waiting orders..");
        Serial.println(F("Setup done. Polling started."));
        Serial.print(F("Machine ID : "));
        Serial.println(MACHINE_ID);
        Serial.print(F("Emulator   : "));
        Serial.println(USE_EMULATOR ? "ON" : "OFF");
        if (USE_EMULATOR)
        {
                Serial.print(F("Emulator at: "));
                Serial.print(fsHost);
                Serial.print(F(":"));
                Serial.println(fsPort);
        }
        blinkLED(3, 150);
}

// =============================================
// LOOP
// =============================================
void loop()
{
        if (WiFi.status() != WL_CONNECTED)
        {
                lcdShow("WiFi Lost!", "Reconnecting...");
                connectWiFi();
        }

        // Only poll if enough time has passed since last dispense
        unsigned long timeSinceDispense = millis() - lastDispenseTime;
        if (timeSinceDispense >= POLL_INTERVAL_MS)
        {
                pollDispenseQueue();
                lastDispenseTime = millis();
        }
        yield();
}

// =============================================
// LCD helpers
// =============================================
void lcdShow(const String &line1, const String &line2)
{
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(line1.substring(0, 16));
        lcd.setCursor(0, 1);
        lcd.print(line2.substring(0, 16));
        Serial.println("[LCD] " + line1 + " | " + line2);
}

void lcdLine(int row, const String &text)
{
        lcd.setCursor(0, row);
        lcd.print("                "); // clear 16 chars
        lcd.setCursor(0, row);
        lcd.print(text.substring(0, 16));
}

// =============================================
// WiFi
// =============================================
void connectWiFi()
{
        WiFi.mode(WIFI_STA);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        Serial.print(F("WiFi connecting"));

        int tries = 0;
        while (WiFi.status() != WL_CONNECTED && tries < 40)
        {
                delay(500);
                Serial.print('.');
                digitalWrite(LED_PIN, !digitalRead(LED_PIN));
                tries++;
        }

        if (WiFi.status() == WL_CONNECTED)
        {
                Serial.println(F("\nWiFi OK!"));
                Serial.println(WiFi.localIP());
                lcdShow("WiFi Connected!", WiFi.localIP().toString());
                delay(1500);
        }
        else
        {
                Serial.println(F("\nWiFi FAILED - rebooting"));
                lcdShow("WiFi Failed!", "Rebooting...");
                delay(2000);
                ESP.restart();
        }
}

// =============================================
// Build Firestore base URL
// =============================================
String baseURL()
{
        String url;
        if (useSSL)
        {
                url = "https://" + String(fsHost);
        }
        else
        {
                url = "http://" + String(fsHost) + ":" + String(fsPort);
        }
        url += "/v1/projects/" + String(FIREBASE_PROJECT_ID) + "/databases/(default)/documents";
        return url;
}

// =============================================
// Start HTTP(S) request
// =============================================
void httpBegin(HTTPClient &http, const String &url)
{
        if (useSSL)
        {
                http.begin(secureClient, url);
        }
        else
        {
                http.begin(plainClient, url);
        }
}

// =============================================
// POLL dispenseQueue
// =============================================
void pollDispenseQueue()
{
        Serial.println(F("--- Polling dispenseQueue ---"));

        HTTPClient http;
        String url = baseURL() + ":runQuery?key=" + String(API_KEY);

        httpBegin(http, url);
        http.addHeader("Content-Type", "application/json");
        http.setTimeout(10000); // 10-second timeout

        // Structured query: machineId == MACHINE_ID AND status == "pending"
        String body = String(
                          "{\"structuredQuery\":{"
                          "\"from\":[{\"collectionId\":\"dispenseQueue\"}],"
                          "\"where\":{\"compositeFilter\":{\"op\":\"AND\",\"filters\":["
                          "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"machineId\"},"
                          "\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"") +
                      MACHINE_ID +
                      String("\"}}},"
                             "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"status\"},"
                             "\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"pending\"}}}"
                             "]}},"
                             "\"limit\":1"
                             "}}");

        Serial.println("POST " + url);
        int code = http.POST(body);
        Serial.print(F("HTTP "));
        Serial.println(code);

        if (code != 200)
        {
                Serial.print(F("Query error, HTTP "));
                Serial.println(code);
                if (code > 0)
                        Serial.println(http.getString().substring(0, 300));
                http.end();
                return;
        }

        String response = http.getString();
        http.end();

        // Debug: print first 500 chars of response
        Serial.println(F("Response (first 500):"));
        Serial.println(response.substring(0, 500));

        // Parse JSON — 8 KB buffer (emulator responses can be large)
        DynamicJsonDocument doc(8192);
        DeserializationError err = deserializeJson(doc, response);
        if (err)
        {
                Serial.print(F("JSON error: "));
                Serial.println(err.c_str());
                return;
        }

        // The response is an array; each element may or may not have "document"
        JsonArray arr = doc.as<JsonArray>();
        if (arr.isNull() || arr.size() == 0)
        {
                Serial.println(F("No pending commands."));
                return;
        }

        for (JsonObject item : arr)
        {
                if (!item.containsKey("document"))
                {
                        Serial.println(F("(empty result — no pending commands)"));
                        continue;
                }

                JsonObject document = item["document"];
                String docPath = document["name"].as<String>();
                String dispId = docPath.substring(docPath.lastIndexOf('/') + 1);

                // *** PREVENT DUPLICATE PROCESSING ***
                if (dispId == lastProcessedDispId)
                {
                        Serial.println(F("(Already processed this order, skipping)"));
                        continue;
                }

                JsonObject fields = document["fields"];
                String productId = fields["productId"]["stringValue"] | "unknown";
                String orderId = fields["orderId"]["stringValue"] | "unknown";

                Serial.println(F("\n***** DISPENSE COMMAND FOUND *****"));
                Serial.println("  dispenseId : " + dispId);
                Serial.println("  productId  : " + productId);
                Serial.println("  orderId    : " + orderId);

                // Mark as processing immediately to prevent duplicate
                lastProcessedDispId = dispId;

                // ---- 1. Show "Order Received" on LCD ----
                lcdShow("Order Received!", productId);
                delay(1000);

                // ---- 2. Dispense (servo) ----
                dispense(productId);

                // ---- 3. Update Firestore status -> completed ----
                bool updateSuccess = markCompleted(dispId);

                // ---- 4. Show result on LCD ----
                if (updateSuccess)
                {
                        lcdShow("Dispensed OK!", "Thank you :)");
                        blinkLED(5, 100);
                }
                else
                {
                        lcdShow("Error updating!", "Retrying...");
                        lastProcessedDispId = ""; // Reset to retry
                        delay(2000);
                        continue;
                }

                delay(3000);

                // ---- 5. Back to idle ----
                lcdShow("Ready!", "Waiting orders..");
                Serial.println(F("***** DISPENSE DONE *****\n"));

                // Exit loop after processing one order
                break;
        }
}

// =============================================
// DISPENSE (servo motor)
// =============================================
void dispense(const String &productId)
{
        Serial.println("Dispensing: " + productId);
        lcdShow("Dispensing...", productId);

        digitalWrite(LED_PIN, LOW); // LED on

        servo.write(SERVO_FORWARD); // spin forward
        delay(DISPENSE_TIME_MS);
        servo.write(SERVO_STOP); // stop

        digitalWrite(LED_PIN, HIGH); // LED off
        Serial.println(F("Servo done."));
}

// =============================================
// MARK dispense doc as completed in Firestore
// =============================================
bool markCompleted(const String &dispId)
{
        Serial.println("Updating " + dispId + " -> completed");
        lcdShow("Confirming...", "Updating status");

        HTTPClient http;
        String url = baseURL() + "/dispenseQueue/" + dispId + "?updateMask.fieldPaths=status&key=" + String(API_KEY);

        httpBegin(http, url);
        http.addHeader("Content-Type", "application/json");
        http.setTimeout(10000);

        String payload = "{\"fields\":{\"status\":{\"stringValue\":\"completed\"}}}";
        int code = http.PATCH(payload);

        bool success = false;
        if (code == 200)
        {
                Serial.println(F("Status -> completed OK"));
                success = true;
        }
        else
        {
                Serial.print(F("PATCH failed, HTTP "));
                Serial.println(code);
                if (code > 0)
                        Serial.println(http.getString().substring(0, 200));
                success = false;
        }
        http.end();

        delay(500); // Wait for Firestore to sync
        return success;
}

// =============================================
// Utility
// =============================================
void blinkLED(int n, int ms)
{
        for (int i = 0; i < n; i++)
        {
                digitalWrite(LED_PIN, LOW);
                delay(ms);
                digitalWrite(LED_PIN, HIGH);
                delay(ms);
        }
}
