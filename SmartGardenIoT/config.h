/*
 * Smart Garden IoT - Configuration File
 * 
 * Instructions:
 * 1. Copy this file to your Arduino sketch folder
 * 2. Modify the values below for your network
 * 3. Include this file in your main .ino file: #include "config.h"
 */

#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
#define WIFI_SSID "YOUR_WIFI_SSID"           // ← Change this to your WiFi name
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"   // ← Change this to your WiFi password

// Device Configuration
#define DEVICE_ID "DB1"                      // ← Change this for each device (DB1, DB2, etc.)

// Server Configuration - Add your known server IPs here
#define SERVER_PORT 3000                     // ← Your server port
#define KNOWN_SERVER_IPS "192.168.1.100,192.168.0.100,10.0.0.100"  // ← Comma-separated IPs

// Timing Configuration
#define SEND_INTERVAL 1000                   // ← Data send interval in milliseconds
#define SERVER_REDISCOVERY_INTERVAL 30000    // ← How often to rediscover server (ms)

// Sensor Configuration (uncomment and modify for real sensors)
// #define USE_DHT22
// #define DHT_PIN 2
// #define USE_SOIL_MOISTURE
// #define SOIL_MOISTURE_PIN A0
// #define USE_LIGHT_SENSOR
// #define LIGHT_SENSOR_PIN A1

#endif
