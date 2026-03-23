/**
 * ESP8266 Vending Machine — SIMPLIFIED VERSION
 * D3 = Coke (2 seconds)
 * D4 = Water (2 seconds)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Servo.h>

// WiFi
#define WIFI_SSID "Password"
#define WIFI_PASSWORD "username"

// Firebase
#define FIREBASE_PROJECT_ID "vending-machine-web"
#define API_KEY "AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84"
#define EMULATOR_HOST "10.243.190.110"
#define EMULATOR_PORT 8080
#define USE_EMULATOR true
#define MACHINE_ID "machine-001"

// Pins
#define COKE_SERVO_PIN D3     // D3 for Coke
#define WATER_SERVO_PIN D4    // D4 for Water
#define LED_PIN LED_BUILTIN

// Servo values
#define SERVO_ON 120          // Rotate
#define SERVO_OFF 90          // Stop
#define DISPENSE_TIME 2000    // 2 seconds

WiFiClient wifiClient;
Servo cokeServo, waterServo;
String lastOrderId = "";

void setup() {
        Serial.begin(115200);
        delay(100);
        Serial.println("\n=== VENDING MACHINE SIMPLE ===");
        
        // Servos
        cokeServo.attach(COKE_SERVO_PIN);
        cokeServo.write(SERVO_OFF);
        waterServo.attach(WATER_SERVO_PIN);
        waterServo.write(SERVO_OFF);
        
        // LED
        pinMode(LED_PIN, OUTPUT);
        digitalWrite(LED_PIN, HIGH);
        
        // WiFi
        Serial.println("Connecting WiFi...");
        connectWiFi();
        
        Serial.println("Setup done!");
}

void loop() {
        if (WiFi.status() != WL_CONNECTED) {
                connectWiFi();
        }
        
        pollOrders();
        delay(3000);
}

void connectWiFi() {
        WiFi.mode(WIFI_STA);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        int tries = 0;
        
        while (WiFi.status() != WL_CONNECTED && tries < 40) {
                delay(500);
                Serial.print(".");
                tries++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
                Serial.println("\n✓ WiFi OK!");
                Serial.println(WiFi.localIP());
        } else {
                Serial.println("\n✗ WiFi FAILED!");
                ESP.restart();
        }
}

void pollOrders() {
        HTTPClient http;
        String url = "http://" + String(EMULATOR_HOST) + ":" + String(EMULATOR_PORT) + 
                     "/v1/projects/" + String(FIREBASE_PROJECT_ID) + "/databases/(default)/documents:runQuery?key=" + String(API_KEY);
        
        http.begin(wifiClient, url);
        http.addHeader("Content-Type", "application/json");
        
        String query = "{\"structuredQuery\":{"
                       "\"from\":[{\"collectionId\":\"dispenseQueue\"}],"
                       "\"where\":{\"compositeFilter\":{\"op\":\"AND\",\"filters\":["
                       "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"machineId\"},"
                       "\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"" + String(MACHINE_ID) + "\"}}},"
                       "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"status\"},"
                       "\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"pending\"}}}"
                       "]}},"
                       "\"limit\":1"
                       "}}";
        
        int code = http.POST(query);
        
        if (code == 200) {
                String response = http.getString();
                DynamicJsonDocument doc(8192);
                deserializeJson(doc, response);
                
                JsonArray arr = doc.as<JsonArray>();
                if (arr.size() > 0 && arr[0].containsKey("document")) {
                        JsonObject doc_obj = arr[0]["document"];
                        String orderId = doc_obj["name"].as<String>();
                        orderId = orderId.substring(orderId.lastIndexOf('/') + 1);
                        
                        if (orderId != lastOrderId) {
                                lastOrderId = orderId;
                                String productId = doc_obj["fields"]["productId"]["stringValue"] | "unknown";
                                
                                Serial.println("\n✓ ORDER FOUND: " + productId);
                                
                                if (productId == "prod-001-coke") {
                                        Serial.println("→ Rotating COKE servo (D3)");
                                        rotateServo(&cokeServo);
                                } else if (productId == "prod-001-water" || productId == "prod-001-water-1l") {
                                        Serial.println("→ Rotating WATER servo (D4)");
                                        rotateServo(&waterServo);
                                }
                                
                                // Mark as completed
                                markCompleted(orderId);
                                lastOrderId = "";
                        }
                }
        }
        
        http.end();
}

void rotateServo(Servo* servo) {
        digitalWrite(LED_PIN, LOW);
        Serial.println("  Rotating for 2 seconds...");
        
        servo->write(SERVO_ON);
        delay(DISPENSE_TIME);
        servo->write(SERVO_OFF);
        
        digitalWrite(LED_PIN, HIGH);
        Serial.println("  Done!");
}

void markCompleted(String orderId) {
        HTTPClient http;
        String url = "http://" + String(EMULATOR_HOST) + ":" + String(EMULATOR_PORT) + 
                     "/v1/projects/" + String(FIREBASE_PROJECT_ID) + "/databases/(default)/documents/dispenseQueue/" + 
                     orderId + "?updateMask.fieldPaths=status&key=" + String(API_KEY);
        
        http.begin(wifiClient, url);
        http.addHeader("Content-Type", "application/json");
        
        String payload = "{\"fields\":{\"status\":{\"stringValue\":\"completed\"}}}";
        int code = http.PATCH(payload);
        
        if (code == 200) {
                Serial.println("✓ Marked as completed");
        }
        
        http.end();
}
