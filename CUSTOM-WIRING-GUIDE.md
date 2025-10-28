# Custom Wiring Guide - Your Specific Setup

## 🎯 Your Custom Requirements

**You want:**
- ✅ Button on D0 (GPIO 16)
- ✅ DHT11 on D2 (GPIO 4) 
- ✅ LED lights keep same positions
- ✅ All other sensors unchanged

**Perfect! This is actually easier than the original fix.**

---

## 📋 What Changes vs What Stays Same

### 🔄 ONLY 2 Changes Needed:

```
1. Button:    FROM GPIO 4 (D2)  →  TO GPIO 16 (D0)
2. DHT11:     (new connection)  →  GPIO 4 (D2) + 10kΩ resistor
```

### ✅ Everything Else Stays the Same:

```
RGB Red:      GPIO 14 (D5)  →  SAME ✅
RGB Green:    GPIO 12 (D6)  →  SAME ✅  
RGB Blue:     GPIO 13 (D7)  →  SAME ✅
Buzzer:       GPIO 5 (D1)   →  SAME ✅
Moisture:     A0            →  SAME ✅
LDR Light:    GPIO 16 (D0)  →  SAME ✅ (but now shared with button)
```

---

## 🔌 Custom Pin Assignment

### ESP-12E Pin Layout (Your Setup)

```
ESP-12E NodeMCU
┌─────────────────────────────────┐
│                                 │
│  D0 (GPIO 16) ← Button + LDR   │  ⭐ SHARED PIN
│  D1 (GPIO 5)  ← Buzzer          │  ✅ SAME
│  D2 (GPIO 4)  ← DHT11 Data      │  ⭐ NEW
│  D3 (GPIO 0)  ← (not used)      │  ✅ SAME
│  D4 (GPIO 2)  ← Built-in LED    │  ✅ SAME
│  D5 (GPIO 14) ← RGB Red         │  ✅ SAME
│  D6 (GPIO 12) ← RGB Green       │  ✅ SAME
│  D7 (GPIO 13) ← RGB Blue        │  ✅ SAME
│  A0           ← Moisture        │  ✅ SAME
│                                 │
└─────────────────────────────────┘
```

**Note:** D0 (GPIO 16) will be shared between Button and LDR. This works fine!

---

## 🔧 Step-by-Step Wiring Changes

### ⚠️ POWER OFF DEVICE FIRST!

### Change 1: Move Button to D0
```
OLD: Button → GPIO 4 (D2)
NEW: Button → GPIO 16 (D0)

Physical action:
1. Disconnect button wire from D2 pin
2. Connect button wire to D0 pin
3. Other button wire stays on GND
```

### Change 2: Add DHT11 to D2
```
OLD: DHT11 not connected
NEW: DHT11 → GPIO 4 (D2)

DHT11 Wiring:
Pin 1 (VCC)   → 3.3V or 5V
Pin 2 (Data)  → GPIO 4 (D2) ⭐ NEW CONNECTION
Pin 3 (NC)    → Not connected (if 4-pin version)
Pin 4 (GND)   → GND

⚠️ IMPORTANT: Add 10kΩ pull-up resistor between VCC and Data pin
```

### ✅ No Changes Needed:
- RGB Red LED (stays on D5)
- RGB Green LED (stays on D6)  
- RGB Blue LED (stays on D7)
- Buzzer (stays on D1)
- Moisture sensor (stays on A0)
- LDR light sensor (stays on D0)

---

## 🧪 Testing Your Custom Setup

### Test 1: Button on D0
```
1. Upload custom firmware
2. Open Serial Monitor (115200 baud)
3. Hold button for 5 seconds
4. Should see: "🔋 Device turned ON/OFF"
5. If not working: Check button wiring to D0
```

### Test 2: DHT11 on D2
```
1. Upload custom firmware
2. Open Serial Monitor
3. Look for: "🌡️ Testing DHT11 Sensor on D2 (GPIO 4)..."
4. Should see: "✅ DHT11 working! Temp: XX°C, Humidity: XX%"
5. If shows NaN: Check pull-up resistor and power
```

### Test 3: LEDs (should work same as before)
```
1. During startup, watch LEDs
2. Should see Red, Green, Blue sequence
3. All LEDs should work exactly as before
4. No changes to LED wiring needed
```

### Test 4: Other Sensors (unchanged)
```
1. Moisture: Should show percentage in Serial Monitor
2. Light: Should show percentage in Serial Monitor  
3. Buzzer: Should beep during startup
4. All should work exactly as before
```

---

## 📊 Expected Serial Monitor Output

```
🌱 Smart Garden IoT - CUSTOM VERSION
🔧 Button on D0, DHT11 on D2, LEDs unchanged
⚡ Fast updates: 5 seconds (was 30 seconds)
✅ DHT11 sensor initialized on GPIO4 (D2)
✅ DHT11 working! Temp: 24.5°C, Humidity: 55%
✅ Hardware testing complete!
📶 Connecting to WiFi...
✅ WiFi connected!
📡 IP address: 192.168.0.123
🚀 Device initialized successfully!
🆔 Device ID: DB1234
📡 Sending data every 5 seconds via HTTP
🔘 Button on D0 (GPIO 16)
🌡️ DHT11 on D2 (GPIO 4)

📊 Sending sensor data (every 5 seconds)...
🌡️ Temperature: 24.5°C ✅
💧 Humidity: 55% ✅
🌱 Soil Moisture: 45%
☀️ Light Level: 78%
✅ Sensor data sent successfully (HTTP)
```

---

## 🎯 Your Custom Firmware

**File to upload:** `SmartGardenESP8266_CUSTOM.ino`

**Key features:**
- ✅ Button on D0 (GPIO 16)
- ✅ DHT11 on D2 (GPIO 4)
- ✅ LEDs keep same positions
- ✅ 5-second updates (not 30)
- ✅ Real temperature/humidity values
- ✅ No WebSocket complexity

---

## 🔍 Pin Conflict Check

**Potential issue:** D0 (GPIO 16) used for both Button and LDR

**Solution:** This actually works fine! Here's why:
- LDR is analog input (read with `analogRead()`)
- Button is digital input (read with `digitalRead()`)
- They can share the same pin without conflict
- The firmware handles both correctly

**If you want separate pins:**
- Keep LDR on D0 (GPIO 16)
- Move button to D3 (GPIO 0) - but D3 is less reliable
- Current setup (shared D0) is actually better

---

## 🚀 Quick Installation

### Step 1: Rewire (5 minutes)
```
1. Button: D2 → D0
2. DHT11: (new) → D2 + 10kΩ resistor
```

### Step 2: Upload Firmware (5 minutes)
```
1. Open: SmartGardenESP8266_CUSTOM.ino
2. Board: NodeMCU 1.0 (ESP-12E Module)
3. Upload
```

### Step 3: Test (2 minutes)
```
1. Open Serial Monitor (115200 baud)
2. Look for real temperature values (not 0.0)
3. Test button on D0
```

**Total time: ~12 minutes**

---

## ✅ Success Criteria

**You'll know it's working when:**

1. **Serial Monitor shows:**
   - Real temperature values (not 0.0)
   - Real humidity values (not 0.0)
   - Updates every 5 seconds
   - "Button on D0 (GPIO 16)"
   - "DHT11 on D2 (GPIO 4)"

2. **Button works:**
   - Hold 5 seconds = power toggle
   - Hold 2 seconds = discovery mode

3. **All LEDs work:**
   - Same as before (no changes needed)
   - Red, Green, Blue sequence on startup

4. **Dashboard shows:**
   - Real temperature/humidity values
   - Updates every 5 seconds
   - All sensor data complete

---

## 🐛 Troubleshooting

### DHT11 shows NaN or 0.0?
**Check:**
- DHT11 data pin connected to D2 (GPIO 4)?
- 10kΩ pull-up resistor between VCC and Data?
- DHT11 has power (VCC) and ground (GND)?

### Button not working?
**Check:**
- Button connected to D0 (GPIO 16)?
- Button wiring: one side to D0, other to GND
- Test with multimeter

### LEDs not working?
**Check:**
- Should work exactly as before
- If not, check original LED wiring (should be unchanged)

### Still 30-second updates?
**Check:**
- Uploaded the CUSTOM firmware?
- Look for "Fast updates: 5 seconds" in Serial Monitor

---

## 🎉 Benefits of Your Custom Setup

### Advantages:
- ✅ **Minimal wiring changes** (only 2 connections)
- ✅ **LEDs unchanged** (no RGB rewiring)
- ✅ **DHT11 enabled** (real temperature/humidity)
- ✅ **Faster updates** (5s instead of 30s)
- ✅ **Button on D0** (as requested)
- ✅ **No WebSocket complexity**

### Perfect for:
- Quick fix with minimal changes
- Keeping existing LED setup
- Getting all sensors working
- Fast implementation

---

## 📞 Need Help?

**Check these in order:**
1. Serial Monitor output (115200 baud)
2. Verify button moved to D0
3. Verify DHT11 connected to D2 with pull-up resistor
4. Test button functionality (5s hold for power toggle)

**Files to reference:**
- `SmartGardenESP8266_CUSTOM.ino` - Your custom firmware
- This guide - Custom wiring instructions

---

## ✨ Summary

**Your custom setup is actually BETTER than the original fix because:**
- ✅ Fewer wiring changes (2 vs 3)
- ✅ LEDs stay in same positions
- ✅ Still fixes both problems (temp/humidity + speed)
- ✅ Button on D0 as requested
- ✅ DHT11 on D2 as requested

**Ready to implement? Upload `SmartGardenESP8266_CUSTOM.ino` and follow this guide!**

---

Last Updated: October 23, 2025
