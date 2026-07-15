import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { getReceipts, ReceiptResult } from '../services/api';
import { t, getCurrency } from '../i18n';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }: any) {
  const [receipts, setReceipts] = useState<ReceiptResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const currency = getCurrency();

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (e) {
      // silent fail
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const thisMonthReceipts = receipts.filter((r) => {
    if (!r.date) return false;
    const d = new Date(r.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const thisMonthAmount = thisMonthReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const avgPerReceipt = receipts.length > 0 ? totalAmount / receipts.length : 0;

  // Category stats
  const categoryStats: Record<string, number> = {};
  receipts.forEach((r) => {
    categoryStats[r.category] = (categoryStats[r.category] || 0) + (r.amount || 0);
  });

  const categoryColors: Record<string, string> = {
    '餐饮': '#FF6B6B',
    '交通': '#4ECDC4',
    '住宿': '#45B7D1',
    '办公用品': '#96CEB4',
    '通信': '#FFEAA7',
    '医疗': '#DDA0DD',
    '教育': '#98D8C8',
    '日用品': '#F7DC6F',
    '水电物业': '#BB8FCE',
    '其他': '#AEB6BF',
    'Food & Dining': '#FF6B6B',
    'Transportation': '#4ECDC4',
    'Shopping': '#45B7D1',
    'Entertainment': '#96CEB4',
    'Healthcare': '#DDA0DD',
  };

  const pieData = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amount]) => ({
      name,
      amount,
      color: categoryColors[name] || '#AEB6BF',
      legendFontColor: '#555',
      legendFontSize: 13,
    }));

  // Monthly trend (6 months)
  const monthlyData: number[] = [];
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    monthLabels.push(`${m + 1}月`);

    const monthTotal = receipts
      .filter((r) => {
        if (!r.date) return false;
        const rd = new Date(r.date);
        return rd.getMonth() === m && rd.getFullYear() === y;
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    monthlyData.push(monthTotal);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Stats */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('home.thisMonth')}</Text>
        <Text style={styles.heroAmount}>{currency}{thisMonthAmount.toFixed(2)}</Text>
        <Text style={styles.heroSubtitle}>
          {thisMonthReceipts.length} {t('home.transactions')}
        </Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t('home.totalReceipts')}</Text>
          <Text style={styles.kpiValue}>{receipts.length}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t('home.totalAmount')}</Text>
          <Text style={styles.kpiValue}>{currency}{totalAmount.toFixed(0)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t('home.avgPerReceipt')}</Text>
          <Text style={styles.kpiValue}>{currency}{avgPerReceipt.toFixed(0)}</Text>
        </View>
      </View>

      {/* Monthly Trend */}
      {receipts.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>{t('home.trend')}</Text>
          <LineChart
            data={{
              labels: monthLabels,
              datasets: [{ data: monthlyData.length > 0 ? monthlyData : [0] }],
            }}
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 144, 217, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.6})`,
              style: { borderRadius: 12 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#4A90D9' },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Category Pie Chart */}
      {pieData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>{t('home.categoryBreakdown')}</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>{t('home.scanNew')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Receipts')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>{t('home.viewAll')}</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {receipts.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyTitle}>{t('home.noReceipts')}</Text>
          <Text style={styles.emptyHint}>{t('home.noReceiptsHint')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F1' },
  hero: {
    backgroundColor: '#4A90D9',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  heroAmount: { fontSize: 44, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiLabel: { fontSize: 12, color: '#999', marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: '700', color: '#333' },
  chartSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  chart: { marginVertical: 8, borderRadius: 12 },
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: { fontSize: 24, marginRight: 16 },
  actionText: { fontSize: 15, fontWeight: '500', color: '#333' },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#999' },
});
