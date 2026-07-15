import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Linking,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExportUrl, setBaseUrl } from '../services/api';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:3001');
  const [saved, setSaved] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const saveUrl = async () => {
    const trimmed = serverUrl.trim().replace(/\/$/, '');
    if (!trimmed.startsWith('http')) {
      Alert.alert('格式错误', '请输入完整的 URL，如 http://192.168.1.100:3001');
      return;
    }
    setBaseUrl(trimmed);
    await AsyncStorage.setItem('serverUrl', trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const url = getExportUrl();
    Linking.openURL(url).catch(() => {
      Alert.alert('导出失败', '请检查服务器是否运行');
    });
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/receipts`);
      if (response.ok) {
        Alert.alert('连接成功', '服务器运行正常');
      } else {
        Alert.alert('连接失败', `状态码: ${response.status}`);
      }
    } catch (e: any) {
      Alert.alert('连接失败', '无法连接到服务器，请检查 IP 和端口');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 服务器设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服务器配置</Text>
        <Text style={styles.hint}>输入运行 receipt-ocr 的电脑局域网地址</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:3001"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, styles.btnHalf]} onPress={saveUrl}>
            <Text style={styles.btnText}>{saved ? '✓ 已保存' : '保存'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnHalf, styles.btnOutline]}
            onPress={testConnection}
          >
            <Text style={[styles.btnText, { color: '#4A90D9' }]}>测试连接</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 数据管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>
        <Text style={styles.hint}>导出所有票据为 Excel 文件（含图片）</Text>
        <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={handleExport}>
          <Text style={styles.btnText}>📊 导出 Excel</Text>
        </TouchableOpacity>
      </View>

      {/* 偏好设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>偏好设置</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>自动备份</Text>
            <Text style={styles.settingDesc}>识别后自动保存到云端</Text>
          </View>
          <Switch value={autoBackup} onValueChange={setAutoBackup} />
        </View>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>推送通知</Text>
            <Text style={styles.settingDesc}>识别完成后提醒</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>

      {/* 使用指南 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用指南</Text>
        <View style={styles.stepList}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>电脑端启动 receipt-ocr 服务（npm run dev）</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>确保手机和电脑在同一 WiFi 网络</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>填入电脑 IP 地址并保存（如 192.168.1.100）</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>点击"测试连接"确保服务正常</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>5</Text>
            <Text style={styles.stepText}>去"扫描"页面拍摄或选择票据图片</Text>
          </View>
        </View>
      </View>

      {/* 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>版本</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>OCR 引擎</Text>
          <Text style={styles.aboutValue}>百度 AI</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>支持格式</Text>
          <Text style={styles.aboutValue}>JPG, PNG, GIF</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F1' },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E2227', marginBottom: 8 },
  hint: { fontSize: 13, color: '#6B7077', marginBottom: 12, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#E7E3DA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#F7F5F1',
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: {
    backgroundColor: '#4A90D9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnHalf: { flex: 1, marginTop: 0 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4A90D9' },
  btnGreen: { backgroundColor: '#27ae60' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E3DA',
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#1E2227', marginBottom: 4 },
  settingDesc: { fontSize: 13, color: '#6B7077' },
  stepList: { gap: 12 },
  step: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90D9',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
  },
  stepText: { flex: 1, fontSize: 14, color: '#1E2227', lineHeight: 22, paddingTop: 3 },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E3DA',
  },
  aboutLabel: { fontSize: 14, color: '#6B7077' },
  aboutValue: { fontSize: 14, color: '#1E2227', fontWeight: '500' },
});
