# Which Laser Firmware Version to Use

## ✅ **USE THIS VERSION:**

**File:** `firmware/SmartGardenESP32_Laser/SmartGardenESP32_Laser.ino`

This is the **PRODUCTION VERSION** configured for:
- ✅ Production server: `https://smart-garden-app.vercel.app`
- ✅ HTTPS connection (secure)
- ✅ Ultra-fast 200ms polling
- ✅ Real-time state sync
- ✅ Auto-registration
- ✅ Detailed logging

## 📋 **Setup Instructions:**

1. **Open Arduino IDE**
2. **Open:** `firmware/SmartGardenESP32_Laser/SmartGardenESP32_Laser.ino`
3. **Configure WiFi:**
   - Line 30: `const char* ssid = "@s@d";` (your WiFi SSID)
   - Line 31: `const char* password = "88009900";` (your WiFi password)
4. **Verify Server URL:**
   - Line 36: Should be `"https://smart-garden-app.vercel.app"` (production)
5. **Select Board:** ESP32 Dev Module
6. **Upload** to your ESP32
7. **Open Serial Monitor** (115200 baud) to see status

## 🔧 **Pin Configuration:**

- **Laser Pin:** GPIO 2 (Line 46)
- Change if your laser is connected to a different pin

## 🚀 **Features:**

- ✅ Polls every 200ms for instant response
- ✅ Auto-registers when it first connects
- ✅ Sends status updates every 5 seconds
- ✅ Detailed Serial Monitor logging
- ✅ Handles WiFi reconnection automatically

## 📡 **What You'll See in Serial Monitor:**

```
🔴 Smart Garden ESP32 - Laser Control Firmware
📡 Formatted MAC Address: XXXXXXXXXXXX
✅ WiFi connected!
📍 IP Address: 192.168.x.x
📤 Polling for commands...
✅ Response received
```

## ⚠️ **For Local Development:**

If testing on localhost, change line 36 to:
```cpp
const char* serverURL = "http://192.168.10.15:3000";  // Your computer's IP
```

But for production, use:
```cpp
const char* serverURL = "https://smart-garden-app.vercel.app";
```

---

**This is the ONLY version you need!** 🎯

