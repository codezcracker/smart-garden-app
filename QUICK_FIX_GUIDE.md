# Quick Fix Guide - Device Code & Online Status

## Problem Summary
1. Downloaded code doesn't match the working production code
2. Devices still showing offline despite recent data

## Fixes Applied

### 1. Fixed /api/sensor-data endpoint
- Now updates both `iot_devices` AND `user_devices` collections
- Ensures devices show up correctly in the dashboard

### 2. Fixed status check logic
- Now marks devices as ONLINE if lastSeen < 30 seconds
- Dynamically calculates status based on lastSeen timestamp
- No longer requires stored status to be accurate

### 3. Updated endpoint in generated code
- Changed from `/api/sensors/data` to `/api/sensor-data`
- Matches the simpler endpoint that doesn't require auth headers

## To Fix Your Device

### Step 1: Download Fresh Code
1. Go to My Devices page: http://localhost:3000/my-devices
2. Click "📥 Download Code" for your device (SMART_GARDEN_001)
3. Save the `.ino` file

### Step 2: Update WiFi Credentials
Open the downloaded file and change:
```cpp
const char* ssid = "YOUR_WIFI_SSID";  // Change to "Qureshi"
const char* password = "YOUR_WIFI_PASSWORD";  // Change to your password
```

### Step 3: Upload to ESP8266
1. Open Arduino IDE
2. Load the .ino file
3. Select Board: NodeMCU 1.0 (ESP-12E Module)
4. Upload to your ESP8266

### Step 4: Verify
Check Serial Monitor for:
```
✅ Data sent: 200
```

NOT:
```
✅ Data sent: 308  ← This is bad (redirect)
```

## Expected Result
- Device shows as 🟢 ONLINE within 30 seconds
- `lastSeen` timestamp updates every 10 seconds
- Connection quality shows as "EXCELLENT" or "GOOD"

## If Still Offline

1. Check Serial Monitor for errors
2. Verify WiFi credentials are correct
3. Make sure device can reach the internet
4. Check that `/api/sensor-data` endpoint is working:
   ```bash
   curl -X POST https://smart-garden-app.vercel.app/api/sensor-data \
     -H "Content-Type: application/json" \
     -d '{"deviceId":"TEST","temperature":25,"humidity":50,"soilMoisture":60,"lightLevel":70,"wifiRSSI":-50}'
   ```

## What Changed
- **Endpoint**: `/api/sensors/data` → `/api/sensor-data`
- **Status Logic**: Now based on `lastSeen` timestamp
- **Database Updates**: Updates both collections automatically

The code you download now uses the correct endpoint and should work immediately after uploading.




