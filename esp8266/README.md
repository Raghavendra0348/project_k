# ESP8266 Vending Machine Controller

This folder contains the Arduino sketch for ESP8266 to control the vending machine dispenser.

## How It Works

1. **Payment Success** → Backend adds document to `dispenseQueue` collection in Firestore
2. **Firestore Trigger** → `syncDispenseToRTDB` function copies data to Realtime Database
3. **ESP8266** → Polls Realtime Database for pending dispense commands
4. **Dispense** → ESP8266 activates relay to dispense product
5. **Confirmation** → ESP8266 calls `esp8266ConfirmDispense` to mark as completed

## Hardware Requirements

- **ESP8266** (NodeMCU, Wemos D1 Mini, etc.)
- **Relay Module** (5V or 3.3V compatible)
- **Power Supply** (for relay and dispensing motor)
- **Vending Machine Motor/Solenoid**

## Wiring

| ESP8266 Pin | Connection |
|-------------|------------|
| D1 (GPIO5)  | Relay IN   |
| GND         | Relay GND  |
| 3V3/5V      | Relay VCC  |

## Required Arduino Libraries

Install these via Arduino Library Manager:

1. **ESP8266WiFi** - Built into ESP8266 boards package
2. **Firebase ESP8266 Client** by Mobizt
   - GitHub: https://github.com/mobizt/Firebase-ESP8266
3. **ArduinoJson** by Benoit Blanchon

## Firebase Setup

### 1. Enable Realtime Database

In Firebase Console:
1. Go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose your region
4. Start in **test mode** (for development)

### 2. Get Firebase Configuration

From Firebase Console:
1. Go to **Project Settings** → **General**
2. Copy your **Project ID**
3. Get your **Web API Key** from Project Settings

### 3. Configure Realtime Database Rules

```json
{
  "rules": {
    "dispenseQueue": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **Note**: For production, restrict access using authentication.

## ESP8266 Configuration

Edit these values in `esp8266_dispense.ino`:

```cpp
// WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase configuration
#define FIREBASE_HOST "YOUR_PROJECT_ID.firebaseio.com"
#define FIREBASE_API_KEY "YOUR_FIREBASE_API_KEY"
#define FIREBASE_PROJECT_ID "YOUR_PROJECT_ID"

// Machine configuration
#define MACHINE_ID "machine_001"  // Must match Firestore machine ID
```

## Upload Instructions

1. Install **Arduino IDE** or **PlatformIO**
2. Add ESP8266 boards:
   - Arduino IDE: Add URL `http://arduino.esp8266.com/stable/package_esp8266com_index.json` to Board Manager URLs
3. Select your board (e.g., NodeMCU 1.0)
4. Install required libraries
5. Configure WiFi and Firebase credentials
6. Upload the sketch

## Testing

1. Start your Firebase emulator:
   ```bash
   firebase emulators:start --only functions,firestore
   ```

2. Monitor ESP8266 Serial output at 115200 baud

3. Make a test payment through the web app

4. Watch the ESP8266 serial monitor for:
   ```
   === NEW DISPENSE COMMAND ===
   Order ID: abc123
   Product ID: product_001
   >>> DISPENSING PRODUCT <<<
   >>> DISPENSE COMPLETE <<<
   ```

## Troubleshooting

### WiFi Connection Issues
- Verify SSID and password
- Ensure 2.4GHz network (ESP8266 doesn't support 5GHz)
- Check WiFi signal strength

### Firebase Connection Issues
- Verify Firebase configuration values
- Check Firebase Console for Realtime Database
- Ensure database rules allow read access

### No Dispense Commands
- Verify `MACHINE_ID` matches your Firestore machine document
- Check that dispenseQueue has pending commands
- Verify Firestore → RTDB sync is working

## Production Considerations

1. **Security**: Use Firebase Authentication for ESP8266
2. **Reliability**: Add retry logic for failed dispenses
3. **Monitoring**: Log dispense attempts to Firestore
4. **Error Handling**: Handle motor jams, empty stock
5. **OTA Updates**: Enable Over-The-Air firmware updates

## API Endpoints

### Confirm Dispense (ESP8266 → Server)

```
POST /esp8266ConfirmDispense
Content-Type: application/json

{
  "dispenseId": "abc123",
  "machineId": "machine_001", 
  "status": "success",       // or "failed"
  "errorCode": null          // optional error code
}
```
