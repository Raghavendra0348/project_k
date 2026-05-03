/**
 * Servo Diagnostic Test
 * Tests each servo individually to identify power/pin issues
 */

#include <Servo.h>

#define SERVO_PIN_1 D3  // GPIO0
#define SERVO_PIN_2 D4  // GPIO2
#define SERVO_PIN_3 D5  // GPIO14
#define SERVO_PIN_4 D6  // GPIO12
#define SERVO_PIN_5 D7  // GPIO13
#define SERVO_PIN_6 D8  // GPIO15

Servo servo1, servo2, servo3, servo4, servo5, servo6;

void setup()
{
        Serial.begin(115200);
        delay(100);
        Serial.println("\n=== SERVO DIAGNOSTIC TEST ===\n");
        
        Serial.println("Attempting to attach servos...");
        Serial.println();
        
        // Test each servo individually
        testServo(1, SERVO_PIN_1, &servo1);
        testServo(2, SERVO_PIN_2, &servo2);
        testServo(3, SERVO_PIN_3, &servo3);
        testServo(4, SERVO_PIN_4, &servo4);
        testServo(5, SERVO_PIN_5, &servo5);
        testServo(6, SERVO_PIN_6, &servo6);
        
        Serial.println("\n✓ Setup complete. Starting rotation test...\n");
}

void testServo(int num, int pin, Servo* servo)
{
        Serial.print("Servo ");
        Serial.print(num);
        Serial.print(" (Pin ");
        Serial.print(pin);
        Serial.print("): ");
        
        if (servo->attach(pin)) {
                Serial.println("✓ ATTACHED");
                servo->write(90);  // neutral
        } else {
                Serial.println("✗ FAILED TO ATTACH");
        }
}

void loop()
{
        // Test servo 1
        Serial.println("\n--- Testing Servo 1 (D3) ---");
        testRotation(&servo1);
        delay(2000);
        
        // Test servo 2
        Serial.println("--- Testing Servo 2 (D4) ---");
        testRotation(&servo2);
        delay(2000);
        
        // Test servo 3
        Serial.println("--- Testing Servo 3 (D5) ---");
        testRotation(&servo3);
        delay(2000);
        
        // Test servo 4
        Serial.println("--- Testing Servo 4 (D6) ---");
        testRotation(&servo4);
        delay(2000);
        
        // Test servo 5
        Serial.println("--- Testing Servo 5 (D7) ---");
        testRotation(&servo5);
        delay(2000);
        
        // Test servo 6
        Serial.println("--- Testing Servo 6 (D8) ---");
        testRotation(&servo6);
        delay(2000);
}

void testRotation(Servo* servo)
{
        Serial.println("Rotating...");
        servo->write(120);  // Forward
        delay(1500);
        servo->write(90);   // Stop
        Serial.println("Done.");
}
