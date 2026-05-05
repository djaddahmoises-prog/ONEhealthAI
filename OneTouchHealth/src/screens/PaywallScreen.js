import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { PLANS, setActivePlan } from '../utils/paywall';

const PLAN_ORDER = ['entry', 'daily', 'monthly', 'pro'];

export default function PaywallScreen({ navigation }) {
  const [selected, setSelected] = useState('monthly');

  const handlePurchase = () => {
    Alert.alert(
      'Purchase simulated',
      `${PLANS[selected].name} activated for demo purposes.`,
      [{
        text: 'OK', onPress: () => {
          setActivePlan(selected);
          navigation.navigate('Home');
        }
      }]
    );
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <TouchableOpacity style={s.close} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color={colors.muted} />
        </TouchableOpacity>
        <View style={s.hero}>
          <View style={s.lockIcon}>
            <Ionicons name="heart" size={28} color={colors.green} />
          </View>
          <Text style={s.heroTitle}>Unlock full access</Text>
          <Text style={s.heroSub}>
            You've reached your free scan limit.{'\n'}
            Upgrade for unlimited scans and full AI insights.
          </Text>
        </View>
        <View style={s.features}>
          {['Unlimited daily scans','Full AI wellness insights','Complete scan history','Heart rate trends'].map((f) => (
            <View key={f} style={s.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.green} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <Text style={s.plansLabel}>Choose a plan</Text>
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isSelected = selected === planId;
          return (
            <TouchableOpacity key={planId} style={[s.planCard, isSelected && s.planCardSelected]} onPress={() => setSelected(planId)} activeOpacity={0.8}>
              <View style={s.planTop}>
                <View style={s.planLeft}>
                  <Text style={[s.planName, isSelected && { color: colors.text }]}>{plan.name}</Text>
                  {plan.popular && <View style={s.popularBadge}><Text style={s.popularText}>POPULAR</Text></View>}
                </View>
                <View style={s.planPriceWrap}>
                  <Text style={[s.planPrice, isSelected && { color: colors.green }]}>{plan.price}</Text>
                  <Text style={s.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              <Text style={s.planDesc}>{plan.description}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={s.cta} onPress={handlePurchase} activeOpacity={0.85}>
          <Text style={s.ctaText}>Unlock {PLANS[selected].name} — {PLANS[selected].price}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.freeBtn} onPress={() => navigation.goBack()}>
          <Text style={s.freeBtnText}>Continue with free plan</Text>
        </TouchableOpacity>
        <Text style={s.disclaimer}>
          Subscriptions renew automatically. Cancel anytime in App Store / Google Play.{'\n'}
          This app provides wellness information only and does not diagnose medical conditions.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },
  close: { marginTop: 56, marginRight: 24, alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface2, borderWidth: 0.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 32, paddingBottom: 24 },
  lockIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.greenFaint, borderWidth: 0.5, borderColor: colors.greenBorder, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 8 },
  heroSub: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  features: { paddingHorizontal: 24, gap: 8, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: colors.muted },
  plansLabel: { fontSize: 11, color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 24, marginBottom: 10 },
  planCard: { marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginBottom: 10 },
  planCardSelected: { borderColor: colors.green, backgroundColor: colors.greenFaint },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 14, fontWeight: '500', color: colors.muted },
  popularBadge: { backgroundColor: colors.green, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  popularText: { fontSize: 9, fontWeight: '700', color: colors.bg, letterSpacing: 0.5 },
  planPriceWrap: { alignItems: 'flex-end' },
  planPrice: { fontSize: 16, fontWeight: '700', color: colors.muted },
  planPeriod: { fontSize: 10, color: colors.muted },
  planDesc: { fontSize: 12, color: colors.muted },
  cta: { marginHorizontal: 20, backgroundColor: colors.green, borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  ctaText: { fontSize: 15, fontWeight: '600', color: colors.bg },
  freeBtn: { alignItems: 'center', paddingVertical: 8 },
  freeBtnText: { fontSize: 13, color: colors.muted },
  disclaimer: { fontSize: 10, color: colors.muted2, textAlign: 'center', paddingHorizontal: 32, marginTop: 20, lineHeight: 16 },
});
