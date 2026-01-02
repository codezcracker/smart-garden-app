# ESP32 Arduino IDE Setup Instructions

## Error: `WiFi.h: No such file or directory`

This means the ESP32 board support isn't installed or selected. Follow these steps:

---

## Step 1: Install ESP32 Board Support in Arduino IDE

### For Arduino IDE 2.x (Recommended):
1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Boards Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**
5. Go to **Tools → Board → Boards Manager**
6. Search for **"esp32"**
7. Install **"esp32 by Espressif Systems"** (latest version, usually 2.x or 3.x)
8. Wait for installation to complete (may take a few minutes)

### For Arduino IDE 1.8.x:
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add the URL above to "Additional Board Manager URLs"
4. Go to **Tools → Board → Boards Manager**
5. Search and install **"esp32 by Espressif Systems"**

---

## Step 2: Select the Correct Board

1. Go to **Tools → Board**
2. Scroll down to **ESP32 Arduino** section
3. Select **"ESP32 Dev Module"** or **"DOIT ESP32 DEVKIT V1"**

---

## Step 3: Configure Board Settings

After selecting the board, configure these settings in **Tools** menu:

- **Board**: "ESP32 Dev Module" or "DOIT ESP32 DEVKIT V1"
- **Upload Speed**: 115200
- **CPU Frequency**: 240MHz
- **Flash Frequency**: 80MHz
- **Flash Mode**: QIO
- **Flash Size**: 4MB (32Mb)
- **Partition Scheme**: Default 4MB with spiffs
- **Core Debug Level**: None (or "Info" for debugging)
- **Port**: Select your ESP32's COM port (e.g., COM3, /dev/ttyUSB0)

---

## Step 4: Install Required Libraries

Go to **Tools → Manage Libraries** and install:

1. **ArduinoJson** by Benoit Blanchon (version 6.x)
   - Search: "ArduinoJson"
   - Click Install

**Note**: WiFi.h, HTTPClient.h, and WiFiClientSecure.h come with ESP32 board support - no separate installation needed!

---

## Step 5: Connect Your ESP32

1. Connect ESP32 to computer via USB cable
2. Wait for drivers to install (Windows may need CH340 or CP2102 drivers)
3. Go to **Tools → Port** and select the COM port that appears

### Finding the Port:
- **Windows**: Look for "COM3", "COM4", etc.
- **Mac**: Look for "/dev/cu.usbserial-XXXX" or "/dev/cu.SLAB_USBtoUART"
- **Linux**: Look for "/dev/ttyUSB0" or "/dev/ttyACM0"

---

## Step 6: Upload the Firmware

1. Open `SmartGardenESP32_Laser.ino` in Arduino IDE
2. Click **Verify** button (✓) to compile
3. If compilation succeeds, click **Upload** button (→)
4. Wait for upload to complete
5. Open **Serial Monitor** (Tools → Serial Monitor)
6. Set baud rate to **115200**
7. Press the **RST** button on ESP32 to see startup messages

---

## Troubleshooting

### If you still get "WiFi.h not found":
1. Close and restart Arduino IDE
2. Make sure ESP32 board is selected (not Arduino Uno or other board)
3. Try re-installing ESP32 board support
4. Check that the board package installed correctly

### If upload fails:
1. Hold the **BOOT** button on ESP32 while clicking upload
2. Release BOOT button when "Connecting..." appears
3. Try different USB cable (some are charge-only)
4. Try different USB port

### If Serial Monitor shows garbage:
- Make sure baud rate is set to **115200**

### Common Driver Issues:
- **Windows**: You may need to install CH340 or CP2102 USB drivers
- **Mac**: Usually works without additional drivers
- **Linux**: You may need to add your user to the `dialout` group:
  ```bash
  sudo usermod -a -G dialout $USER
  ```
  Then log out and log back in.

---

## Quick Checklist

Before uploading:
- [ ] ESP32 board support installed
- [ ] Board selected: "ESP32 Dev Module" or "DOIT ESP32 DEVKIT V1"
- [ ] ArduinoJson library installed
- [ ] ESP32 connected via USB
- [ ] Correct COM port selected
- [ ] WiFi credentials updated in firmware (ssid and password)
- [ ] Server URL correct

---

## Next Steps

After successful upload:
1. Open Serial Monitor (115200 baud)
2. You should see:
   ```
   🔴 Smart Garden ESP32 - Laser Control Firmware
   📡 Formatted MAC Address: XXXXXXXXXXXX
   ✅ WiFi connected!
   📤 Polling for commands...
   ```
3. Go to your web app at `/laser-control`
4. Refresh the page
5. Your ESP32 device should appear in the dropdown
6. Click the laser button to test!

---

## Still Having Issues?

Share your Serial Monitor output and the exact error message you're seeing.

