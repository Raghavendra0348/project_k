/**
 * Enhanced Servo Diagnostic with ADC Power Check
 * Tests servo power supply voltage
 */

#include <Servo.h>
#include <Arduino.h>

#define SERVO_PIN_1 D4  // KitKat
#define SERVO_PIN_2 D5  // Lays
#define ADC_PIN A0      // Analog input to measure voltage (optional)

Servo servo1, servo2;

#define SERVO_FORWARD 120
#define SERVO_BACKWARD 60
#define SERVO_STOP 90

void setup() {
        Serial.begin(115200);
        delay(1000);
        Serial.println("\n=== ENHANCED SERVO DIAGNOSTIC ===\n");
        
        // Check ADC
        Serial.println("Power Supply Status:");
        Serial.print("ESP8266 Voltage: ");
        float voltage = (analogRead(ADC_PIN) / 1023.0) * 3.3;
        Serial.print(voltage);
        Serial.println("V (should be ~3.2V)");
        Serial.println("NOTE: This only measures ESP8266 supply, NOT servo power!\n");
        
        // Show PWM pins
        Serial.println("Servo Configuration:");
        Serial.print("Servo 1: D4 (GPIO2) - ");
        Serial.println(digitalPinToPort((pin_size_t)D4) != NOT_A_PORT ? "Valid" : "Invalid");
        Serial.print("Servo 2: D5 (GPIO14) - ");
        Serial.println(digitalPinToPort((pin_size_t)D5) != NOT_A_PORT ? "Valid" : "Invalid");
        Serial.println();
        
        // Attach servos
        Serial.print("Attaching Servo 1 to D4... ");
        if (servo1.attach(SERVO_PIN_1)) {
                Serial.println("✓ OK");
                servo1.write(SERVO_STOP);
        } else {
                Serial.println("✗ FAILED!");
        }
        
        Serial.print("Attaching Servo 2 to D5... ");
        if (servo2.attach(SERVO_PIN_2)) {
                Serial.println("✓ OK");
                servo2.write(SERVO_STOP);
        } else {
                Serial.println("✗ FAILED!");
        }
        
        delay(1000);
        
        Serial.println("\n=== POWER SUPPLY CHECK ===");
        Serial.println("⚠️  CRITICAL: Servos MUST have EXTERNAL 5V power!");
        Serial.println("   - Do NOT connect to ESP8266 3.3V pins");
        Serial.println("   - Use external USB adapter or battery (5V, 2-3A minimum)");
        Serial.println("   - Servo VCC → External 5V");
        Serial.println("   - Servo GND → ESP8266 GND (SHARED GROUND!)");
        Serial.println("   - Servo Signal → D4 or D5\n");
        
        Serial.println("WIRING DIAGRAM:");
        Serial.println("[External 5V Power] → Servo1 VCC, Servo2 VCC");
        Serial.println("[ESP8266 GND] ←——→ [Servos GND] (MUST SHARE!)");
        Serial.println("[ESP8266 D4] → Servo1 Signal (Orange/Yellow)");
        Serial.println("[ESP8266 D5] → Servo2 Signal (Orange/Yellow)\n");
        
        delay(2000);
        runTest();
}

void loop() {
        delay(1000);
}

void runTest() {
        Serial.println("Starting servo tests...\n");
        
        // Test 1: Forward rotation
        Serial.println("TEST 1: Servo 1 (D4) forward rotation...");
        Serial.println("  Command: write(120)");
        servo1.write(SERVO_FORWARD);
        Serial.println("  ✓ Signal sent");
        Serial.println("  → If you don't hear the servo hum, power is missing!");
        delay(3000);
        servo1.write(SERVO_STOP);
        Serial.println("  Done.\n");
        delay(1500);
        
        // Test 2
        Serial.println("TEST 2: Servo 2 (D5) forward rotation...");
        Serial.println("  Command: write(120)");
        servo2.write(SERVO_FORWARD);
        Serial.println("  ✓ Signal sent");
        Serial.println("  → If you don't hear the servo hum, power is missing!");
        delay(3000);
        servo2.write(SERVO_STOP);
        Serial.println("  Done.\n");
        delay(1500);
        
        // Test 3: Backward
        Serial.println("TEST 3: Servo 1 backward rotation...");
        Serial.println("  Command: write(60)");
        servo1.write(SERVO_BACKWARD);
        Serial.println("  ✓ Signal sent");
        delay(3000);
        servo1.write(SERVO_STOP);
        Serial.println("  Done.\n");
        delay(1500);
        
        Serial.println("=== TESTS COMPLETE ===\n");
        
        Serial.println("TROUBLESHOOTING:");
        Serial.println("❌ No movement, no sound: POWER SUPPLY ISSUE");
        Serial.println("   → Check external 5V is connected");
        Serial.println("   → Check servo GND cable");
        Serial.println("   → Measure voltage at servo: should be 5V");
        Serial.println("");
        Serial.println("✓ Hum but no rotation: Signal OK, low power");
        Serial.println("   → Upgrade power supply (needs more current)");
        Serial.println("");
        Serial.println("✓ Rotation works: Everything OK!");
}
