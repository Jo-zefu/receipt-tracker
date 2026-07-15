import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { uploadReceipts, ReceiptResult } from '../services/api';
import { t, getCurrency } from '../i18n';

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ReceiptResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currency = getCurrency();

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>{t('scan.permissionNeeded')}</Text>
          <Text style={styles.permissionText}>{t('scan.permissionHint')}</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>{t('scan.grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const pic = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (pic) {
      setPhoto(pic.uri);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const pickImage = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setPhoto(pickerResult.assets[0].uri);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleUpload = async () => {
    if (!photo) return;
    setUploading(true);
    setResult(null);
    try {
      const results = await uploadReceipts([photo]);
      if (results.length > 0) {
        setResult(results[0]);
      }
    } catch (e: any) {
      Alert.alert(t('scan.failed'), e.message || '');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setResult(null);
    fadeAnim.setValue(0);
  };

  // Result screen
  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <View style={styles.successBadge}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.resultTitle}>{t('scan.success')}</Text>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('scan.vendor')}</Text>
              <Text style={styles.resultValue}>{result.vendor || t('receipts.unknownVendor')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('scan.amount')}</Text>
              <Text style={styles.resultValueAmount}>
                {result.amount ? `${currency}${result.amount.toFixed(2)}` : t('receipts.pending')}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('scan.date')}</Text>
              <Text style={styles.resultValue}>{result.date || t('receipts.unknownDate')}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('scan.category')}</Text>
              <Text style={styles.resultValue}>{result.category}</Text>
            </View>
          </View>

          {result.confidence === 'low' && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ {t('scan.lowConfidence')}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.btn} onPress={reset}>
            <Text style={styles.btnText}>{t('scan.continue')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.navigate('Receipts')}
          >
            <Text style={[styles.btnText, { color: '#333' }]}>{t('scan.viewAll')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Photo preview
  if (photo) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.previewContainer, { opacity: fadeAnim }]}>
          <Image source={{ uri: photo }} style={styles.preview} />
        </Animated.View>
        <View style={styles.actions}>
          {uploading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4A90D9" />
              <Text style={styles.loadingText}>{t('scan.recognizing')}</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.btn} onPress={handleUpload}>
                <Text style={styles.btnText}>{t('scan.recognize')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={reset}>
                <Text style={[styles.btnText, { color: '#333' }]}>{t('scan.retake')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.hint}>{t('scan.alignHint')}</Text>
        </View>
      </CameraView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
          <Text style={styles.iconText}>📁</Text>
          <Text style={styles.iconLabel}>{t('scan.gallery')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <View style={styles.iconBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F1', justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  scanFrame: { width: 280, height: 200, position: 'relative' },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#4A90D9' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: { color: '#fff', marginTop: 24, fontSize: 15, fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 40,
    backgroundColor: '#1E2227',
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4A90D9' },
  iconBtn: { width: 60, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 28, marginBottom: 4 },
  iconLabel: { color: '#fff', fontSize: 11 },
  previewContainer: { width: '90%', height: '60%', borderRadius: 12, overflow: 'hidden' },
  preview: { width: '100%', height: '100%', resizeMode: 'contain' },
  actions: { marginTop: 24, alignItems: 'center', gap: 12 },
  btn: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 6,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnSecondary: { backgroundColor: '#E7E3DA' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingBox: { alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: '#666', marginTop: 8 },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionIcon: { fontSize: 64, marginBottom: 16 },
  permissionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  permissionText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '88%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: { fontSize: 32, color: '#fff', fontWeight: '700' },
  resultTitle: { fontSize: 22, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  resultGrid: { width: '100%', gap: 16 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E7E3DA' },
  resultLabel: { fontSize: 15, color: '#6B7077' },
  resultValue: { fontSize: 15, color: '#1E2227', fontWeight: '600' },
  resultValueAmount: { fontSize: 18, color: '#e74c3c', fontWeight: '700' },
  warningBox: { backgroundColor: '#FFF3CD', borderRadius: 8, padding: 12, marginTop: 16, width: '100%' },
  warningText: { fontSize: 13, color: '#856404', textAlign: 'center' },
  buttonGroup: { marginTop: 20, gap: 8 },
});
