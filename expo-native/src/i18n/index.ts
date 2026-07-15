import { Platform, NativeModules } from 'react-native';

export type Locale = 'zh' | 'en';

/**
 * Detect device language. Returns 'zh' for Chinese, 'en' for everything else.
 */
export function getDeviceLocale(): Locale {
  let deviceLang = 'en';

  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      const languages = settings?.AppleLanguages;
      if (languages && languages.length > 0) {
        deviceLang = languages[0];
      }
    } else if (Platform.OS === 'android') {
      deviceLang = NativeModules.I18nManager?.localeIdentifier || 'en';
    }
  } catch {
    // fallback to English
  }

  return deviceLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const zh = {
  // Home
  'home.thisMonth': '本月支出',
  'home.transactions': '笔交易',
  'home.totalReceipts': '累计票据',
  'home.totalAmount': '累计金额',
  'home.avgPerReceipt': '平均单笔',
  'home.trend': '支出趋势（近6个月）',
  'home.categoryBreakdown': '支出分类',
  'home.quickActions': '快捷操作',
  'home.scanNew': '扫描新票据',
  'home.viewAll': '查看全部票据',
  'home.noReceipts': '还没有票据',
  'home.noReceiptsHint': '点击下方"扫描"按钮开始添加',

  // Scan
  'scan.permissionNeeded': '需要相机权限',
  'scan.permissionHint': '允许使用相机来拍摄票据',
  'scan.grantPermission': '授权相机',
  'scan.alignHint': '将票据对准框内拍摄',
  'scan.gallery': '相册',
  'scan.recognize': '开始识别',
  'scan.retake': '重拍',
  'scan.recognizing': '正在识别...',
  'scan.success': '识别成功',
  'scan.failed': '识别失败',
  'scan.vendor': '商户',
  'scan.amount': '金额',
  'scan.date': '日期',
  'scan.category': '分类',
  'scan.lowConfidence': '识别置信度较低，建议人工核对',
  'scan.continue': '继续扫描',
  'scan.viewAll': '查看全部',

  // Receipts
  'receipts.searchPlaceholder': '搜索商户或内容',
  'receipts.all': '全部',
  'receipts.totalReceipts': '票据总数',
  'receipts.totalAmount': '合计金额',
  'receipts.clear': '清空',
  'receipts.confirmClear': '确认清空',
  'receipts.confirmClearMsg': '将删除所有已识别的票据记录',
  'receipts.cancel': '取消',
  'receipts.failed': '操作失败',
  'receipts.noMatch': '无匹配票据',
  'receipts.noReceipts': '暂无票据',
  'receipts.adjustSearch': '尝试调整搜索条件',
  'receipts.goScan': '去"扫描"页面拍照或选择图片',
  'receipts.unknownDate': '日期未知',
  'receipts.unknownVendor': '未识别商户',
  'receipts.pending': '待确认',

  // Settings
  'settings.title': '设置',
  'settings.serverAddress': '服务器地址',
  'settings.save': '保存',
  'settings.saved': '已保存',

  // Tabs
  'tab.home': '首页',
  'tab.scan': '扫描',
  'tab.receipts': '票据',
  'tab.settings': '设置',
};

const en: typeof zh = {
  // Home
  'home.thisMonth': 'This Month',
  'home.transactions': 'transactions',
  'home.totalReceipts': 'Total Receipts',
  'home.totalAmount': 'Total Amount',
  'home.avgPerReceipt': 'Average',
  'home.trend': 'Spending Trend (6 months)',
  'home.categoryBreakdown': 'Spending by Category',
  'home.quickActions': 'Quick Actions',
  'home.scanNew': 'Scan New Receipt',
  'home.viewAll': 'View All Receipts',
  'home.noReceipts': 'No Receipts Yet',
  'home.noReceiptsHint': 'Tap "Scan" below to add receipts',

  // Scan
  'scan.permissionNeeded': 'Camera Permission Needed',
  'scan.permissionHint': 'Allow camera access to scan receipts',
  'scan.grantPermission': 'Grant Permission',
  'scan.alignHint': 'Align receipt within the frame',
  'scan.gallery': 'Gallery',
  'scan.recognize': 'Recognize',
  'scan.retake': 'Retake',
  'scan.recognizing': 'Recognizing...',
  'scan.success': 'Recognition Complete',
  'scan.failed': 'Recognition Failed',
  'scan.vendor': 'Vendor',
  'scan.amount': 'Amount',
  'scan.date': 'Date',
  'scan.category': 'Category',
  'scan.lowConfidence': 'Low confidence. Please verify manually.',
  'scan.continue': 'Continue Scanning',
  'scan.viewAll': 'View All',

  // Receipts
  'receipts.searchPlaceholder': 'Search vendor or content',
  'receipts.all': 'All',
  'receipts.totalReceipts': 'Total Receipts',
  'receipts.totalAmount': 'Total Amount',
  'receipts.clear': 'Clear',
  'receipts.confirmClear': 'Confirm Clear',
  'receipts.confirmClearMsg': 'This will delete all recognized receipts',
  'receipts.cancel': 'Cancel',
  'receipts.failed': 'Operation Failed',
  'receipts.noMatch': 'No matching receipts',
  'receipts.noReceipts': 'No receipts yet',
  'receipts.adjustSearch': 'Try adjusting your search',
  'receipts.goScan': 'Go to "Scan" to take photos or select images',
  'receipts.unknownDate': 'Unknown date',
  'receipts.unknownVendor': 'Unknown vendor',
  'receipts.pending': 'Pending',

  // Settings
  'settings.title': 'Settings',
  'settings.serverAddress': 'Server Address',
  'settings.save': 'Save',
  'settings.saved': 'Saved',

  // Tabs
  'tab.home': 'Home',
  'tab.scan': 'Scan',
  'tab.receipts': 'Receipts',
  'tab.settings': 'Settings',
};

const translations: Record<Locale, typeof zh> = { zh, en };

let currentLocale: Locale = getDeviceLocale();

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getCurrentLocale(): Locale {
  return currentLocale;
}

export function t(key: keyof typeof zh): string {
  return translations[currentLocale][key] || key;
}

export function getCurrency(): string {
  return currentLocale === 'zh' ? '¥' : '$';
}

export function showTax(): boolean {
  return currentLocale !== 'zh';
}
