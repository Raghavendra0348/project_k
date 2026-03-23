# Arduino Code Generation Prompt

Use this prompt with ChatGPT, Claude, or another AI to generate the complete Arduino code from scratch.

---

## Prompt for Another AI

```
Generate a complete Arduino sketch for an ESP8266 vending machine controller with the following requirements:

HARDWARE:
- Board: ESP8266 NodeMCU 1.0 (or D1 Mini)
- 2x MG996R 360° continuous-rotation servos
  - Water servo: D4 (GPIO2) 
  - Cola servo: D7 (GPIO13)
  - Control: 90°=stop, 120°=forward rotation, 60°=reverse
  - Spin time: 2000ms per dispense
  - Power: External 5V supply (NOT GPIO power)
- LCD Display: 16x2 I2C (address 0x27, SDA=D2/GPIO4, SCL=D1/GPIO5)
- Onboard LED (active-low: LOW=on, HIGH=off)
- WiFi: Standard ESP8266 connectivity

FIRESTORE/BACKEND:
- Firebase Project: vending-machine-web
- Firestore collection: dispenseQueue
- Machine ID: machine-001 (must match exactly)
- Emulator: http://10.243.190.110:8080 (development)
- Production: firestore.googleapis.com
- API Key: AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84
- WiFi SSID: Password
- WiFi Password: username

FIRESTORE QUERY:
Poll every 3 seconds for documents where machineId="machine-001" AND status="pending"
Use structured query POST to /v1/projects/vending-machine-web/databases/(default)/documents:runQuery

DOCUMENT STRUCTURE:
{
  "machineId": "machine-001",
  "productId": "prod-001-coke",
  "orderId": "...",
  "status": "pending",
  "command": "DISPENSE"
}

PRODUCT MAPPING (productId → servo):
- prod-001-water → D4 (water)
- prod-001-water-1l → D4 (water)
- prod-001-bisleri → D4 (water)
- prod-001-coke → D7 (cola)
- prod-001-pepsi → D7 (cola)
- prod-001-frooti → D7 (cola)

FUNCTIONALITY:
1. Initialize WiFi, servos, LCD, and LED on startup
2. Poll Firestore every 3 seconds for pending orders
3. Parse JSON response using ArduinoJson library
4. Extract productId and look up correct servo pin
5. Rotate servo (LED ON → write 120° → wait 2000ms → write 90° → LED OFF)
6. Update Firestore document status from "pending" to "completed" via PATCH request
7. Handle errors and retry up to 3 times with 5-second cooldown
8. Display status on LCD (16x2 I2C)
9. Prevent duplicate order processing

OUTPUT REQUIREMENTS:
- Serial monitor (115200 baud) with debug messages
- LCD displaying real-time status
- Blinking LED during WiFi connection and after successful dispense

LIBRARIES:
- ArduinoJson (v6.x) for JSON parsing
- LiquidCrystal_I2C for LCD control
- ESP8266WiFi, ESP8266HTTPClient for networking
- Servo, Wire (built-in)

CODE STRUCTURE:
- Configurable constants at top (#define)
- Struct for product mapping
- Functions: setup(), loop(), connectWiFi(), pollDispenseQueue(), getServoForProduct(), dispense(), markCompleted(), baseURL(), httpBegin(), lcdShow(), blinkLED()
- Global variables for tracking last processed order and failure count

Use #define USE_EMULATOR to toggle between development (emulator) and production (real Firebase)
```

---

## How to Use This Prompt

1. Copy the prompt above (starting from "Generate a complete Arduino sketch...")
2. Paste it into:
   - ChatGPT: https://chat.openai.com
   - Claude: https://claude.ai
   - Or any other AI code generator
3. Ask the AI to generate the complete `.ino` file
4. Review the generated code for:
   - Correct pin assignments
   - Proper JSON parsing
   - Firestore query structure
   - Product mapping logic
   - Retry logic with cooldown
5. Test with your hardware

---

## Key Things to Verify in Generated Code

- [ ] Servo PWM range is 1000-2000µs
- [ ] Product ID comparison is exact string match (case-sensitive)
- [ ] Defaults to D4 (water) if no product match found
- [ ] PATCH request includes `updateMask.fieldPaths=status` in URL
- [ ] Firestore response is parsed as JSON array
- [ ] `lastProcessedDispId` prevents duplicate processing
- [ ] Retry logic respects `RETRY_COOLDOWN_MS` (5 seconds)
- [ ] LCD shows status in real-time
- [ ] Structured query matches: `machineId == "machine-001" AND status == "pending"`
- [ ] Serial output includes debug messages for troubleshooting

