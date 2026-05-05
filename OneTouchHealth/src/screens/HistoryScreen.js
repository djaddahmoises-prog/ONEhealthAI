import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { getScans } from '../utils/database';
import { getZone, formatScanTime } from '../utils/heartRate';

export default function HistoryScreen({ navigation }) {
  const [scans, setScans] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setScans(getScans(50));
    }, [])
  );

  const avgBPM = scans.length
    ? Math.round(scans.reduce((s, r) => s + r.bpm, 0) / scans.length)
    : null;

  const avgScore = scans.length
    ? Math.round(scans.reduce((s, r) => s + r.wellness_score, 0) / scans.length)
    : null;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>
        <Text style={s.title}>Scan history</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary */}
      {scans.length > 0 && (
        <View style={s.summary}>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>{scans.length}</Text>
            <Text style={s.summaryLbl}>Total scans</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>{avgBPM ?? '--'}</Text>
            <Text style={s.summaryLbl}>Avg BPM</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryVal, { color: colors.green }]}>{avgScore ?? '--'}</Text>
            <Text style={s.summaryLbl}>Avg score</Text>
          </View>
        </View>
      )}

      {/* List */}
      {scans.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.muted2} />
          <Text style={s.emptyText}>No scans recorded yet</Text>
          <TouchableOpacity style={s.startBtn} onPress={() => navigation.navigate('Scan')}>
            <Text style={s.startBtnText}>Start first scan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const z = getZone(item.bpm);
            return (
              <TouchableOpacity
                style={s.item}
                onPress={() => navigation.navigate('Results', { scan: item })}
              >
                <View style={[s.itemDot, { backgroundColor: z.color }]} />
                <View style={s.itemBody}>
                  <Text style={s.itemBPM}>{item.bpm} BPM</Text>
                  <Text style={s.itemZone}>{z.label}</Text>
                </View>
                <View style={s.itemRight}>
                  <View style={[s.scorePill, {
                    backgroundColor: item.wellness_score >= 80 ? colors.greenFaint : colors.amberFaint
                  }]}>
                    <Text style={[s.scorePillText, {
                      color: item.wellness_score >= 80 ? colors.green : colors.amber
                    }]}>{item.wellness_score}</Text>
                  </View>
                  <Text style={s.itemTime}>{formatScanTime(item.created_at)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.muted2} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface2, borderWidth: 0.5, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  summary: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16,
  },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: 14, borderWidth: 0.5, borderColor: colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  summaryVal: { fontSize: 22, fontWeight: '700', color: colors.text },
  summaryLbl: { fontSize: 10, color: colors.muted, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border,
    gap: 10,
  },
  itemDot: { width: 10, height: 10, borderRadius: 5 },
  itemBody: { flex: 1 },
  itemBPM: { fontSize: 15, fontWeight: '500', color: colors.text },
  itemZone: { fontSize: 11, color: colors.muted, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  scorePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  scorePillText: { fontSize: 11, fontWeight: '500' },
  itemTime: { fontSize: 10, color: colors.muted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: colors.muted },
  startBtn: {
    marginTop: 8, backgroundColor: colors.green,
    borderRadius: 20, paddingVertical: 12, paddingHorizontal: 28,
  },
  startBtnText: { fontSize: 14, fontWeight: '600', color: colors.bg },
});
