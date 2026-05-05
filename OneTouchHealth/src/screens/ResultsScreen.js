import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { getZone, formatScanTime } from '../utils/heartRate';

export default function ResultsScreen({ route, navigation }) {
  const { scan } = route.params;
  const zone = getZone(scan.bpm);

  const scoreColor = scan.wellness_score >= 80
    ? colors.green
    : scan.wellness_score >= 60
    ? colors.amber
    : '#ef4444';

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Back */}
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>

        {/* Score circle */}
        <View style={s.scoreSection}>
          <View style={[s.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[s.scoreNum, { color: scoreColor }]}>{scan.wellness_score}</Text>
            <Text style={s.scoreLabel}>SCORE</Text>
          </View>
          <Text style={s.statusTitle}>{zone.label} heart rate</Text>
          <Text style={s.statusSub}>{zone.description}</Text>
        </View>

        {/* Metrics grid */}
        <View style={s.metricsGrid}>
          <View style={s.metricCard}>
            <Text style={s.metricVal}>{scan.bpm} <Text style={s.metricUnit}>bpm</Text></Text>
            <Text style={s.metricLbl}>Heart rate</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricVal, { color: zone.color }]}>{zone.label}</Text>
            <Text style={s.metricLbl}>Zone</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricVal}>30 <Text style={s.metricUnit}>s</Text></Text>
            <Text style={s.metricLbl}>Duration</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricVal}>High</Text>
            <Text style={s.metricLbl}>Signal quality</Text>
          </View>
        </View>

        {/* AI insight */}
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <View style={s.aiIcon}>
              <Text style={s.aiIconText}>✦</Text>
            </View>
            <Text style={s.aiTitle}>AI wellness insight</Text>
          </View>
          <Text style={s.aiText}>{scan.ai_message}</Text>
        </View>

        {/* BPM zones reference */}
        <View style={s.zonesCard}>
          <Text style={s.zonesTitle}>Heart rate zones</Text>
          {[
            { label: 'Very low', range: '< 50', color: '#60a5fa' },
            { label: 'Low', range: '50–60', color: '#34d399' },
            { label: 'Normal', range: '60–100', color: colors.green },
            { label: 'Slightly elevated', range: '100–110', color: colors.amber },
            { label: 'Elevated', range: '110–130', color: '#f97316' },
            { label: 'High', range: '> 130', color: '#ef4444' },
          ].map((z) => (
            <View key={z.label} style={s.zoneRow}>
              <View style={[s.zoneDot, { backgroundColor: z.color }]} />
              <Text style={[s.zoneName, {
                color: z.label === zone.label ? colors.text : colors.muted
              }]}>{z.label}</Text>
              <Text style={s.zoneRange}>{z.range} bpm</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Scan')}>
            <Text style={s.btnPrimaryText}>Scan again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('History')}>
            <Text style={s.btnSecondaryText}>View history</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>
          This app provides wellness information only and does not diagnose medical conditions.
        </Text>

        {scan.created_at && (
          <Text style={s.timestamp}>{formatScanTime(scan.created_at)}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },
  backBtn: {
    marginTop: 56, marginLeft: 24, marginBottom: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface2, borderWidth: 0.5, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreSection: { alignItems: 'center', paddingVertical: 20 },
  scoreCircle: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 2.5,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  scoreNum: { fontSize: 44, fontWeight: '700', lineHeight: 48 },
  scoreLabel: { fontSize: 10, color: colors.muted, letterSpacing: 1 },
  statusTitle: { fontSize: 18, fontWeight: '500', color: colors.text, marginBottom: 4 },
  statusSub: { fontSize: 13, color: colors.muted },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 20, marginBottom: 16,
  },
  metricCard: {
    width: '47%', backgroundColor: colors.surface,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
    padding: 16,
  },
  metricVal: { fontSize: 22, fontWeight: '700', color: colors.text },
  metricUnit: { fontSize: 12, color: colors.muted, fontWeight: '400' },
  metricLbl: { fontSize: 11, color: colors.muted, marginTop: 4 },
  aiCard: {
    marginHorizontal: 20, backgroundColor: colors.surface2,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.greenBorder,
    padding: 16, marginBottom: 16,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  aiIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.greenFaint, borderWidth: 0.5, borderColor: colors.greenBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  aiIconText: { fontSize: 14, color: colors.green },
  aiTitle: { fontSize: 13, fontWeight: '500', color: colors.green },
  aiText: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  zonesCard: {
    marginHorizontal: 20, backgroundColor: colors.surface,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
    padding: 16, marginBottom: 16,
  },
  zonesTitle: { fontSize: 12, color: colors.muted, marginBottom: 12, letterSpacing: 0.5 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneName: { flex: 1, fontSize: 13 },
  zoneRange: { fontSize: 12, color: colors.muted },
  actions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16,
  },
  btnPrimary: {
    flex: 2, backgroundColor: colors.green, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 14, fontWeight: '600', color: colors.bg },
  btnSecondary: {
    flex: 1, backgroundColor: colors.surface2,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  btnSecondaryText: { fontSize: 14, color: colors.muted },
  disclaimer: {
    fontSize: 10, color: colors.muted2, textAlign: 'center',
    paddingHorizontal: 32, lineHeight: 16, marginBottom: 4,
  },
  timestamp: { fontSize: 11, color: colors.muted2, textAlign: 'center' },
});
