import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.scan': 'Scan Receipt',
      'nav.receipts': 'All Receipts',
      'nav.logo': 'ReceiptScan',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.subtitle': 'Overview of your expenses and receipts',
      'dashboard.totalSpent': 'Total Spent',
      'dashboard.totalReceipts': 'Total Receipts',
      'dashboard.avgPerReceipt': 'Average Per Receipt',
      'dashboard.changeFromLast': '+12.5% from last month',
      'dashboard.thisMonth': 'This month',
      'dashboard.acrossAll': 'Across all receipts',
      'dashboard.spendingByCategory': 'Spending by Category',
      'dashboard.recentActivity': 'Recent Activity',
      'dashboard.viewAll': 'View All',

      // Scan Receipt
      'scan.title': 'Scan New Receipt',
      'scan.subtitle': 'Upload or take a photo of your receipt to extract information automatically',
      'scan.uploadTitle': 'Upload Receipt Image',
      'scan.uploadHint': 'Drag and drop your receipt image here, or click to browse',
      'scan.chooseFile': 'Choose File',
      'scan.takePhoto': 'Take Photo',
      'scan.supports': 'Supports: JPG, PNG, HEIC',
      'scan.scanButton': 'Scan Receipt',
      'scan.scanning': 'Scanning...',
      'scan.clear': 'Clear',
      'scan.addMore': 'Add More',
      'scan.results': 'Scan Results',
      'scan.unknownVendor': 'Unknown Vendor',
      'scan.lowConfidence': 'Low confidence',
      'scan.error': 'Scan failed. Please try again.',

      // All Receipts
      'receipts.title': 'All Receipts',
      'receipts.subtitle': 'Manage and export your receipt data',
      'receipts.newReceipt': 'New Receipt',
      'receipts.search': 'Search receipts...',
      'receipts.allCategories': 'All Categories',
      'receipts.sortByDate': 'Sort by Date',
      'receipts.exportExcel': 'Export Excel',
      'receipts.date': 'Date',
      'receipts.merchant': 'Merchant',
      'receipts.category': 'Category',
      'receipts.paymentMethod': 'Payment Method',
      'receipts.amount': 'Amount',
      'receipts.tax': 'Tax',
      'receipts.total': 'Total',
      'receipts.actions': 'Actions',
      'receipts.totalReceipts': 'Total Receipts',
      'receipts.totalAmount': 'Total Amount',
      'receipts.view': 'View',
      'receipts.delete': 'Delete',
      'receipts.confirmDelete': 'Are you sure you want to delete this receipt?',
      'receipts.deleteFailed': 'Failed to delete receipt. Please try again.',
      'receipts.clearAll': 'Clear All',
      'receipts.confirmClearAll': 'Are you sure you want to delete ALL receipts? This cannot be undone.',
      'receipts.clearAllFailed': 'Failed to clear receipts. Please try again.',
      'receipts.noReceipts': 'No receipts found. Upload some receipts to get started.',

      // Categories
      'category.food': 'Food & Dining',
      'category.transportation': 'Transportation',
      'category.shopping': 'Shopping',
      'category.entertainment': 'Entertainment',
      'category.healthcare': 'Healthcare',

      // Dashboard
      'dashboard.noData': 'No data yet. Scan some receipts to see statistics.',

      // Payment Methods
      'payment.creditCard': 'Credit Card',
      'payment.debitCard': 'Debit Card',
      'payment.digitalWallet': 'Digital Wallet',
      'payment.cash': 'Cash',
    },
  },
  zh: {
    translation: {
      // Navigation
      'nav.dashboard': '仪表盘',
      'nav.scan': '扫描票据',
      'nav.receipts': '所有票据',
      'nav.logo': '票据扫描',

      // Dashboard
      'dashboard.title': '仪表盘',
      'dashboard.subtitle': '您的支出和票据概览',
      'dashboard.totalSpent': '总支出',
      'dashboard.totalReceipts': '票据总数',
      'dashboard.avgPerReceipt': '平均每张',
      'dashboard.changeFromLast': '较上月 +12.5%',
      'dashboard.thisMonth': '本月',
      'dashboard.acrossAll': '所有票据',
      'dashboard.spendingByCategory': '分类支出',
      'dashboard.recentActivity': '最近活动',
      'dashboard.viewAll': '查看全部',

      // Scan Receipt
      'scan.title': '扫描新票据',
      'scan.subtitle': '上传或拍摄您的票据照片以自动提取信息',
      'scan.uploadTitle': '上传票据图片',
      'scan.uploadHint': '将票据图片拖放到此处，或点击浏览',
      'scan.chooseFile': '选择文件',
      'scan.takePhoto': '拍照',
      'scan.supports': '支持：JPG、PNG、HEIC',
      'scan.scanButton': '扫描票据',
      'scan.scanning': '正在识别...',
      'scan.clear': '清除',
      'scan.addMore': '添加更多',
      'scan.results': '识别结果',
      'scan.unknownVendor': '未知商户',
      'scan.lowConfidence': '置信度低',
      'scan.error': '识别失败，请重试。',

      // All Receipts
      'receipts.title': '所有票据',
      'receipts.subtitle': '管理和导出您的票据数据',
      'receipts.newReceipt': '新建票据',
      'receipts.search': '搜索票据...',
      'receipts.allCategories': '所有分类',
      'receipts.sortByDate': '按日期排序',
      'receipts.exportExcel': '导出 Excel',
      'receipts.date': '日期',
      'receipts.merchant': '商户',
      'receipts.category': '分类',
      'receipts.paymentMethod': '支付方式',
      'receipts.amount': '金额',
      'receipts.tax': '税费',
      'receipts.total': '总计',
      'receipts.actions': '操作',
      'receipts.totalReceipts': '票据总数',
      'receipts.totalAmount': '总金额',
      'receipts.view': '查看',
      'receipts.delete': '删除',
      'receipts.confirmDelete': '确定要删除这条票据吗？',
      'receipts.deleteFailed': '删除失败，请重试。',
      'receipts.clearAll': '清空全部',
      'receipts.confirmClearAll': '确定要删除所有票据吗？此操作不可撤销。',
      'receipts.clearAllFailed': '清空失败，请重试。',
      'receipts.noReceipts': '暂无票据。上传票据后即可查看。',

      // Categories
      'category.food': '餐饮',
      'category.transportation': '交通',
      'category.shopping': '购物',
      'category.entertainment': '娱乐',
      'category.healthcare': '医疗',

      // Dashboard
      'dashboard.noData': '暂无数据。扫描票据后即可查看统计。',

      // Payment Methods
      'payment.creditCard': '信用卡',
      'payment.debitCard': '借记卡',
      'payment.digitalWallet': '数字钱包',
      'payment.cash': '现金',
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  })

export default i18n
