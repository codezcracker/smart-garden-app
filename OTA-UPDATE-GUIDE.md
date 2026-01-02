# 🔄 OTA (Over-The-Air) Firmware Update Guide

## Overview

OTA updates allow you to update your ESP8266 devices remotely without physically connecting them to your computer. This system supports two methods:

1. **ArduinoOTA** - Local network updates (via Arduino IDE or web interface)
2. **HTTP-based OTA** - Remote updates from server (automatic updates)

---

## 🚀 Quick Start

### Step 1: Upload OTA-Enabled Firmware

1. **Open Arduino IDE**
2. **Install required libraries:**
   - ESP8266WiFi (included)
   - ESP8266HTTPClient (included)
   - ArduinoOTA (included)
   - ArduinoJson

3. **Upload OTA firmware:**
   - File: `SmartGardenIoT/SmartGardenESP8266_OTA/SmartGardenESP8266_OTA.ino`
   - Board: "NodeMCU 1.0 (ESP-12E Module)"
   - Upload Speed: 115200
   - Click Upload

4. **Configure WiFi and OTA password in firmware:**
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* otaPassword = "smartgarden123"; // Change this!
   ```

---

## 📱 Using the Web Interface

### Upload Firmware

1. **Login as Admin or Manager**
2. **Go to Firmware Update page** (from menu)
3. **Upload new firmware:**
   - Select `.bin` file
   - Enter version (e.g., `2.1.0`)
   - Add release notes (optional)
   - Click "Upload Firmware"

### Trigger OTA Update

1. **Select device** from dropdown
2. **Select firmware version** (or leave empty for latest)
3. **Click "Trigger OTA Update"**
4. **Device will automatically:**
   - Check for updates
   - Download new firmware
   - Install and reboot

---

## 🔧 ArduinoOTA (Local Network)

### Method 1: Arduino IDE

1. **Connect device to same WiFi network**
2. **Open Arduino IDE**
3. **Tools → Port → Select device IP**
4. **Sketch → Upload Using Network**
5. **Enter OTA password** when prompted

### Method 2: Web Browser

1. **Find device IP address** (check Serial Monitor)
2. **Open browser:** `http://DEVICE_IP:8266`
3. **Enter OTA password**
4. **Upload `.bin` file**

---

## 📡 HTTP-Based OTA (Automatic)

### How It Works

1. **Device checks for updates** every hour
2. **Server compares versions**
3. **If update available:**
   - Device downloads firmware
   - Verifies checksum
   - Installs update
   - Reboots automatically

### API Endpoints

#### Check for Updates
```
GET /api/iot/firmware?deviceId=DEVICE_ID&version=CURRENT_VERSION
```

Response:
```json
{
  "updateAvailable": true,
  "currentVersion": "2.0.0",
  "latestVersion": "2.1.0",
  "firmware": {
    "version": "2.1.0",
    "downloadUrl": "/api/iot/firmware/download?id=...",
    "size": 123456,
    "checksum": "abc123...",
    "releaseNotes": "Bug fixes"
  }
}
```

#### Download Firmware
```
GET /api/iot/firmware/download?id=FIRMWARE_ID
```

#### Trigger Update
```
PUT /api/iot/firmware
{
  "deviceId": "DEVICE_ID",
  "firmwareVersion": "2.1.0"
}
```

---

## 🔒 Security

### OTA Password

- **Change default password** in firmware
- **Use strong password** (at least 8 characters)
- **Keep password secure** (don't share publicly)

### Authentication

- **API endpoints require authentication** (Bearer token)
- **Only admins/managers** can upload firmware
- **Only admins/managers** can trigger updates

---

## 📊 Firmware Version Management

### Version Format

- Use semantic versioning: `MAJOR.MINOR.PATCH`
- Example: `2.1.0`
- Increment version for each update:
  - **MAJOR**: Breaking changes
  - **MINOR**: New features
  - **PATCH**: Bug fixes

### Version Checking

- Device sends current version in sensor data
- Server compares with latest version
- Update triggered if `currentVersion < latestVersion`

---

## 🛠️ Troubleshooting

### OTA Update Fails

1. **Check WiFi connection**
2. **Verify OTA password**
3. **Check device has enough space** (ESP8266 needs ~1MB free)
4. **Verify firmware file is valid `.bin`**
5. **Check Serial Monitor for error messages**

### Device Not Updating

1. **Check device is online**
2. **Verify firmware version** is older than latest
3. **Check update queue** in database
4. **Manually trigger update** from web interface

### Upload Fails

1. **Check file size** (max ~1MB for ESP8266)
2. **Verify file is `.bin` format**
3. **Check server has disk space**
4. **Verify authentication token**

---

## 📁 File Structure

```
smart-garden-app/
├── firmware/                    # Firmware storage directory
│   ├── firmware_2.0.0.bin
│   ├── firmware_2.1.0.bin
│   └── ...
├── src/app/api/iot/firmware/
│   ├── route.js                 # Firmware management API
│   └── download/route.js        # Firmware download API
├── src/app/firmware-update/
│   ├── page.js                  # Firmware update web interface
│   └── firmware-update.css      # Styles
└── SmartGardenIoT/SmartGardenESP8266_OTA/
    └── SmartGardenESP8266_OTA.ino  # OTA-enabled firmware
```

---

## 🎯 Best Practices

1. **Always test firmware** before deploying
2. **Keep backup** of working firmware
3. **Increment version** for each update
4. **Add release notes** describing changes
5. **Monitor update progress** via Serial Monitor
6. **Use staging environment** for testing
7. **Rollback plan** in case of issues

---

## 🔄 Update Process Flow

1. **Admin uploads firmware** → Server stores `.bin` file
2. **Admin triggers update** → Server queues update for device
3. **Device checks for updates** → Server responds with update info
4. **Device downloads firmware** → Server serves `.bin` file
5. **Device verifies checksum** → Ensures file integrity
6. **Device installs firmware** → Writes to flash memory
7. **Device reboots** → New firmware active
8. **Device confirms update** → Sends new version to server

---

## 📝 Example Usage

### Upload Firmware via Web Interface

1. Login as admin
2. Navigate to "Firmware Update" page
3. Select `.bin` file
4. Enter version: `2.1.0`
5. Add release notes: "Fixed temperature sensor bug"
6. Click "Upload Firmware"
7. Wait for upload to complete

### Trigger Update for Device

1. Select device from dropdown
2. Select firmware version (or latest)
3. Click "Trigger OTA Update"
4. Device will automatically update within 1 hour (or immediately if checking)

### Monitor Update Progress

1. Open Serial Monitor (115200 baud)
2. Watch for update messages:
   ```
   🔍 Checking for firmware updates...
   🆕 Firmware update available!
   📥 Downloading firmware...
   ✅ Firmware downloaded
   🔄 Installing firmware...
   ✅ Update completed
   🔄 Rebooting...
   ```

---

## ✅ Success Indicators

- **Firmware uploaded** → File appears in firmware list
- **Update queued** → Device shows pending update
- **Update downloaded** → Serial Monitor shows download progress
- **Update installed** → Device reboots with new version
- **Version updated** → Device sends new version in sensor data

---

## 🆘 Support

If you encounter issues:

1. Check Serial Monitor for error messages
2. Verify WiFi connection
3. Check server logs
4. Verify firmware file integrity
5. Check device has enough memory
6. Try manual OTA update via Arduino IDE

---

## 📚 Additional Resources

- [ESP8266 ArduinoOTA Documentation](https://arduino-esp8266.readthedocs.io/en/latest/ota_updates/readme.html)
- [ArduinoOTA Library Reference](https://github.com/esp8266/Arduino/tree/master/libraries/ArduinoOTA)
- [ESP8266 OTA Update Guide](https://randomnerdtutorials.com/esp8266-ota-updates-with-arduino-ide-over-the-air/)

---

**Ready to update your devices remotely! 🚀**




