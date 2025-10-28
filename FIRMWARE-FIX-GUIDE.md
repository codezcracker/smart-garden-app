# Firmware Fix Implementation Guide

## 📋 Summary of Changes

### Old Firmware Issues ❌
1. **NOT Real-Time:** 30-second intervals via HTTP POST
2. **Missing Data:** Temperature and Humidity hardcoded to 0.0
3. **Incomplete Sensors:** Only Moisture + Light working
4. **Wrong Protocol:** HTTP polling instead of WebSocket
5. **Pin Conflicts:** DHT11 disabled due to button on GPIO4

### Fixed Firmware Features ✅
1. **Real-Time:** 5-second intervals via WebSocket
2. **Complete Data:** All sensors working (Temp, Humidity, Moisture, Light)
3. **All Sensors Enabled:** DHT11 + Moisture + Light + WiFi RSSI
4. **WebSocket Protocol:** Bidirectional real-time communication
5. **Pin Conflicts Resolved:** Button moved to GPIO14

---

## 📊 Before vs After Comparison

| Feature | Old Firmware | Fixed Firmware |
|---------|-------------|----------------|
| **Update Frequency** | 30 seconds | 5 seconds |
| **Communication** | HTTP POST | WebSocket |
| **Temperature** | 0.0 (disabled) | ✅ Real DHT11 readings |
| **Humidity** | 0.0 (disabled) | ✅ Real DHT11 readings |
| **Soil Moisture** | ✅ Working | ✅ Working |
| **Light Level** | ✅ Working | ✅ Working |
| **Real-Time** | ❌ No | ✅ Yes |
| **Pin Conflicts** | ⚠️ DHT11 disabled | ✅ All resolved |
| **Latency** | 30 seconds | < 5 seconds |
| **Data Loss** | Possible | Buffered |
| **Bidirectional** | ❌ No | ✅ Yes |

---

## 🔧 Hardware Pin Changes

### Old Pin Assignment (CONFLICT)
```
BUTTON_PIN   = GPIO 4  (D2) ❌ Conflicts with DHT11
DHT_PIN      = (disabled)   ❌ Not used
RGB_RED      = GPIO 14 (D5)
RGB_GREEN    = GPIO 12 (D6)
RGB_BLUE     = GPIO 13 (D7)
BUZZER_PIN   = GPIO 5  (D1)
MOISTURE_PIN = A0
LDR_PIN      = GPIO 16 (D0)
```

### New Pin Assignment (FIXED)
```
BUTTON_PIN   = GPIO 14 (D5) ✅ Moved from GPIO 4
DHT_PIN      = GPIO 4  (D2) ✅ NOW ENABLED
RGB_RED      = GPIO 15 (D8) ✅ Moved from GPIO 14
RGB_GREEN    = GPIO 12 (D6) ✅ Same
RGB_BLUE     = GPIO 13 (D7) ✅ Same
BUZZER_PIN   = GPIO 5  (D1) ✅ Same
MOISTURE_PIN = A0           ✅ Same
LDR_PIN      = GPIO 16 (D0) ✅ Same
```

### 🔌 Wiring Changes Required

**You need to rewire these connections:**

1. **Button:** Move from GPIO 4 (D2) → GPIO 14 (D5)
2. **DHT11 Data Pin:** Connect to GPIO 4 (D2)
3. **RGB Red LED:** Move from GPIO 14 (D5) → GPIO 15 (D8)

---

## 📦 Required Libraries

You need to install these Arduino libraries:

### 1. WebSocketsClient Library
```
Library Manager: Search for "WebSocketsClient by Markus Sattler"
Or manually: https://github.com/Links2004/arduinoWebSockets
```

### 2. Existing Libraries (Already have)
- ✅ ESP8266WiFi
- ✅ ESP8266HTTPClient
- ✅ ArduinoJson
- ✅ EEPROM
- ✅ DHT sensor library

---

## 📝 Installation Steps

### Step 1: Install WebSocket Library

**Option A: Using Arduino IDE Library Manager**
```
1. Open Arduino IDE
2. Go to Sketch → Include Library → Manage Libraries
3. Search for "WebSocketsClient"
4. Install "WebSocketsClient by Markus Sattler"
5. Restart Arduino IDE
```

**Option B: Manual Installation**
```bash
cd ~/Documents/Arduino/libraries/
git clone https://github.com/Links2004/arduinoWebSockets.git WebSockets
```

### Step 2: Update Hardware Wiring

**IMPORTANT:** Power off your device before making any changes!

1. **Disconnect button from GPIO 4 (D2)**
2. **Connect button to GPIO 14 (D5)**
3. **Connect DHT11 data pin to GPIO 4 (D2)**
4. **Move RGB Red LED from GPIO 14 (D5) to GPIO 15 (D8)**

**DHT11 Wiring:**
```
DHT11 Pin 1 (VCC)   → 3.3V or 5V
DHT11 Pin 2 (Data)  → GPIO 4 (D2)
DHT11 Pin 3 (NC)    → Not connected
DHT11 Pin 4 (GND)   → GND

Note: Add 10kΩ pull-up resistor between VCC and Data pin
```

### Step 3: Update Firmware

1. **Backup current firmware:**
   ```bash
   cp SmartGardenESP8266.ino SmartGardenESP8266_OLD.ino
   ```

2. **Replace with fixed version:**
   ```bash
   cp SmartGardenESP8266_FIXED.ino SmartGardenESP8266.ino
   ```

3. **Upload to ESP8266:**
   - Open `SmartGardenESP8266.ino` in Arduino IDE
   - Select Board: "NodeMCU 1.0 (ESP-12E Module)"
   - Select correct COM port
   - Click Upload

### Step 4: Verify WebSocket Server

Make sure your server is running with WebSocket support:

```bash
cd /Users/mano/Desktop/smart-garden-app
yarn dev
```

The WebSocket server should be listening on:
```
ws://192.168.0.64:3000/api/iot/websocket
```

### Step 5: Test the System

1. **Open Serial Monitor** (115200 baud)
2. **Look for these messages:**
   ```
   🌱 Smart Garden IoT - FIXED VERSION with Real-Time WebSocket
   ✅ DHT11 sensor initialized on GPIO4
   🟢 WebSocket Connected
   📤 Device registration sent via WebSocket
   ✅ Device registered successfully
   ```

3. **Check sensor readings every 5 seconds:**
   ```
   📊 Sensor Data (Real-Time via WebSocket):
   🌡️ Temperature: 25.3°C
   💧 Humidity: 62%
   🌱 Soil Moisture: 45%
   ☀️ Light Level: 78%
   🔌 WebSocket: CONNECTED
   ```

---

## 🧪 Testing Checklist

### Hardware Tests
- [ ] Button on GPIO 14 works (test power toggle - 5s hold)
- [ ] Button on GPIO 14 works (test discovery - 2s hold)
- [ ] DHT11 on GPIO 4 reads temperature
- [ ] DHT11 on GPIO 4 reads humidity
- [ ] Moisture sensor on A0 works
- [ ] Light sensor on GPIO 16 works
- [ ] RGB LED Red on GPIO 15 works
- [ ] RGB LED Green on GPIO 12 works
- [ ] RGB LED Blue on GPIO 13 works
- [ ] Buzzer on GPIO 5 works

### Software Tests
- [ ] WebSocket connects successfully
- [ ] Device registers on WebSocket
- [ ] Data sends every 5 seconds
- [ ] All sensor values are real (not 0.0)
- [ ] Temperature readings are accurate
- [ ] Humidity readings are accurate
- [ ] Data appears in dashboard in real-time
- [ ] Device reconnects after WiFi loss
- [ ] Discovery mode works
- [ ] Power toggle works

---

## 📈 Expected Results

### Serial Monitor Output (Success)
```
🌱 Smart Garden IoT - FIXED VERSION with Real-Time WebSocket
🔧 All sensors enabled: DHT11, Moisture, Light
🔧 Testing Hardware Components...
✅ DHT11 working! Temp: 24.5°C, Humidity: 55%
✅ Hardware testing complete!
📶 Connecting to WiFi...
✅ WiFi connected!
📡 IP address: 192.168.0.123
🔌 Initializing WebSocket connection...
✅ WebSocket configured
🟢 WebSocket Connected
📤 Device registration sent via WebSocket
✅ Device registered successfully
🚀 Device initialized successfully!
🆔 Device ID: DB1234
📡 WebSocket enabled for real-time communication

📊 Sensor Data (Real-Time via WebSocket):
🌡️ Temperature: 24.5°C
💧 Humidity: 55%
🌱 Soil Moisture: 45% (Raw: 120)
☀️ Light Level: 78% (Raw: 798)
📶 WiFi RSSI: -45 dBm
🔌 WebSocket: CONNECTED
✅ Data sent successfully via WebSocket
```

### Dashboard Results
- **Update frequency:** Every 5 seconds
- **Temperature:** Real values (e.g., 20-30°C)
- **Humidity:** Real values (e.g., 40-80%)
- **Soil Moisture:** Real values (e.g., 0-100%)
- **Light Level:** Real values (e.g., 0-100%)
- **Connection status:** Real-time indicator
- **Latency:** < 1 second

---

## 🐛 Troubleshooting

### Issue: WebSocket Won't Connect
**Symptoms:** Red LED, "WebSocket Disconnected" in serial monitor

**Solutions:**
1. Check server is running: `yarn dev`
2. Verify server address in firmware: `192.168.0.64:3000`
3. Check firewall settings
4. Verify WebSocket path: `/api/iot/websocket`

### Issue: DHT11 Returns NaN
**Symptoms:** Temperature and Humidity show 0.0 or NaN

**Solutions:**
1. Check DHT11 wiring (VCC, Data to GPIO 4, GND)
2. Add 10kΩ pull-up resistor between VCC and Data
3. Try different DHT11 sensor (might be faulty)
4. Check power supply (DHT11 needs stable 3.3V or 5V)
5. Verify GPIO 4 is not used by anything else

### Issue: Button Not Working
**Symptoms:** Can't toggle power or enter discovery mode

**Solutions:**
1. Verify button moved to GPIO 14 (D5)
2. Check button wiring (should connect GPIO 14 to GND when pressed)
3. Test with multimeter
4. Check for loose connections

### Issue: Compilation Error
**Error:** `WebSocketsClient.h: No such file or directory`

**Solution:**
1. Install WebSocketsClient library (see Step 1)
2. Restart Arduino IDE
3. Verify library is in: `~/Documents/Arduino/libraries/`

### Issue: Data Still Shows 0.0
**Check:**
1. DHT11 is connected to GPIO 4 (not disabled)
2. DHT sensor initialized correctly
3. Read serial monitor for error messages
4. Try unplugging and replugging DHT11

---

## 🔄 Rollback Plan

If something goes wrong, you can easily rollback:

### Quick Rollback
```bash
# Restore old firmware
cd SmartGardenIoT/SmartGardenESP8266/
cp SmartGardenESP8266_OLD.ino SmartGardenESP8266.ino

# Restore old wiring
# Move button back to GPIO 4
# Move RGB Red back to GPIO 14
# Disconnect DHT11
```

### Keep Both Versions
The fixed firmware is saved as:
- `SmartGardenESP8266_FIXED.ino` (new version)
- `SmartGardenESP8266.ino` (can keep old version)

You can switch between them as needed.

---

## 📞 Support

If you encounter issues:

1. **Check Serial Monitor** (115200 baud) for error messages
2. **Verify wiring** matches the new pin assignment
3. **Test sensors individually** using hardware test functions
4. **Check library versions** (WebSocketsClient 2.3.6+)
5. **Verify server** is running and accessible

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Serial monitor shows real temperature/humidity values
- ✅ Data updates every 5 seconds (not 30 seconds)
- ✅ WebSocket stays connected (green LED)
- ✅ Dashboard shows real-time updates
- ✅ All sensor values change as expected
- ✅ No more 0.0 values for temperature/humidity
- ✅ Button works on GPIO 14
- ✅ DHT11 responds correctly

---

## 📚 Additional Resources

- WebSocketsClient Library: https://github.com/Links2004/arduinoWebSockets
- DHT Sensor Library: https://github.com/adafruit/DHT-sensor-library
- ESP8266 Arduino Core: https://github.com/esp8266/Arduino
- Smart Garden Documentation: See `iot-device-build-guide.md`

---

**Last Updated:** October 23, 2025
**Version:** 2.0 (Fixed)
**Status:** Ready for deployment

