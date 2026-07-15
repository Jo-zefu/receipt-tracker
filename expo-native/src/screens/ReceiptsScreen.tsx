import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReceipts, clearReceipts, ReceiptResult } from '../services/api';
import { t, getCurrency } from '../i18n';

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<ReceiptResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const currency = getCurrency();

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (e: any) {
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

  const handleClear = () => {
    Alert.alert(t('receipts.confirmClear'), t('receipts.confirmClearMsg'), [
      { text: t('receipts.cancel'), style: 'cancel' },
      {
        text: t('receipts.clear'),
        style: 'destructive',
        onPress: async () => {
          try {
            await clearReceipts();
            setReceipts([]);
          } catch (e: any) {
            Alert.alert(t('receipts.failed'), e.message);
          }
        },
      },
    ]);
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchSearch =
      !searchText ||
      r.vendor?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.rawText.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = !filterCategory || r.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const total = filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const categories = Array.from(new Set(receipts.map((r) => r.category)));

  const categoryColor: Record<string, string> = {
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

  const renderItem = ({ item }: { item: ReceiptResult }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: categoryColor[item.category] || '#AEB6BF' },
          ]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.date}>{item.date || t('receipts.unknownDate')}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendor}>{item.vendor || t('receipts.unknownVendor')}</Text>
          <Text style={styles.filename} numberOfLines={1}>
            {item.filename}
          </Text>
        </View>
        <Text style={styles.amount}>
          {item.amount ? `${currency}${item.amount.toFixed(2)}` : t('receipts.pending')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('receipts.searchPlaceholder')}
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category filters */}
      {categories.length > 0 && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
            onPress={() => setFilterCategory(null)}
          >
            <Text style={[styles.filterText, !filterCategory && styles.filterTextActive]}>
              {t('receipts.all')}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
              onPress={() => setFilterCategory(cat === filterCategory ? null : cat)}
            >
              <Text
                style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>
            {filterCategory ? `${filterCategory}` : t('receipts.totalReceipts')}
          </Text>
          <Text style={styles.summaryValue}>{filteredReceipts.length}</Text>
        </View>
        <View>
          <Text style={styles.summaryLabel}>{t('receipts.totalAmount')}</Text>
          <Text style={styles.summaryAmount}>{currency}{total.toFixed(2)}</Text>
        </View>
        {receipts.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>{t('receipts.clear')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredReceipts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={
          filteredReceipts.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchText || filterCategory ? t('receipts.noMatch') : t('receipts.noReceipts')}
            </Text>
            <Text style={styles.emptyHint}>
              {searchText || filterCategory
                ? t('receipts.adjustSearch')
                : t('receipts.goScan')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F1' },
  searchBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E3DA',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  filterText: { fontSize: 13, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E3DA',
  },
  summaryLabel: { fontSize: 12, color: '#999' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#333' },
  summaryAmount: { fontSize: 22, fontWeight: '700', color: '#e74c3c' },
  clearBtn: { fontSize: 14, color: '#e74c3c', padding: 8 },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: '#999' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vendor: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: '700', color: '#333', marginLeft: 12 },
  filename: { fontSize: 11, color: '#bbb' },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#ccc' },
});
