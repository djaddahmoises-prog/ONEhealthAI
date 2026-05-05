import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { getScans, getTodayScanCount, getLatestScan } from '../utils/database';
import { getZone, formatScanTime } from '../utils/heartRate';
import { scansRemaining, getActivePlan } from '../utils/paywall';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [scans, setScans] = useState([]);
  const [latestScan, setLatestScan] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const data = getScans(10);
      setScans(data);
      setLatestScan(getLatestScan());
      setTodayCount(getTodayScanCount());
      setRemaining(scansRemaining());
    }, [])
  );

  const wellnessScore = latestScan?.wellness_score ?? null;
  const latestBPM = latestScan?.bpm ?? null;
  const zone = latestBPM ? getZone(latestBPM) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>ONETOUCH</Text>
          <TouchableOpacity style={s.histBtn} onPress={() => navigation.navigate('History')}>
            <Ionicons name="time-outline" size={22} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={s.greet}>
          <Text style={s.greetSub}>{greeting}</Text>
          <Text style={s.greetTitle}>How are you feeling?</Text>
        </View>

        {/* Score card */}
        <View style={s.scoreCard}>
          <View style={s.scoreLeft}>
            <Text style={s.scoreLabel}>Wellness score</Text>
            <View style={s.scoreRow}>
              <Text style={s.scoreNum}>{wellnessScore ?? '--'}</Text>
              <Text style={s.scoreMax}>/100</Text>
            </View>
            {zone && (
              <View style={s.zoneBadge}>
                <View style={[s.zoneDot, { backgroundColor: zone.color }]} />
                <Text style={s.zoneText}>{zone.label}</Text>
              </View>
            )}
          </View>
          <View style={s.scoreRight}>
            <Text style={s.bpmNum}>{latestBPM ?? '--'}</Text>
            <Text style={s.bpmLabel}>BPM</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statVal}>{todayCount}</Text>
            <Text style={s.statLbl}>Today</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statVal}>{getActivePlan() ? '∞' : remaining}</Text>
            <Text style={s.statLbl}>Left</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statVal}>{scans.length}</Text>
            <Text style={s.statLbl}>Total</Text>
          </View>
        </View>

        {/* Scan button */}
        <TouchableOpacity
          style={s.scanBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Scan')}
        >
          <Ionicons name="pulse" size={20} color={colors.bg} style={{ marginRight: 8 }} />
          <Text style={s.scanBtnText}>Start scan</Text>
        </TouchableOpacity>

        {/* Recent scans */}
        {scans.length > 0 && (
          <View style={s.recentSection}>
            <Text style={s.sectionLabel}>Recent scans</Text>
            {scans.slice(0, 5).map((scan) => {
              const z = getZone(scan.bpm);
              return (
                <TouchableOpacity
                  key={scan.id}
                  style={s.histItem}
                  onPress={() => navigation.navigate('Results', { scan })}
                >
                  <View style={s.histLeft}>
                    <View style={[s.histDot, { backgroundColor: z.color }]} />
                    <View>
                      <Text style={s.histBPM}>{scan.bpm} BPM</Text>
                      <Text style={s.histTime}>{formatScanTime(scan.created_at)}</Text>
                    </View>
                  </View>
                  <View style={[s.scorePill, {
                    backgroundColor: scan.wellness_score >= 80
                      ? colors.greenFaint
                      : colors.amberFaint
                  }]}>
                    <Text style={[s.scorePillText, {
                      color: scan.wellness_score >= 80 ? colors.green : colors.amber
                    }]}>{scan.wellness_score}/100</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {scans.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="heart-outline" size={40} color={colors.muted2} />
            <Text style={s.emptyText}>No scans yet. Tap Start scan to begin.</Text>
          </View>
        )}

        <Text style={s.disclaimer}>
          This app provides wellness information only and does not diagnose medical conditions.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8,
  },
  logo: { fontSize: 14, fontWeight: '700', color: colors.green, letterSpacing: 2 },
  histBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface2, borderWidth: 0.5, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  greet: { paddingHorizontal: 24, paddingBottom: 20 },
  greetSub: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  greetTitle: { fontSize: 24, fontWeight: '500', color: colors.text },
  scoreCard: {
    marginHorizontal: 20, backgroundColor: colors.surface2,
    borderRadius: 24, borderWidth: 0.5, borderColor: colors.border,
    padding: 20, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  scoreLeft: { flex: 1 },
  scoreLabel: { fontSize: 11, color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  scoreNum: { fontSize: 52, fontWeight: '700', color: colors.green, lineHeight: 56 },
  scoreMax: { fontSize: 14, color: colors.muted },
  zoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneText: { fontSize: 12, color: colors.muted },
  scoreRight: { alignItems: 'flex-end', paddingTop: 4 },
  bpmNum: { fontSize: 32, fontWeight: '700', color: colors.text },
  bpmLabel: { fontSize: 11, color: colors.muted },
  statsRow: {
    flexDirection: 'row', gap: 8,
    marginHorizontal: 20, marginBottom: 16,
  },
  statBox: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: 14, borderWidth: 0.5, borderColor: colors.border,
    paddingVertical: 12, alignItems: 'center',
  },
  statVal: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLbl: { fontSize: 10, color: colors.muted, marginTop: 2 },
  scanBtn: {
    marginHorizontal: 20, backgroundColor: colors.green,
    borderRadius: 20, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  scanBtnText: { fontSize: 16, fontWeight: '600', color: colors.bg },
  recentSection: { paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11, color: colors.muted, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 12,
  },
  histItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  histLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histBPM: { fontSize: 14, fontWeight: '500', color: colors.text },
  histTime: { fontSize: 11, color: colors.muted, marginTop: 2 },
  scorePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scorePillText: { fontSize: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', maxWidth: 220 },
  disclaimer: {
    fontSize: 10, color: colors.muted2, textAlign: 'center',
    paddingHorizontal: 32, marginTop: 32, lineHeight: 16,
  },
});
