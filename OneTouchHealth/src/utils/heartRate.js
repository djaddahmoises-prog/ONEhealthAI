/**
 * rPPG Signal Processing
 * Extracts heart rate from red channel pixel averages
 */

// Smooth signal with a simple moving average to reduce noise
export function smoothSignal(signal, windowSize = 5) {
  const smoothed = [];
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(signal.length - 1, i + Math.floor(windowSize / 2));
    let sum = 0;
    for (let j = start; j <= end; j++) sum += signal[j];
    smoothed.push(sum / (end - start + 1));
  }
  return smoothed;
}

// Normalize signal to 0-1 range
export function normalizeSignal(signal) {
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  if (max === min) return signal.map(() => 0.5);
  return signal.map(v => (v - min) / (max - min));
}

// Detect peaks in a normalized signal
export function detectPeaks(signal, minDistance = 8, threshold = 0.5) {
  const peaks = [];
  for (let i = 1; i < signal.length - 1; i++) {
    if (
      signal[i] > signal[i - 1] &&
      signal[i] > signal[i + 1] &&
      signal[i] > threshold
    ) {
      // Enforce minimum distance between peaks
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
        peaks.push(i);
      }
    }
  }
  return peaks;
}

// Calculate BPM from peaks detected over a given duration (seconds)
export function calculateBPM(peaks, durationSeconds) {
  if (peaks.length < 2) return 0;
  const beatsPerSecond = peaks.length / durationSeconds;
  return Math.round(beatsPerSecond * 60);
}

// Full pipeline: raw signal array + fps + duration → BPM
export function processSignal(rawSignal, fps = 30, durationSeconds = 30) {
  if (rawSignal.length < fps * 3) return 0; // need at least 3 seconds
  const smoothed = smoothSignal(rawSignal, 7);
  const normalized = normalizeSignal(smoothed);
  const minPeakDistance = Math.floor(fps * 0.4); // 0.4s min between beats = max 150 BPM
  const peaks = detectPeaks(normalized, minPeakDistance, 0.55);
  return calculateBPM(peaks, durationSeconds);
}

// --- Wellness logic ---

export function getZone(bpm) {
  if (bpm < 50) return { label: 'Very low', color: '#60a5fa', description: 'Resting / very calm' };
  if (bpm <= 60) return { label: 'Low', color: '#34d399', description: 'Very relaxed' };
  if (bpm <= 100) return { label: 'Normal', color: '#22c55e', description: 'Healthy resting range' };
  if (bpm <= 110) return { label: 'Slightly elevated', color: '#fbbf24', description: 'Mild stress or activity' };
  if (bpm <= 130) return { label: 'Elevated', color: '#f97316', description: 'Stress or light exercise' };
  return { label: 'High', color: '#ef4444', description: 'High stress or intense effort' };
}

export function calculateWellnessScore(bpm) {
  // Peak score around 60-80 BPM, drops off on both sides
  if (bpm >= 55 && bpm <= 85) return Math.floor(Math.random() * 10) + 85; // 85-95
  if (bpm >= 50 && bpm <= 100) return Math.floor(Math.random() * 15) + 70; // 70-84
  if (bpm >= 40 && bpm <= 115) return Math.floor(Math.random() * 15) + 55; // 55-69
  return Math.floor(Math.random() * 20) + 35; // 35-54
}

export function getAIMessage(bpm, zone) {
  const messages = {
    'Very low': [
      'Your heart rate is very low. This is normal if you have just woken up or are very relaxed. Stay hydrated and rest.',
      'Very low heart rate detected. If you feel dizzy or unusual, take a break and rest.',
    ],
    'Low': [
      'Your heart rate is low and calm. Your body appears well-rested. A great time to focus or meditate.',
      'Nice and relaxed. Your body is in a good recovery state right now.',
    ],
    'Normal': [
      'Your heart rate is in a healthy range. Your body is balanced and calm. Keep up your good habits.',
      'Looking good! Your readings suggest a relaxed and healthy state. Stay hydrated throughout the day.',
      'Your heart rate is normal and steady. Your body is doing well right now.',
    ],
    'Slightly elevated': [
      'Your heart rate is slightly above resting. Try taking a few slow deep breaths and scanning again in a few minutes.',
      'Mild elevation detected. This could be from stress, caffeine, or recent movement. Rest for a moment.',
    ],
    'Elevated': [
      'Your heart rate is elevated. Try sitting down, breathing slowly, and relaxing for 5–10 minutes before scanning again.',
      'Elevated reading. If you have been exercising this is normal. Otherwise, try resting and hydrating.',
    ],
    'High': [
      'Your heart rate is high. Please rest, sit down, and breathe slowly. If this persists, consult a healthcare professional.',
      'High heart rate detected. Rest immediately and avoid exertion. Scan again after 10 minutes of rest.',
    ],
  };
  const options = messages[zone.label] || messages['Normal'];
  return options[Math.floor(Math.random() * options.length)];
}

// Format date for display
export function formatScanTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / 60000);
    return `${mins}m ago`;
  }
  if (diffHours < 24) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
