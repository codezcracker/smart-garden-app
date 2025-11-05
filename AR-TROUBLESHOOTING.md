# 🔧 AR Garden Troubleshooting Guide

## ✅ **Fixed Issues:**

1. **AR.js Library Loading**: Fixed sequential loading of A-Frame and AR.js
2. **Marker URL**: Now using CDN URL for Hiro marker pattern
3. **Camera Setup**: Improved camera configuration
4. **Scene Creation**: Better timing for scene initialization
5. **Error Handling**: Added proper error messages and loading states

---

## 🐛 **Common Issues & Solutions:**

### **Issue 1: AR Not Rendering / Shows Data But No 3D Objects**

**Possible Causes:**
- Marker not detected
- AR.js libraries not fully loaded
- Camera not initialized

**Solutions:**
1. ✅ **Make sure marker is printed correctly**
   - Download: https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg
   - Print in high quality (300 DPI)
   - Use white paper, avoid glossy finish

2. ✅ **Check marker visibility**
   - Ensure good lighting (not too dark/bright)
   - Keep marker flat and still
   - Hold phone 30-50cm away from marker
   - Make sure entire marker is visible in camera frame

3. ✅ **Verify camera access**
   - Allow camera permissions when prompted
   - Check browser settings if camera doesn't start
   - Try refreshing the page

4. ✅ **Check browser console**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Check if AR.js libraries loaded successfully

### **Issue 2: "Failed to load AR libraries" Error**

**Solutions:**
1. ✅ **Check internet connection**
   - AR.js libraries load from CDN
   - Ensure stable internet connection

2. ✅ **Try different browser**
   - Chrome (recommended)
   - Firefox
   - Safari (iOS)

3. ✅ **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache manually

### **Issue 3: Camera Not Starting**

**Solutions:**
1. ✅ **Check permissions**
   - Browser settings → Site permissions → Camera
   - Allow camera access for your domain

2. ✅ **Try HTTPS**
   - Camera requires HTTPS (Vercel provides this automatically)
   - Make sure you're on `https://` not `http://`

3. ✅ **Check if camera is in use**
   - Close other apps using camera
   - Restart browser if needed

### **Issue 4: Marker Detected But No 3D Objects**

**Solutions:**
1. ✅ **Check sensor data**
   - Make sure ESP8266 is connected
   - Verify `/api/sensor-test` returns data
   - Check browser console for API errors

2. ✅ **Wait for libraries to load**
   - Look for "Loading AR..." message
   - Wait until "AR Ready" appears
   - Don't click "Start AR" multiple times

3. ✅ **Check browser compatibility**
   - Use modern browser (Chrome, Firefox, Safari)
   - Update browser to latest version
   - Enable WebGL (usually enabled by default)

---

## 🔍 **Debug Steps:**

### **Step 1: Check Browser Console**
```javascript
// Open Developer Tools (F12)
// Look for these messages:
- "AR.js system not found" → Libraries not loaded
- "Marker detected!" → Marker tracking works
- "Camera permission denied" → Permission issue
```

### **Step 2: Verify Libraries Loaded**
```javascript
// In browser console, type:
window.AFRAME  // Should show A-Frame object
window.AFRAME.systems.arjs  // Should show AR.js system
```

### **Step 3: Test Marker Detection**
1. Print Hiro marker
2. Open AR page
3. Start AR
4. Point camera at marker
5. Check console for "Marker detected!" message

### **Step 4: Verify Sensor Data**
```javascript
// In browser console:
fetch('/api/sensor-test')
  .then(r => r.json())
  .then(console.log)
// Should return array of sensor data
```

---

## 📱 **Mobile-Specific Issues:**

### **iOS Safari:**
- ✅ Use iOS 11+ for AR.js support
- ✅ Allow camera in Safari settings
- ✅ Use HTTPS (required)

### **Android Chrome:**
- ✅ Android 7+ recommended
- ✅ Allow camera permissions
- ✅ Use Chrome 60+ for best compatibility

### **Desktop:**
- ⚠️ AR works better on mobile devices
- ⚠️ Desktop may have camera initialization issues
- ✅ Use mobile device for best experience

---

## 🎯 **Quick Fixes:**

### **Fix 1: Hard Refresh**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
Mobile: Clear browser cache
```

### **Fix 2: Re-allow Permissions**
1. Go to browser settings
2. Site permissions → Camera
3. Remove your site
4. Refresh page and allow again

### **Fix 3: Try Different Marker**
- Download fresh Hiro marker
- Print again in high quality
- Ensure marker is not wrinkled or damaged

### **Fix 4: Check Network**
- Ensure CDN is accessible (check network tab)
- Try different network if blocked
- Disable ad blockers (may block CDN scripts)

---

## ✅ **Expected Behavior:**

### **When AR Works Correctly:**
1. ✅ Click "Start AR" → Camera starts
2. ✅ "Loading AR..." appears briefly
3. ✅ Camera view shows your environment
4. ✅ Point camera at marker → 3D objects appear
5. ✅ Sensor data floats above marker
6. ✅ Plant model rotates
7. ✅ Data updates every 3 seconds

### **Visual Indicators:**
- 🎥 Camera view visible
- 🎯 Marker detected (objects appear)
- 📊 Sensor data cards visible
- 🌱 Plant model rotating
- 💚 Health circle showing percentage

---

## 🆘 **Still Not Working?**

If AR still doesn't work after trying all solutions:

1. **Check Requirements:**
   - ✅ HTTPS connection
   - ✅ Modern browser
   - ✅ Camera permissions
   - ✅ Printed marker
   - ✅ Good lighting

2. **Report Issues:**
   - Check browser console for errors
   - Note which step fails
   - Check network tab for failed requests
   - Try on different device/browser

3. **Alternative:**
   - Use Sensor Dashboard (`/sensor-dashboard`) for 2D view
   - Check if sensor data is coming through (`/sensor-test`)

---

## 📚 **Useful Links:**

- **Hiro Marker**: https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg
- **AR.js Docs**: https://ar-js.github.io/AR.js-Docs/
- **A-Frame Docs**: https://aframe.io/docs/

---

**Most common issue**: Marker not detected → Make sure marker is printed correctly and well-lit!
