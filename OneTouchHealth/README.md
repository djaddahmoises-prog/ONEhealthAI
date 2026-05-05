# OneTouch Health AI

Measure your heart rate in 30 seconds using only your phone camera.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npx expo start
```
Scan the QR code with **Expo Go** on your phone (free on App Store / Google Play).

---

## Project Structure

```
App.js                    ← Navigation + app entry
src/
  screens/
    HomeScreen.js         ← Dashboard, score, history preview
    ScanScreen.js         ← Camera + rPPG scanning logic  ⭐ KEY FILE
    ResultsScreen.js      ← BPM + AI wellness insight
    HistoryScreen.js      ← All past scans (SQLite)
    PaywallScreen.js      ← Pricing plans
  utils/
    heartRate.js          ← Signal processing + BPM calculation
    database.js           ← SQLite scan storage
    paywall.js            ← Plan limits + activation
    theme.js              ← Colors
```

---

## How the Scan Works

Flash → illuminates blood vessels under fingertip
Camera → reads red channel pixel values each frame
Signal → average red value per frame over 30 seconds
Peaks → detect heartbeat peaks in the waveform
BPM → beats counted × 2 = heart rate

### Current State
Uses a REALISTIC SIMULATION (sine wave at BPM frequency + noise).
Everything works end-to-end. Real pixel access is the only missing piece.

### Upgrade to Real Pixel Capture (Days 15–20)
In ScanScreen.js, replace `simulateScan()` with real camera frames:

```bash
npm install react-native-vision-camera
```

Then in ScanScreen.js:
```js
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const redAvg = getRedChannelAvg(frame); // avg red pixels
  signalBuffer.current.push(redAvg);
}, []);
```

---

## Monetization — Add RevenueCat (Days 33–35)

```bash
npm install react-native-purchases
```

Replace the Alert simulation in PaywallScreen.js:
```js
import Purchases from 'react-native-purchases';
await Purchases.configure({ apiKey: 'YOUR_KEY' });
const { customerInfo } = await Purchases.purchasePackage(pkg);
```

---

## Build for Release

```bash
npm install -g eas-cli
eas build --platform ios     # TestFlight
eas build --platform android # Google Play
```

---

## Legal
This app provides wellness information only and does not diagnose medical conditions.
