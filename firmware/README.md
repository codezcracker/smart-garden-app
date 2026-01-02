# Smart Garden IoT - Firmware Directory 📁

All ESP8266 firmware versions are organized here.

---

## 📂 Directory Structure

```
firmware/
├── SmartGardenESP8266_UNIFIED_OTA/    ← ⭐ RECOMMENDED - Best choice!
│   └── SmartGardenESP8266_UNIFIED_OTA.ino
├── SmartGardenESP8266_PRODUCTION/     ← HTTPS only (production server)
│   └── SmartGardenESP8266_PRODUCTION.ino
├── SmartGardenESP8266_FIXED/          ← Original backup
│   └── SmartGardenESP8266_FIXED.ino
├── README.md                          ← This file
├── README-UNIFIED.md                  ← UNIFIED version guide
└── OTA-USAGE-GUIDE.md                 ← Complete OTA guide
```

---

## 🎯 Which Version Should I Use?

### ⭐ **UNIFIED_OTA** (Recommended)
**File:** `SmartGardenESP8266_UNIFIED_OTA/SmartGardenESP8266_UNIFIED_OTA.ino`

**Best for:** Everything! Development + Production

**Features:**
- ✅ Auto-detects HTTP/HTTPS (just change URL)
- ✅ OTA updates via Arduino IDE
- ✅ OTA updates via Web Dashboard
- ✅ Works for both local and production
- ✅ Automatic firmware checking

**When to use:**
- You want maximum flexibility
- You want wireless updates
- You're doing active development
- You want remote firmware updates

---

### 🚀 **PRODUCTION** (Legacy)
**File:** `SmartGardenESP8266_PRODUCTION/SmartGardenESP8266_PRODUCTION.ino`

**Best for:** Production server only (HTTPS)

**Features:**
- ✅ HTTPS with WiFiClientSecure
- ❌ No auto-detection
- ❌ No OTA support

**When to use:**
- You only use production server
- You don't need local testing
- Legacy compatibility

---

## 🔧 Quick Start Guide

### Step 1: Choose Your Version
```
Recommendation: Use UNIFIED_OTA for best experience!
```

### Step 2: Open in Arduino IDE
```
File → Open → firmware/SmartGardenESP8266_UNIFIED_OTA/SmartGardenESP8266_UNIFIED_OTA.ino
```

### Step 3: Configure
```cpp
// Update WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Change server URL for local/production
const char* serverURL = "https://smart-garden-app.vercel.app";
// Or for local: "http://192.168.0.X:3000"

// Update device ID to match dashboard
const char* deviceId = "SMART_GARDEN_001";
```

### Step 4: Upload
```
1. Connect ESP8266 via USB
2. Select board: NodeMCU 1.0 (ESP-12E Module)
3. Select port: COM/dev/tty port
4. Click Upload
```

### Step 5: Monitor
```
Tools → Serial Monitor (115200 baud)
Watch for:
- ✅ WiFi connected
- ✅ IP Address shown
- ✅ Data sent successfully (HTTP 200)
```

---

## 📖 Documentation

### Main Guides:
- **`README-UNIFIED.md`** - Complete guide for UNIFIED versions
- **`OTA-USAGE-GUIDE.md`** - Complete OTA setup and usage guide

### Online Documentation:
- **OTA Setup:** `/OTA-UPDATE-GUIDE.md` (in project root)
- **Create .bin:** `/HOW-TO-CREATE-BIN-FILE.md` (in project root)

---

## 🔄 Version Comparison

| Feature | UNIFIED_OTA | PRODUCTION | FIXED |
|---------|-------------|------------|-------|
| **Auto HTTP/HTTPS** | ✅ | ❌ | ❌ |
| **Arduino OTA** | ✅ | ❌ | ❌ |
| **Web Dashboard OTA** | ✅ | ❌ | ❌ |
| **Auto Firmware Check** | ✅ | ❌ | ❌ |
| **Local Testing** | ✅ | ❌ | ✅ |
| **Production Server** | ✅ | ✅ | ✅ |
| **Complexity** | Medium | Low | Low |
| **Recommended** | ⭐⭐⭐ | ⭐ | Backup |

---

## 🎨 Development Workflow

### Using UNIFIED_OTA:

```
1. FIRST TIME (USB):
   └─ Upload SmartGardenESP8266_UNIFIED_OTA.ino via USB

2. LOCAL TESTING:
   ├─ Change: serverURL = "http://192.168.0.X:3000"
   ├─ Upload via Arduino IDE OTA (no USB!)
   └─ Test with local server (yarn dev)

3. PRODUCTION DEPLOYMENT:
   ├─ Change: serverURL = "https://smart-garden-app.vercel.app"
   ├─ Export .bin file (Sketch → Export Binary)
   ├─ Upload .bin to dashboard
   └─ Trigger OTA for all devices!
```

---

## 🔧 Common Tasks

### Switch from Local to Production:
```cpp
// Before (Local)
const char* serverURL = "http://192.168.0.100:3000";

// After (Production)
const char* serverURL = "https://smart-garden-app.vercel.app";

// Upload and done! Auto-detects HTTPS ✅
```

### Enable/Disable OTA:
```cpp
// Enable OTA
#define ENABLE_OTA true

// Disable OTA (smaller code, faster)
#define ENABLE_OTA false
```

### Change OTA Password:
```cpp
const char* otaPassword = "your_secure_password";
```

### Adjust Data Send Interval:
```cpp
// Fast (testing)
#define DATA_SEND_INTERVAL_SECONDS 5

// Normal (production)
#define DATA_SEND_INTERVAL_SECONDS 10

// Battery saving
#define DATA_SEND_INTERVAL_SECONDS 30
```

---

## 🐛 Troubleshooting

### Device Not Sending Data
```
1. Check Serial Monitor for errors
2. Verify WiFi credentials
3. Check serverURL is correct
4. Ensure server is running (for local)
5. Check firewall isn't blocking
```

### OTA Not Working
```
1. Check device and computer on same network
2. Verify OTA password is correct
3. Wait 30 seconds after power-on
4. Restart Arduino IDE
5. Check Serial Monitor for "OTA Ready" message
```

### HTTP 308 Error
```
Solution: Make sure you're using correct protocol
- Local: http:// (not https://)
- Production: https:// (not http://)
UNIFIED version handles this automatically!
```

---

## 📝 Notes

### Pin Assignments (All Versions)
```
D0 (GPIO16) → Red LED
D1 (GPIO5)  → Green LED
D2 (GPIO4)  → Blue LED
D3 (GPIO0)  → Button
D4 (GPIO2)  → DHT11 (Temp/Humidity)
D5 (GPIO14) → Moisture Sensor
A0          → LDR (Light Sensor)
```

### Required Libraries
```
- ESP8266WiFi (built-in)
- ESP8266HTTPClient (built-in)
- ArduinoJson (install via Library Manager)
- DHT sensor library (install via Library Manager)
```

### Board Settings (Arduino IDE)
```
Board: NodeMCU 1.0 (ESP-12E Module)
Upload Speed: 921600
CPU Frequency: 80 MHz
Flash Size: 4MB (FS:2MB OTA:~1019KB)
```

---

## 🎯 Best Practices

1. **Always test locally first** before deploying to production
2. **Use UNIFIED_OTA** for maximum flexibility
3. **Change OTA password** from default
4. **Monitor Serial output** during first run
5. **Keep backup** of working firmware version
6. **Document your changes** when modifying code
7. **Test OTA** on one device before updating all

---

## 🆘 Need Help?

- Check **OTA-USAGE-GUIDE.md** for detailed OTA instructions
- Check **README-UNIFIED.md** for UNIFIED version details
- Review Serial Monitor output for error messages
- Verify all settings in the code match your setup

---

## 📊 Summary

**Recommended Setup:**
```
1. Use: SmartGardenESP8266_UNIFIED_OTA
2. Benefits: Auto-detect + OTA updates
3. Workflow: USB once, then wireless forever!
```

**Quick Reference:**
```
Local Testing:  serverURL = "http://192.168.0.X:3000"
Production:     serverURL = "https://smart-garden-app.vercel.app"
OTA Password:   "smartgarden123" (change this!)
Data Interval:  10 seconds (adjust as needed)
```

---

🎉 **Happy Coding!** Choose UNIFIED_OTA and never worry about cables again! 🚀

