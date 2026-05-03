# ESP8266 Vending Machine Controller - Project Specification

## 📋 Project Overview
Build a complete Arduino/ESP8266 vending machine controller that:
- Polls Firebase Firestore for product orders
- Dispenses products using 2 servo motors
- Displays status on 16x2 I2C LCD display
- Retries failed operations automatically
- Updates order status back to Firestore

---

## 🔧 Hardware Specifications

### Microcontroller
- **Board**: ESP8266 (NodeMCU 1.0 or D1 Mini)
- **Baud Rate**: 115200
- **WiFi**: IEEE 802.11 b/g/n

### Servo Motors (2x)
- **Type**: MG996R 360° Continuous Rotation Servo
- **Signal Wire 1 (Water/Bisleri)**: D4 (GPIO2)
- **Signal Wire 2 (Cola/Beverages)**: D7 (GPIO13)
- **Servo Pulse Range**: 1000-2000µs
- **Control Logic**:
  - 90° = Stop (neutral)
  - 120° = Forward rotation (clockwise, fast)
  - 60° = Reverse rotation (counter-clockwise, fast)
- **Spin Time**: 2000ms per dispense
- **CRITICAL**: Servo power supply must be external 5V (NOT from ESP GPIO)
  - Servo VCC (red) → External 5V power supply
  - Servo GND (black) → Common GND (ESP + external PSU)
  - Servo Signal (yellow) → GPIO pin

### LCD Display
- **Type**: 16x2 I2C Liquid Crystal Display
- **Address**: 0x27 (if not detected, try 0x3F)
- **SDA Pin**: D2 (GPIO4)
- **SCL Pin**: D1 (GPIO5)
- **Rows**: 2, **Columns**: 16

### LEDs/Status
- **Onboard LED**: LED_BUILTIN (active-low: LOW=on, HIGH=off)

---

## 🌩️ Firebase/Firestore Configuration

### Project Details
- **Project ID**: vending-machine-web
- **API Key**: AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84
- **Database**: Firestore (default)

### Emulator Configuration (Development)
- **Host**: 10.243.190.110
- **Port**: 8080
- **Use HTTPS**: false (HTTP for emulator)
- **Toggle**: `#define USE_EMULATOR true`

### Production Configuration
- **Host**: firestore.googleapis.com
- **Port**: 443
- **Use HTTPS**: true

### Machine Identity
- **Machine ID**: "machine-001" (must match exactly in Firestore documents)

---

## 📦 Collection: `dispenseQueue`

### Document Structure
Each pending order is a Firestore document with these fields:

```json
{
  "machineId": "machine-001",
  "status": "pending",
  "productId": "prod-001-coke",
  "orderId": "VIbcaYP9rEaBwa5wDKHo",
  "command": "DISPENSE"
}
```

### Document Fields
| Field | Type | Description |
|-------|------|-------------|
| `machineId` | String | Must equal `"machine-001"` |
| `status` | String | Query filter: `"pending"` (updated to `"completed"` after dispense) |
| `productId` | String | Product ID string (exact match required for mapping) |
| `orderId` | String | Unique order identifier |
| `command` | String | Usually `"DISPENSE"` |

### Firestore Query
**Structured Query** to fetch all pending orders for this machine:
```json
{
  "structuredQuery": {
    "from": [{"collectionId": "dispenseQueue"}],
    "where": {
      "compositeFilter": {
        "op": "AND",
        "filters": [
          {
            "fieldFilter": {
              "field": {"fieldPath": "machineId"},
              "op": "EQUAL",
              "value": {"stringValue": "machine-001"}
            }
          },
          {
            "fieldFilter": {
              "field": {"fieldPath": "status"},
              "op": "EQUAL",
              "value": {"stringValue": "pending"}
            }
          }
        ]
      }
    },
    "limit": 1
  }
}
```

---

## 🎯 Product Mapping

### Product ID → Servo Pin Mapping

| Product ID | Product Name | Servo Pin | Motor |
|------------|--------------|-----------|-------|
| `prod-001-water` | Water | D4 | Water/Bisleri |
| `prod-001-water-1l` | Water 1L | D4 | Water/Bisleri |
| `prod-001-bisleri` | Bisleri Water | D4 | Water/Bisleri |
| `prod-001-coke` | Coca Cola | D7 | Cola/Beverages |
| `prod-001-pepsi` | Pepsi | D7 | Cola/Beverages |
| `prod-001-frooti` | Frooti Drink | D7 | Cola/Beverages |

**Important**: Product IDs must match **exactly** (case-sensitive). If no match found, defaults to D4 (water servo).

---

## 🔄 Application Flow

### Initialization (Setup Phase)

1. **Serial Monitor** (115200 baud)
   - Print startup message

2. **LCD Initialization**
   - I2C Wire begin (SDA=D2, SCL=D1)
   - Display "Vending Machine" / "Starting..."

3. **LED Setup**
   - Set pin mode to OUTPUT
   - Initialize to HIGH (off)

4. **Servo Attachment**
   - Attach Water Servo to D4 with PWM range 1000-2000µs
   - Set initial position to SERVO_STOP (90°)
   - Attach Cola Servo to D7 with PWM range 1000-2000µs
   - Set initial position to SERVO_STOP (90°)

5. **WiFi Connection**
   - Connect to SSID "Password" with password "username"
   - Display IP address on LCD
   - Blink LED 3 times (150ms intervals)

### Main Loop (Polling Phase)

**Interval**: Every 3000ms (3 seconds)

1. **Check WiFi Status**
   - If disconnected, reconnect automatically

2. **Poll Firestore** (HTTP POST to `:runQuery` endpoint)
   - Send structured query for pending orders
   - Handle HTTP errors

3. **Parse JSON Response**
   - Extract document path, dispenseId, productId, orderId
   - Handle empty results gracefully

4. **Duplicate Prevention**
   - Track `lastProcessedDispId`
   - Skip if same dispense command is repeated

### Dispense Flow (When Order Found)

1. **Display Order on LCD**
   - Show "Order Received!" and product ID

2. **Lookup Servo**
   - Call `getServoForProduct(productId)`
   - Match product ID against mapping table
   - Return servo pin (D4 or D7)
   - If no match, default to D4

3. **Dispense**
   - Turn LED ON (LOW)
   - Write SERVO_FORWARD (120°) to selected servo
   - Wait 2000ms for rotation
   - Write SERVO_STOP (90°) to stop
   - Turn LED OFF (HIGH)

4. **Update Firestore Status** (HTTP PATCH)
   - Update document: `status` = `"completed"`
   - Wait for successful response (HTTP 200)

5. **Display Result on LCD**
   - Show "Dispensed OK!" on success
   - Show "Error updating!" on failure

6. **Retry Logic** (if update fails)
   - Track failure count and timestamp
   - Retry up to 3 times
   - Wait 5 seconds between retries
   - Give up after MAX_RETRIES

---

## ⚙️ Configuration Constants

```cpp
#define WIFI_SSID "Password"           // Your WiFi network name
#define WIFI_PASSWORD "username"        // Your WiFi password
#define FIREBASE_PROJECT_ID "vending-machine-web"
#define API_KEY "AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84"
#define USE_EMULATOR true               // true=emulator, false=production
#define EMULATOR_HOST "10.243.190.110"
#define EMULATOR_FIRESTORE_PORT 8080
#define MACHINE_ID "machine-001"
#define SERVO_PIN_WATER D4
#define SERVO_PIN_COLA D7
#define LED_PIN LED_BUILTIN
#define SERVO_FORWARD 120               // Rotation speed/direction
#define SERVO_STOP 90                   // Neutral position
#define DISPENSE_TIME_MS 2000           // How long to spin
#define POLL_INTERVAL_MS 3000           // Check every 3 seconds
#define MAX_RETRIES 3                   // Retry attempts
#define RETRY_COOLDOWN_MS 5000          // Wait between retries
#define LCD_ADDRESS 0x27                // LCD I2C address
#define LCD_COLS 16
#define LCD_ROWS 2
```

---

## 📚 Required Libraries

Install via Arduino Library Manager:

1. **ArduinoJson** by Benoit Blanchon (v6.x)
   - JSON parsing for Firestore responses
   - Search: "ArduinoJson"

2. **LiquidCrystal_I2C** by Frank de Brabander
   - LCD display control
   - Search: "LiquidCrystal_I2C"

3. **ESP8266WiFi** (built-in with ESP8266 board)
4. **ESP8266HTTPClient** (built-in with ESP8266 board)
5. **Servo** (built-in with ESP8266 board)
6. **Wire** (built-in, for I2C)

---

## 📡 HTTP API Endpoints

### 1. Query Pending Orders (POST)
**Endpoint**: `http://[EMULATOR_HOST]:[PORT]/v1/projects/[PROJECT_ID]/databases/(default)/documents:runQuery?key=[API_KEY]`

**Request Body**: Structured query (JSON)

**Response**: JSON array with documents matching criteria

---

### 2. Update Order Status (PATCH)
**Endpoint**: `http://[EMULATOR_HOST]:[PORT]/v1/projects/[PROJECT_ID]/databases/(default)/documents/dispenseQueue/[DISPENSE_ID]?updateMask.fieldPaths=status&key=[API_KEY]`

**Request Body**:
```json
{
  "fields": {
    "status": {
      "stringValue": "completed"
    }
  }
}
```

**Response**: HTTP 200 = success

---

## 🛠️ Code Architecture

### Main Functions Required

| Function | Purpose |
|----------|---------|
| `setup()` | Initialize all hardware (servos, LCD, WiFi, LED) |
| `loop()` | Main polling loop; check interval and call `pollDispenseQueue()` |
| `connectWiFi()` | Establish WiFi connection with retry |
| `pollDispenseQueue()` | Query Firestore, parse response, handle dispense |
| `getServoForProduct(String productId)` | Lookup servo pin for product ID |
| `dispense(String productId, int servoPin)` | Control servo motor rotation |
| `markCompleted(String dispId)` | Update Firestore document status |
| `baseURL()` | Build Firestore REST endpoint URL |
| `httpBegin(HTTPClient &http, String url)` | Initialize HTTP/HTTPS connection |
| `lcdShow(String line1, String line2)` | Update LCD display |
| `blinkLED(int n, int ms)` | Blink onboard LED n times |

---

## 🔍 Serial Monitor Output (Expected)

**Startup**:
```
=== ESP8266 Vending Machine (2 Servo) ===
>>> SERVO INITIALIZATION <<<
Attaching Water Servo to D4...
✓ Water Servo (D4) attached
Attaching Cola Servo to D7...
✓ Cola Servo (D7) attached
>>> ALL SERVOS INITIALIZED <<<

WiFi connecting..........
WiFi OK!
192.168.x.x
Setup done. Polling started.
Machine ID : machine-001
```

**Polling**:
```
--- Polling dispenseQueue ---
POST http://10.243.190.110:8080/v1/projects/vending-machine-web/databases/(default)/documents:runQuery?key=...
HTTP 200
Response (first 500):
[...]
```

**Order Found**:
```
***** DISPENSE COMMAND FOUND *****
  dispenseId : AxQCnFcTsOsBe3hmdlNF
  productId  : [prod-001-coke]
  orderId    : VIbcaYP9rEaBwa5wDKHo

--- Looking up servo for product ---
Product ID: prod-001-coke
  Checking [prod-001-water]
  Checking [prod-001-coke] ✓ MATCH!
✓ Using Servo: Coca Cola

>>> DISPENSE FUNCTION CALLED <<<
Writing SERVO_FORWARD: 120
Spinning for 2000 ms...
Writing SERVO_STOP: 90
✓ Servo command complete

--- Updating Firestore status ---
PATCH Response code: 200
✓ Status updated successfully!
✓ DISPENSE SUCCESS
***** DISPENSE DONE *****
```

---

## 🐛 Debugging Tips

1. **Servo not rotating**: Check external 5V power supply connection
2. **WiFi connection failing**: Verify SSID/password in code
3. **Firestore not responding**: Check emulator is running (`firebase emulators:start`)
4. **LCD not showing text**: Try LCD address 0x3F instead of 0x27
5. **Product always defaults to D4**: Check product ID format in Firestore vs. code (case-sensitive!)

---

## 📝 Notes

- The code uses **continuous-rotation servos**, not standard servos
- Always provide **external 5V power** to servos (do NOT use ESP GPIO 3.3V)
- Product IDs must match **exactly** between Firestore and the mapping table
- Retry logic automatically handles transient Firestore failures
- LCD will show real-time status updates

