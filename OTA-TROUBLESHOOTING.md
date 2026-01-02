# OTA Troubleshooting Guide 🔧

## Issue: "Device not found" Error

### ❌ Problem
When triggering OTA update from dashboard, you get:
```
Failed to trigger update: Device not found
```

### ✅ Solution Applied
The API was only looking in the `devices` collection, but your devices are stored in `user_devices` collection.

**Fixed in:** `/src/app/api/iot/firmware/route.js`

Now the API checks **all three collections**:
1. `devices`
2. `user_devices` 
3. `iot_devices`

---

## How to Test OTA Now

### Step 1: Verify Device is Sending Data

Check Serial Monitor (115200 baud):
```
✅ Data sent: 200    ← Should be 200, not 308!
```

If you see **308**, your device is using wrong endpoint. Use `UNIFIED_OTA` firmware!

---

### Step 2: Check Device Shows in Dashboard

Go to: `http://localhost:3000/my-devices`

You should see:
```
SMART_GARDEN_001
🟢 ONLINE
Last Seen: (recent timestamp)
```

If **OFFLINE** or **old timestamp**:
- Device is not sending data
- Check WiFi connection
- Check serverURL in firmware
- Check Serial Monitor for errors

---

### Step 3: Upload Firmware to Dashboard

**A. Create .bin file:**
```
Arduino IDE:
Sketch → Export Compiled Binary

File will be at:
firmware/SmartGardenESP8266_UNIFIED_OTA/build/.../SmartGardenESP8266_UNIFIED_OTA.ino.bin
```

**B. Upload to Dashboard:**
```
Go to: http://localhost:3000/firmware-update

1. Click "Choose File" 
2. Select your .bin file
3. Version: 2.1.0
4. Release Notes: "OTA test"
5. Click "Upload Firmware"
```

---

### Step 4: Trigger OTA Update

```
In "Trigger OTA Update for Device" section:

1. Select Device: SMART_GARDEN_001
2. Select Firmware: 2.1.0 (or leave empty for latest)
3. Click "Trigger Update"
```

**Expected Response:**
```
✅ OTA update queued successfully!

The device will:
1. Check for updates on next connection
2. Download firmware automatically
3. Install and reboot

Check your device Serial Monitor for progress.
```

---

### Step 5: Watch Device Serial Monitor

You should see:
```
🔄 Firmware update available!
📦 Version: 2.1.0
⬇️ Downloading: https://...
📊 Progress: 25%
📊 Progress: 50%
📊 Progress: 75%
📊 Progress: 100%
✅ Update successful! Rebooting...
```

Then device reboots with new firmware!

---

## Common Issues & Solutions

### Issue 1: Device dropdown is empty
**Cause:** No devices in database or not logged in

**Solution:**
1. Check you're logged in (token in localStorage)
2. Go to "My Devices" and add a device
3. Make sure device is sending data (Serial Monitor shows "Data sent: 200")
4. Refresh firmware update page

---

### Issue 2: Device shows but "Device not found" error
**Cause:** Device exists but API can't find it

**Solution:** ✅ **Already Fixed!**
- Updated API to check all collections
- Should work now!

---

### Issue 3: OTA triggers but device doesn't update
**Cause:** Device not checking for updates

**Solution:**
Check firmware has OTA enabled:
```cpp
#define ENABLE_OTA true  // Line 86 in UNIFIED_OTA
```

And device calls `checkForFirmwareUpdate()` periodically:
```cpp
// Should check every hour (line 67)
#define FIRMWARE_CHECK_INTERVAL 3600000  
```

---

### Issue 4: HTTP 308 Error
**Cause:** Using wrong WiFiClient for HTTPS

**Solution:** ✅ **Already Fixed in UNIFIED_OTA!**
- Auto-detects HTTP/HTTPS
- Uses correct client automatically

---

## Debugging Commands

### Check Browser Console
Open DevTools (F12) → Console tab

You'll see:
```javascript
🚀 Triggering OTA update for device: SMART_GARDEN_001
📦 Firmware version: 2.1.0
✅ OTA update queued: {...}
```

Or errors:
```javascript
❌ OTA trigger failed: Device not found
```

---

### Check Server Logs
In terminal where `yarn dev` is running:

**Success:**
```
✅ Device found for OTA: SMART_GARDEN_001
✅ OTA update queued for device: SMART_GARDEN_001 version: 2.1.0
```

**Failure:**
```
❌ Device not found in any collection: SMART_GARDEN_001
```

---

## Quick Checklist

Before triggering OTA, verify:

- [ ] Device is added in "My Devices"
- [ ] Device shows 🟢 ONLINE status
- [ ] Device Serial Monitor shows "Data sent: 200"
- [ ] Device ID in firmware matches dashboard (SMART_GARDEN_001)
- [ ] You're logged in (auth_token exists)
- [ ] Firmware .bin file is uploaded to dashboard
- [ ] Firmware file is valid (< 1MB, correct .bin format)
- [ ] Device has OTA partition (Flash Size: 4MB with OTA)
- [ ] Device is using UNIFIED_OTA firmware

---

## Complete OTA Flow

```
1. Device Setup (FIRST TIME)
   └─ Upload firmware via USB
   └─ Device connects to WiFi
   └─ Device sends data to server
   └─ Device appears in "My Devices" as ONLINE

2. Create Firmware Update
   └─ Make code changes in Arduino IDE
   └─ Export .bin file (Sketch → Export Binary)
   └─ Upload .bin to dashboard (/firmware-update)

3. Trigger OTA
   └─ Select device in dashboard
   └─ Select firmware version
   └─ Click "Trigger Update"
   └─ API queues update in database

4. Device Checks & Updates
   └─ Device checks for updates (every hour)
   └─ Finds pending update in database
   └─ Downloads .bin file
   └─ Installs update
   └─ Reboots with new firmware

5. Verify Update
   └─ Check Serial Monitor after reboot
   └─ Verify new firmware version
   └─ Check device still ONLINE
```

---

## Files Changed

**API Endpoint:**
- `/src/app/api/iot/firmware/route.js`
  - Now checks `devices`, `user_devices`, and `iot_devices` collections
  - Updates all three collections when OTA is triggered
  - Better error logging

**Frontend:**
- `/src/app/firmware-update/page.js`
  - Better console logging
  - More detailed success/error messages
  - Improved user feedback

---

## Testing OTA (Step-by-Step)

### Test 1: Verify Device Exists
```bash
# Go to My Devices page
http://localhost:3000/my-devices

# Should show: SMART_GARDEN_001 🟢 ONLINE
```

### Test 2: Upload Test Firmware
```bash
# 1. In Arduino IDE
Sketch → Export Compiled Binary

# 2. In Dashboard
Go to http://localhost:3000/firmware-update
Upload the .bin file
Version: 2.1.0
```

### Test 3: Trigger OTA
```bash
# In Dashboard Firmware Update page
Select Device: SMART_GARDEN_001
Click "Trigger Update"

# Should see:
✅ OTA update queued successfully!
```

### Test 4: Monitor Device
```bash
# Arduino IDE Serial Monitor (115200 baud)
# After ~1 hour (or force check):

🔄 Firmware update available!
📦 Version: 2.1.0
⬇️ Downloading...
✅ Update successful! Rebooting...
```

---

## Support

If still having issues:

1. **Check Serial Monitor output** - most informative
2. **Check Browser Console** (F12) - shows API calls
3. **Check Server Terminal** - shows backend logs
4. **Verify device ID matches** - firmware vs dashboard
5. **Ensure device is ONLINE** - must be sending data

---

**Status:** ✅ Issue Fixed - OTA should work now!

Last Updated: November 16, 2025




