# ESP32 Laser Control Firmware

Firmware for ESP32 DevKit v1 to control a laser module via the Smart Garden web app.

## Hardware Setup

### Components Required
- ESP32 DevKit v1
- Laser Module (5V or 3.3V compatible)
- Jumper wires

### Pin Connections
- **Laser Module**: GPIO 2 (Built-in LED pin)
  - Connect laser VCC to 3.3V or 5V (depending on laser module)
  - Connect laser GND to GND
  - Connect laser signal pin to GPIO 2

**Note**: You can change the `LASER_PIN` definition in the code to use a different GPIO pin if needed.

## Configuration

Before uploading the firmware, you need to configure:

1. **WiFi Credentials** (lines 36-37):
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

2. **Server URL** (line 40):
   ```cpp
   const char* serverURL = "https://smart-garden-app.vercel.app";
   ```
   Change this to your server URL if different.

3. **Laser Pin** (line 48):
   ```cpp
   #define LASER_PIN 2  // Change this if using different pin
   ```

## Installation

1. Install Arduino IDE with ESP32 board support:
   - Add ESP32 board URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Install "esp32" by Espressif Systems

2. Install Required Libraries:
   - ArduinoJson (by Benoit Blanchon) - Version 6.x
   - WiFi (included with ESP32)

3. Open the `.ino` file in Arduino IDE

4. Select Board:
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module

5. Configure Upload Settings:
   - Upload Speed: 115200
   - Port: Select your ESP32 COM port
   - Flash Frequency: 80MHz
   - Flash Mode: QIO
   - Partition Scheme: Default

6. Upload the firmware

## How It Works

1. **Device Registration**: On first boot, the device generates a unique ID based on its MAC address and stores it in flash memory.

2. **WiFi Connection**: The device connects to your WiFi network.

3. **Command Polling**: Every 5 seconds, the device polls the server's `/api/devices/control` endpoint (PATCH request) to check for pending commands.

4. **Command Execution**: When a command is received:
   - `laser_on`: Turns the laser ON
   - `laser_off`: Turns the laser OFF
   - `get_status`: Sends current status to server

5. **Status Updates**: After executing a command, the device sends a status update to the server.

## Using the Web App

1. **Register your device** in the web app:
   - Go to `/my-devices` page
   - Add a new device
   - Use the **MAC Address** shown in Serial Monitor (format: AABBCCDDEEFF, without colons)
   - The Device ID will be shown in Serial Monitor (format: ESP32_XXXXXXXX)

2. Navigate to `/laser-control` page

3. Select your device from the dropdown

4. Click the button to turn the laser ON or OFF

**Important**: Make sure your device is registered in the database with the correct MAC address. The firmware will automatically connect and poll for commands once registered.

## Serial Monitor Output

The firmware provides detailed Serial output at 115200 baud:
- Device ID and MAC address
- WiFi connection status
- Command execution logs
- Status updates

## Troubleshooting

### Laser Not Turning On
- Check pin connections
- Verify laser module voltage (3.3V or 5V)
- Check if GPIO 2 is correct (some boards use different pins)
- Test laser module directly with power

### WiFi Connection Failed
- Verify SSID and password are correct
- Ensure you're using a 2.4GHz network (ESP32 supports both 2.4GHz and 5GHz)
- Check WiFi signal strength
- Try restarting the device

### Commands Not Working
- Verify device is registered in the web app
- Check Serial Monitor for error messages
- Verify server URL is correct
- Check if device is online in the web app

### Device ID Mismatch
- Check Serial Monitor for the Device ID
- Register the device in the web app using this ID
- Or clear preferences to generate a new ID (device will create new ID on next boot)

## Customization

### Change Command Poll Interval
Modify `COMMAND_CHECK_INTERVAL` (line 53):
```cpp
const unsigned long COMMAND_CHECK_INTERVAL = 5000;  // milliseconds
```

### Change Laser Pin
Modify `LASER_PIN` (line 48):
```cpp
#define LASER_PIN 2  // Change to your desired GPIO pin
```

### Add Additional Features
You can extend the firmware to:
- Read sensors
- Control other actuators
- Send periodic data updates
- Implement OTA updates

## License

Part of the Smart Garden IoT System

