# OTA (Over-The-Air) Update Guide 🔄

## What is OTA?

OTA allows you to update your ESP8266 firmware **wirelessly** without USB cable!

### Two Ways to Update:

1. **Arduino IDE OTA** (Local Network) - Easy, fast
2. **Web Dashboard OTA** (Remote) - Works from anywhere

---

## 🚀 Method 1: Arduino IDE OTA (Recommended for Testing)

### Requirements:
- ESP8266 and computer on **same WiFi network**
- Arduino IDE installed
- ESP8266 board already running OTA-enabled firmware

### Steps:

#### 1. Upload Initial Firmware (First Time Only)
```
1. Connect ESP8266 via USB
2. Open: SmartGardenESP8266_UNIFIED_OTA.ino
3. Update WiFi credentials in code
4. Upload via USB (Tools → Port → COM/dev/tty port)
5. Wait for upload to complete
```

#### 2. Find OTA Port
After first upload:
```
1. Open Serial Monitor (115200 baud)
2. Look for: "OTA Ready: SmartGarden-XXXXX"
3. Note the device name and IP address
4. Go to: Tools → Port
5. You should see: "SmartGarden-XXXXX at 192.168.0.XX"
```

#### 3. Update Wirelessly
```
1. Make changes to your code
2. Tools → Port → Select "SmartGarden-XXXXX at 192.168.0.XX"
3. Click Upload
4. Enter OTA password when prompted: smartgarden123
5. Wait for wireless upload!
```

### Troubleshooting:
- **No OTA port showing?**
  - Check ESP8266 and computer are on same WiFi
  - Check Serial Monitor for "OTA Ready" message
  - Restart Arduino IDE
  
- **Upload fails?**
  - Check OTA password is correct: `smartgarden123`
  - ESP8266 might be busy, try again
  - Check firewall isn't blocking mDNS

---

## 🌐 Method 2: Web Dashboard OTA (Remote Updates)

### Requirements:
- ESP8266 connected to internet
- Access to your web dashboard
- `.bin` file of your firmware

### Step A: Create .bin File

#### Option 1: Arduino IDE
```
1. Open your .ino file in Arduino IDE
2. Sketch → Export compiled Binary
3. Wait for compilation
4. Find .bin file in sketch folder
5. File will be named: SmartGardenESP8266_UNIFIED_OTA.ino.bin
```

#### Option 2: Command Line
```bash
# Find Arduino CLI path
arduino-cli compile --fqbn esp8266:esp8266:nodemcuv2 --output-dir ./build SmartGardenESP8266_UNIFIED_OTA

# Or use Arduino IDE's verbose output
# Preferences → Show verbose output during: [✓] compilation
# The .bin path will be shown in output
```

### Step B: Upload to Dashboard

```
1. Go to: http://localhost:3000/firmware-update
   (or https://smart-garden-app.vercel.app/firmware-update)

2. Upload Firmware:
   - Click "Choose File"
   - Select your .bin file
   - Enter version (e.g., 2.1.0)
   - Add description (optional)
   - Click "Upload Firmware"

3. Trigger Update:
   - Select your device from dropdown
   - Click "Trigger OTA Update"
   - Device will download and install automatically!
```

### Step C: Monitor Update

Check ESP8266 Serial Monitor:
```
🔍 Checking for updates...
🆕 Update available!
   Current: 2.0.0
   Latest: 2.1.0
📥 Downloading: https://...
🔄 Starting HTTP OTA...
📥 Progress: 50%
✅ Update Complete!
🔄 Rebooting...
```

---

## ⚙️ Configuration Options

### In Your Code:

```cpp
// Enable/Disable OTA
#define ENABLE_OTA true  // Set to false to disable

// OTA Settings
const char* otaHostname = "SmartGarden";  // Device name
const char* otaPassword = "smartgarden123";  // Change this!

// Firmware Check Interval
#define FIRMWARE_CHECK_INTERVAL 3600000  // 1 hour (in milliseconds)
```

### Adjust Check Frequency:
```cpp
// Check every 6 hours
#define FIRMWARE_CHECK_INTERVAL 21600000

// Check every 30 minutes (testing)
#define FIRMWARE_CHECK_INTERVAL 1800000

// Check every 24 hours
#define FIRMWARE_CHECK_INTERVAL 86400000
```

---

## 🔒 Security Best Practices

### Change OTA Password:
```cpp
// In your code:
const char* otaPassword = "your_secure_password_here";
```

### Make it Unique Per Device:
```cpp
String otaPassword = "smart" + String(ESP.getChipId(), HEX);
ArduinoOTA.setPassword(otaPassword.c_str());
```

### Disable OTA After Setup:
```cpp
// After initial configuration, disable OTA
#define ENABLE_OTA false
```

---

## 📊 OTA LED Indicators

Watch the RGB LED for update status:

| LED Color | Meaning |
|-----------|---------|
| 🟢 Green | Normal operation |
| 🟡 Yellow | OTA update in progress |
| 🔵 Blue (blinking) | Downloading update |
| 🔴 Red | Update failed / Error |

---

## 🐛 Common Issues & Solutions

### 1. "Update Failed: HTTP Error"
**Solution:**
- Check internet connection
- Verify serverURL is correct
- Check if .bin file is accessible
- Try uploading firmware again

### 2. "OTA Auth Failed"
**Solution:**
- Check OTA password is correct
- Default password: `smartgarden123`
- Update password in Arduino IDE OTA prompt

### 3. "Binary for wrong flash size"
**Solution:**
- In Arduino IDE: Tools → Flash Size
- Select: "4MB (FS:2MB OTA:~1019KB)"
- Recompile and export .bin

### 4. Device Not Showing in Port List
**Solution:**
- Wait 30 seconds after power-on
- Check both devices are on same network
- Restart Arduino IDE
- Check firewall/antivirus

### 5. "Update Available" but Doesn't Download
**Solution:**
- Check device has internet access
- Verify firmware version is newer
- Check Serial Monitor for errors
- Manually trigger from dashboard

---

## 🎯 Best Practices

### Development Workflow:

```
1. FIRST TIME (USB):
   └─ Upload UNIFIED_OTA firmware via USB

2. TESTING (Arduino IDE OTA):
   ├─ Make code changes
   ├─ Upload via OTA (no USB needed!)
   └─ Test quickly on local network

3. PRODUCTION (Web Dashboard OTA):
   ├─ Export .bin file
   ├─ Upload to dashboard
   ├─ Trigger update for all devices
   └─ Update happens automatically!
```

### Version Numbering:
```cpp
// Use semantic versioning
"2.0.0"  // Major.Minor.Patch
"2.1.0"  // Added features
"2.1.1"  // Bug fixes
"3.0.0"  // Breaking changes
```

### Testing Updates:
```
1. Test on ONE device first
2. Monitor Serial output during update
3. Verify device comes back online
4. Check all features work
5. Then update other devices
```

---

## 🔄 Update Flow Diagram

```
┌─────────────┐
│   Device    │ ◄─── Checks every hour
│   Running   │
└──────┬──────┘
       │
       ├─── HTTP GET → /api/iot/firmware?deviceId=XXX&version=2.0.0
       │
       v
┌─────────────────┐
│    Server       │ ◄─── Compares versions
│  Checks Version │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Update? │
    └────┬────┘
         │
    ┌────┴───────┐
    │   YES      │         NO: Continue normal operation
    v            v
┌──────────┐  Continue
│ Download │
│ .bin file│
└────┬─────┘
     │
     v
┌──────────┐
│  Install │
│  Update  │
└────┬─────┘
     │
     v
┌──────────┐
│  Reboot  │
└────┬─────┘
     │
     v
┌──────────┐
│  Running │ ◄─── New version!
│  v2.1.0  │
└──────────┘
```

---

## 📝 Quick Reference

### Arduino IDE OTA:
```
1. Upload once via USB
2. Tools → Port → Select OTA port
3. Upload wirelessly!
```

### Web Dashboard OTA:
```
1. Sketch → Export Binary
2. Dashboard → Upload .bin
3. Trigger Update
```

### Monitor Updates:
```
Serial Monitor (115200 baud):
- "🔍 Checking for updates..."
- "📥 Progress: XX%"
- "✅ Update Complete!"
```

---

## 🎉 Summary

**You now have 3 ways to update:**

1. **USB** (Initial) - First time setup
2. **Arduino IDE OTA** (Fast) - During development
3. **Web Dashboard OTA** (Remote) - Production updates

Use the UNIFIED_OTA version for maximum flexibility! 🚀

