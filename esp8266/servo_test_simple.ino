/**
 * Simple Servo Test for MG996R continuous rotation
 * Tests both servos independently
 * No WiFi, No Firestore, just servo diagnostics
 */

#include <Servo.h>

#define SERVO_PIN_1 D4  // KitKat
#define SERVO_PIN_2 D5  // Lays

Servo servo1, servo2;

#define SERVO_FORWARD 120
#define SERVO_STOP 90

void setup() {
        Serial.begin(115200);
        delay(1000);
        Serial.println("\n=== SERVO TEST ===\n");
        
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
        test();
}

void loop() {
        // Do nothing
        delay(1000);
}

void test() {
        Serial.println("\nTest 1: Servo 1 (D4) rotating for 3 seconds...");
        servo1.write(SERVO_FORWARD);
        delay(3000);
        servo1.write(SERVO_STOP);
        Serial.println("Done.\n");
        
        delay(2000);
        
        Serial.println("Test 2: Servo 2 (D5) rotating for 3 seconds...");
        servo2.write(SERVO_FORWARD);
        delay(3000);
        servo2.write(SERVO_STOP);
        Serial.println("Done.\n");
        
        delay(2000);
        
        Serial.println("Test 3: Both servos rotating together for 3 seconds...");
        servo1.write(SERVO_FORWARD);
        servo2.write(SERVO_FORWARD);
        delay(3000);
        servo1.write(SERVO_STOP);
        servo2.write(SERVO_STOP);
        Serial.println("Done.\n");
        
        Serial.println("=== ALL TESTS COMPLETE ===");
        Serial.println("If servos didn't move:");
        Serial.println("1. Check external 5V power supply (not ESP8266 3.3V)");
        Serial.println("2. Check servo GND is connected to ESP8266 GND");
        Serial.println("3. Verify servo signal wires: D4 and D5");
}
