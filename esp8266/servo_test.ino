/**
 * Servo Test — Simple diagnostic sketch
 * Tests if servos rotate on D4 and D5
 * DO NOT use D3 (GPIO0) - it's the BOOT pin!
 */

#include <Servo.h>

#define SERVO_PIN_1 D4  // GPIO2 - Good for servos
#define SERVO_PIN_2 D5  // GPIO14 - Better than D3!
#define LED_PIN LED_BUILTIN

Servo servo1;
Servo servo2;

void setup()
{
        Serial.begin(115200);
        delay(100);
        Serial.println("\n=== Servo Test ===");
        
        pinMode(LED_PIN, OUTPUT);
        digitalWrite(LED_PIN, HIGH);
        
        Serial.println("Attempting to attach servos...");
        
        if (servo1.attach(SERVO_PIN_1)) {
                Serial.println("✓ Servo 1 attached to D4 (GPIO2)");
        } else {
                Serial.println("✗ FAILED to attach Servo 1 to D4");
        }
        
        if (servo2.attach(SERVO_PIN_2)) {
                Serial.println("✓ Servo 2 attached to D5 (GPIO14)");
        } else {
                Serial.println("✗ FAILED to attach Servo 2 to D5");
        }
        
        // Both to neutral
        servo1.write(90);
        servo2.write(90);
        delay(1000);
        
        Serial.println("\nStarting servo test loop...");
}

void loop()
{
        Serial.println("\n--- Rotating Servo 1 (D4) ---");
        digitalWrite(LED_PIN, LOW);
        servo1.write(120);  // Forward
        delay(2000);
        servo1.write(90);   // Stop
        delay(500);
        digitalWrite(LED_PIN, HIGH);
        
        delay(3000);
        
        Serial.println("--- Rotating Servo 2 (D5) ---");
        digitalWrite(LED_PIN, LOW);
        servo2.write(120);  // Forward
        delay(2000);
        servo2.write(90);   // Stop
        delay(500);
        digitalWrite(LED_PIN, HIGH);
        
        delay(3000);
}
