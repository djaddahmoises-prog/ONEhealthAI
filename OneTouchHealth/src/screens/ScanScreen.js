import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Alert, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import {
  processSignal, getZone, calculateWellnessScore, getAIMessage,
} from '../utils/heartRate';
import { saveScan, getTodayScanCount } from '../utils/database';
import { canScan } from '../utils/paywall';

const SCAN_DURATION = 30; // seconds
const FPS = 30;
const TOTAL_FRAMES = SCAN_DURATION * FPS;

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState('idle'); // idle | scanning | processing | done
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SCAN_DURATION);
  const [liveBPM, setLiveBPM] = useState(null);
  const [fingerDetected, setFingerDetected] = useState(false);

  const cameraRef = useRef(null);
  const signalBuffer = useRef([]);
  const frameCount = useRef(0);
  const scanInterval = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the scan ring
  useEffect(() => {
    if (phase === 'scanning') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanInterval.current) clearInterval(scanInterval.current);
    };
  }, []);

  // Check paywall before scanning
  const checkAndScan = () => {
    if (!canScan()) {
      navigation.navigate('Paywall');
      return;
    }
    startScan();
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera permission required', 'Please allow camera access in Settings.');
        return;
      }
    }
    signalBuffer.current = [];
    frameCount.current = 0;
    setPhase('scanning');
    setProgress(0);
    setTimeLeft(SCAN_DURATION);
    setLiveBPM(null);
    setFingerDetected(false);

    // Simulate frame capture with realistic BPM signal
    // In production: use expo-camera onCameraReady + captureFrame for real pixel data
    simulateScan();
  };

  /**
   * REAL IMPLEMENTATION NOTE:
   * Replace simulateScan() with actual camera frame processing:
   *
   * const processFrame = async () => {
   *   if (!cameraRef.current) return;
   *   const photo = await cameraRef.current.takePictureAsync({
   *     quality: 0.01, base64: true, skipProcessing: true,
   *   });
   *   const redAvg = extractRedChannelAverage(photo.base64);
   *   signalBuffer.current.push(redAvg);
   * };
   *
   * Then call processFrame() every 1000/FPS ms.
   * The extractRedChannelAverage function reads pixel data from base64 image.
   */
  const simulateScan = () => {
    const baseHR = 62 + Math.floor(Math.random() * 26); // 62–88 BPM
    const period = 60 / baseHR; // seconds per beat
    let elapsed = 0;

    scanInterval.current = setInterval(() => {
      elapsed += 1 / FPS;

      // Simulate rPPG signal: sine wave at heart rate frequency + noise
      const signal = Math.sin(2 * Math.PI * elapsed / period)
        + (Math.random() - 0.5) * 0.3;
      signalBuffer.current.push(signal);
      frameCount.current++;

      // Detect finger after 1 second (simulated)
      if (elapsed > 1) setFingerDetected(true);

      // Live BPM estimate every 5 seconds
      if (frameCount.current % (FPS * 5) === 0 && signalBuffer.current.length > FPS * 5) {
        const partial = processSignal(
          signalBuffer.current,
          FPS,
          Math.min(elapsed, SCAN_DURATION)
        );
        if (partial > 30 && partial < 200) setLiveBPM(partial);
      }

      const pct = frameCount.current / TOTAL_FRAMES;
      setProgress(pct);
      setTimeLeft(Math.max(0, Math.ceil(SCAN_DURATION - elapsed)));

      if (frameCount.current >= TOTAL_FRAMES) {
        clearInterval(scanInterval.current);
        finalizeScan();
      }
    }, 1000 / FPS);
  };

  const finalizeScan = useCallback(() => {
    setPhase('processing');

    setTimeout(() => {
      let bpm = processSignal(signalBuffer.current, FPS, SCAN_DURATION);

      // Clamp to realistic range
      if (bpm < 40 || bpm > 200) bpm = liveBPM || 72;

      const zone = getZone(bpm);
      const wellness_score = calculateWellnessScore(bpm);
      const ai_message = getAIMessage(bpm, zone);

      saveScan({ bpm, wellness_score, zone: zone.label, ai_message });

      setPhase('done');
      navigation.replace('Results', {
        scan: {
          bpm,
          wellness_score,
          zone: zone.label,
          ai_message,
          created_at: new Date().toISOString(),
        }
      });
    }, 1200);
  }, [liveBPM]);

  const cancelScan = () => {
    if (scanInterval.current) clearInterval(scanInterval.current);
    setPhase('idle');
    setProgress(0);
    setLiveBPM(null);
  };

  if (!permission) {
    return <View style={s.container} />;
  }

  return (
    <View style={s.container}>
      {/* Back button */}
      <TouchableOpacity style={s.backBtn} onPress={() => {
        if (phase === 'scanning') cancelScan();
        navigation.goBack();
      }}>
        <Ionicons name="arrow-back" size={22} color={colors.muted} />
      </TouchableOpacity>

      <Text style={s.title}>
        {phase === 'idle' ? 'New scan' :
         phase === 'scanning' ? 'Scanning...' :
         phase === 'processing' ? 'Analyzing...' : 'Done'}
      </Text>
      <Text style={s.subtitle}>
        {phase === 'idle'
          ? 'Cover the camera and flash completely\nwith your fingertip. Hold still.'
          : phase === 'scanning' && !fingerDetected
          ? 'Place your finger on the camera now'
          : phase === 'scanning'
          ? 'Keep your finger still. Breathe normally.'
          : phase === 'processing'
          ? 'Calculating your heart rate...'
          : ''}
      </Text>

      {/* Camera (hidden behind finger) */}
      {(phase === 'scanning' || phase === 'idle') && permission?.granted && (
        <View style={s.cameraWrap}>
          <CameraView
            ref={cameraRef}
            style={s.camera}
            facing="back"
            enableTorch={phase === 'scanning'}
          />
          <View style={s.cameraOverlay} />
        </View>
      )}

      {/* Scan ring / tap target */}
      {phase === 'idle' && (
        <TouchableOpacity style={s.tapTarget} onPress={checkAndScan} activeOpacity={0.8}>
          <View style={s.outerRing}>
            <View style={s.innerCircle}>
              <Ionicons name="finger-print" size={36} color={colors.green} />
            </View>
          </View>
          <Text style={s.tapHint}>Tap to start</Text>
        </TouchableOpacity>
      )}

      {phase === 'scanning' && (
        <View style={s.scanningArea}>
          <Animated.View style={[s.outerRing, {
            transform: [{ scale: pulseAnim }],
            borderColor: fingerDetected ? colors.green : colors.muted2,
          }]}>
            <View style={[s.innerCircle, {
              backgroundColor: fingerDetected ? colors.greenFaint : colors.surface2
            }]}>
              {fingerDetected
                ? <Ionicons name="heart" size={32} color={colors.green} />
                : <Ionicons name="finger-print" size={32} color={colors.muted} />
              }
            </View>
          </Animated.View>

          {/* BPM live readout */}
          <View style={s.liveReadout}>
            <Text style={s.liveBPM}>{liveBPM ?? '--'}</Text>
            <Text style={s.liveBPMLabel}>BPM</Text>
          </View>

          {/* Progress bar */}
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={s.timeLeft}>{timeLeft}s</Text>
          </View>

          <TouchableOpacity style={s.cancelBtn} onPress={cancelScan}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'processing' && (
        <View style={s.processingArea}>
          <View style={s.outerRing}>
            <View style={s.innerCircle}>
              <Ionicons name="pulse" size={36} color={colors.green} />
            </View>
          </View>
          <Text style={s.processingText}>Reading signal peaks...</Text>
        </View>
      )}

      {/* Tips */}
      {phase === 'idle' && (
        <View style={s.tips}>
          {[
            'Cover camera and flash completely',
            'Hold firmly — do not press too hard',
            'Stay still and breathe normally',
            'Find good ambient lighting',
          ].map((tip, i) => (
            <View key={i} style={s.tip}>
              <View style={s.tipDot} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 56, alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: 56, left: 24,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface2, borderWidth: 0.5, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  title: { fontSize: 22, fontWeight: '500', color: colors.text, marginTop: 8, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 32 },
  cameraWrap: {
    position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0.01,
  },
  camera: { width: 1, height: 1 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject },
  tapTarget: { alignItems: 'center', gap: 16 },
  outerRing: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, borderColor: colors.green,
    justifyContent: 'center', alignItems: 'center',
  },
  innerCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.greenFaint,
    justifyContent: 'center', alignItems: 'center',
  },
  tapHint: { fontSize: 14, color: colors.muted },
  scanningArea: { alignItems: 'center', gap: 24, width: '100%', paddingHorizontal: 24 },
  liveReadout: { alignItems: 'center' },
  liveBPM: { fontSize: 56, fontWeight: '700', color: colors.green, lineHeight: 60 },
  liveBPMLabel: { fontSize: 14, color: colors.muted },
  progressWrap: { width: '100%', gap: 6 },
  progressTrack: {
    height: 3, backgroundColor: colors.surface2,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.green, borderRadius: 2 },
  timeLeft: { fontSize: 12, color: colors.muted, textAlign: 'right' },
  cancelBtn: {
    paddingVertical: 10, paddingHorizontal: 24,
    borderWidth: 0.5, borderColor: colors.border, borderRadius: 20,
  },
  cancelText: { fontSize: 13, color: colors.muted },
  processingArea: { alignItems: 'center', gap: 20 },
  processingText: { fontSize: 14, color: colors.muted },
  tips: { marginTop: 32, paddingHorizontal: 32, gap: 12, width: '100%' },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  tipText: { fontSize: 13, color: colors.muted },
});
