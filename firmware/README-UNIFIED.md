# Smart Garden IoT - UNIFIED VERSION 🚀

## One Code, Works Everywhere!

The **UNIFIED** version automatically detects whether you're using local or production and adapts accordingly.

---

## 📁 File Location

```
SmartGardenIoT/
└── SmartGardenESP8266_UNIFIED/
    └── SmartGardenESP8266_UNIFIED.ino  ← THE ONLY FILE YOU NEED!
```

---

## 🎯 How It Works

The code **auto-detects** HTTP vs HTTPS based on your `serverURL`:

```cpp
// The code checks this automatically:
if (serverURL starts with "https://") {
    → Use HTTPS with WiFiClientSecure
    → Production mode
} else {
    → Use HTTP with WiFiClient
    → Testing mode
}
```

---

## 🔧 Configuration

**Just change ONE line in the code:**

### For LOCAL Testing (HTTP):
```cpp
const char* serverURL = "http://192.168.0.100:3000";  // Your computer's IP
```

### For PRODUCTION (HTTPS):
```cpp
const char* serverURL = "https://smart-garden-app.vercel.app";
```

That's it! Everything else is automatic! ✨

---

## 📊 What Changes Automatically

| Setting | LOCAL (HTTP) | PRODUCTION (HTTPS) |
|---------|--------------|-------------------|
| **Protocol** | HTTP | HTTPS |
| **Client** | WiFiClient | WiFiClientSecure |
| **SSL** | No | Yes (insecure mode) |
| **Serial Output** | "📡 Using HTTP" | "🔒 Using HTTPS" |
| **Mode Display** | "TESTING" | "PRODUCTION" |

---

## 💻 Usage Examples

### Example 1: Local Development

```cpp
// SmartGardenESP8266_UNIFIED.ino
const char* serverURL = "http://192.168.0.55:3000";  // Your computer
const char* deviceId = "SMART_GARDEN_TEST";
#define DATA_SEND_INTERVAL_SECONDS 5  // Fast for testing
```

**Serial Output:**
```
🌱 Smart Garden IoT - UNIFIED VERSION v2.0.0
================================================
🌐 Server: http://192.168.0.55:3000
🔒 Protocol: HTTP (Local)
📍 Mode: TESTING
================================================

📊 Sending sensor data...
   📡 Using HTTP (WiFiClient)
   ✅ Data sent successfully (HTTP 200)
```

---

### Example 2: Production Deployment

```cpp
// SmartGardenESP8266_UNIFIED.ino
const char* serverURL = "https://smart-garden-app.vercel.app";
const char* deviceId = "SMART_GARDEN_001";
#define DATA_SEND_INTERVAL_SECONDS 10  // Battery optimized
```

**Serial Output:**
```
🌱 Smart Garden IoT - UNIFIED VERSION v2.0.0
================================================
🌐 Server: https://smart-garden-app.vercel.app
🔒 Protocol: HTTPS (Secure)
📍 Mode: PRODUCTION
================================================

📊 Sending sensor data...
   🔒 Using HTTPS (WiFiClientSecure)
   ✅ Data sent successfully (HTTP 200)
```

---

## 🔄 Quick Switch Guide

### To Switch from LOCAL to PRODUCTION:

**Before:**
```cpp
const char* serverURL = "http://192.168.0.100:3000";
```

**After:**
```cpp
const char* serverURL = "https://smart-garden-app.vercel.app";
```

**Upload** → Done! It automatically uses HTTPS now.

---

### To Switch from PRODUCTION to LOCAL:

**Before:**
```cpp
const char* serverURL = "https://smart-garden-app.vercel.app";
```

**After:**
```cpp
const char* serverURL = "http://192.168.0.100:3000";
```

**Upload** → Done! It automatically uses HTTP now.

---

## 🎨 Features

✅ **Auto-detection** - Detects HTTP vs HTTPS automatically
✅ **One codebase** - No more maintaining multiple versions
✅ **Easy switching** - Just change the URL
✅ **Smart client selection** - Uses correct WiFi client automatically
✅ **Clear logging** - Shows which mode it's running in
✅ **SSL handling** - Automatically handles certificate validation
✅ **No code duplication** - Clean and maintainable

---

## 🐛 Troubleshooting

### Issue: Getting HTTP 308 redirect

**Solution:** Make sure you're using the CORRECT protocol:
- Local: `http://` (not https://)
- Production: `https://` (not http://)

### Issue: Can't connect to local server

**Solution:** 
1. Find your computer's IP: `ipconfig` or `ifconfig`
2. Update `serverURL` with your actual IP
3. Make sure `yarn dev` is running on port 3000

### Issue: HTTPS connection fails

**Solution:**
- The code uses `setInsecure()` to skip certificate validation
- This is normal for ESP8266 with HTTPS
- If still failing, check your internet connection

---

## 📝 Configuration Variables

All in one place at the top of the file:

```cpp
// WiFi
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server - CHANGE THIS!
const char* serverURL = "...";  // HTTP or HTTPS

// Device
const char* deviceId = "SMART_GARDEN_001";
const char* deviceName = "Smart Garden Controller";

// Timing
#define DATA_SEND_INTERVAL_SECONDS 10  // Adjust as needed
```

---

## 🎯 Best Practices

1. **For Development:**
   - Use `http://YOUR_IP:3000`
   - Set interval to 5 seconds for fast feedback
   - Use test device ID like `SMART_GARDEN_TEST`

2. **For Production:**
   - Use `https://smart-garden-app.vercel.app`
   - Set interval to 10+ seconds for battery life
   - Use production device ID like `SMART_GARDEN_001`

3. **Testing Flow:**
   - Test locally first with HTTP
   - When working, switch to HTTPS for production
   - Upload to ESP8266

---

## 🚀 Benefits Over Multiple Versions

| Before (2 versions) | After (Unified) |
|---------------------|-----------------|
| Maintain 2 files | Maintain 1 file |
| Duplicate code | Single codebase |
| Manual protocol selection | Auto-detection |
| More confusing | Much simpler |
| More room for errors | Less error-prone |

---

## 💡 Summary

**This is the ONLY file you need now!**

- ✅ Works for both local and production
- ✅ Just change the `serverURL` 
- ✅ Everything else is automatic
- ✅ No more downloading code
- ✅ No more maintaining multiple versions

**Simple. Smart. Unified.** 🎉

