export interface ParsedReceipt {
  filename: string;
  vendor: string | null;
  category: string;
  amount: number | null;
  date: string | null;
  rawText: string;
  confidence: 'high' | 'low';
  imagePath?: string;
}

/**
 * 从 OCR 结果中提取金额
 */
export function extractAmount(ocrResult: any): { amount: number | null; confidence: 'high' | 'low' } {
  // 优先使用结构化数据
  if (ocrResult._structured) {
    const s = ocrResult._structured;
    const totalFields = ['total_amount', 'total', 'amount', 'price', 'money'];
    for (const field of totalFields) {
      if (s[field]) {
        const val = parseFloat(String(s[field]).replace(/[¥￥,]/g, ''));
        if (val > 0) return { amount: val, confidence: 'high' };
      }
    }
  }

  const words = ocrResult.words_result || [];
  const allText = words.map((w: any) => w.words).join('\n');

  // 策略1：匹配「合计」「总计」「实付」「应付」等关键行后的金额
  const keywordPatterns = [
    /(?:合计|总计|实付|应付|实收|总额|价税合计|小计)[：:]*\s*[¥￥]?\s*([\d,]+\.?\d*)/i,
    /(?:合计|总计|实付|应付|实收|总额|价税合计|小计)\s*[\n\r]*\s*[¥￥]?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of keywordPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0) return { amount, confidence: 'high' };
    }
  }

  // 策略2：匹配 ¥ 或 ￥ 符号后的金额，取最大值（置信度中等，标记为 low）
  const currencyPattern = /[¥￥]\s*([\d,]+\.?\d*)/g;
  let maxAmount = 0;
  let currencyMatch;
  while ((currencyMatch = currencyPattern.exec(allText)) !== null) {
    const val = parseFloat(currencyMatch[1].replace(/,/g, ''));
    if (val > maxAmount) maxAmount = val;
  }
  if (maxAmount > 0) return { amount: maxAmount, confidence: 'low' };

  // 策略3：匹配所有带小数点的数字，取最大值
  const decimalPattern = /([\d,]+\.\d{2})/g;
  let decimalMatch;
  while ((decimalMatch = decimalPattern.exec(allText)) !== null) {
    const val = parseFloat(decimalMatch[1].replace(/,/g, ''));
    if (val > maxAmount) maxAmount = val;
  }
  if (maxAmount > 0) return { amount: maxAmount, confidence: 'low' };

  return { amount: null, confidence: 'low' };
}

/**
 * 从 OCR 结果中提取日期
 */
export function extractDate(ocrResult: any): string | null {
  // 优先使用结构化数据
  if (ocrResult._structured) {
    const s = ocrResult._structured;
    const dateFields = ['date', 'time', 'trade_time', 'invoice_date'];
    for (const field of dateFields) {
      if (s[field]) {
        const dateStr = String(s[field]);
        // 尝试从结构化字段解析
        const parsed = parseDateString(dateStr);
        if (parsed) return parsed;
      }
    }
  }

  const words = ocrResult.words_result || [];
  const allText = words.map((w: any) => w.words).join('\n');
  return parseDateString(allText);
}

function parseDateString(text: string): string | null {
  const datePatterns = [
    /(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日]?/,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      // 基本日期有效性校验
      if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  return null;
}

/**
 * 从 OCR 结果中提取商户名称
 */
export function extractVendor(ocrResult: any): string | null {
  // 优先使用结构化数据
  if (ocrResult._structured) {
    const s = ocrResult._structured;
    const vendorFields = ['shop_name', 'seller_name', 'merchant_name', 'company_name'];
    for (const field of vendorFields) {
      if (s[field] && String(s[field]).trim()) {
        return String(s[field]).trim();
      }
    }
  }

  const words = ocrResult.words_result || [];
  if (words.length === 0) return null;

  const allText = words.map((w: any) => w.words).join('\n');

  // 匹配「名称」相关字段
  const vendorPatterns = [
    /(?:销售方|商户|收款方|店名|单位)[：:]\s*(.+)/,
    /(?:名称)[：:]\s*(.+)/,
  ];

  for (const pattern of vendorPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // 兜底：取第一行非数字内容作为商户
  for (const word of words) {
    const text = word.words.trim();
    if (text.length > 2 && !/^\d+$/.test(text) && !/^[¥￥\d.,]+$/.test(text)) {
      return text;
    }
  }

  return null;
}

/**
 * 根据 OCR 内容自动分类
 */
export function categorize(ocrResult: any): string {
  const words = ocrResult.words_result || [];
  const allText = words.map((w: any) => w.words).join(' ').toLowerCase();

  const rules: [RegExp, string][] = [
    [/餐|食|饮|外卖|美团|饿了么|肯德基|麦当劳|星巴克|奶茶|咖啡|面|饭|菜|酒/, '餐饮'],
    [/油|加油|停车|出租|滴滴|地铁|公交|高铁|机票|火车|动车|航空|uber|打车/, '交通'],
    [/住宿|酒店|宾馆|民宿|客房|入住/, '住宿'],
    [/办公|文具|打印|复印|纸|笔|墨|碳粉|耗材/, '办公用品'],
    [/通信|话费|流量|宽带|网络|电信|移动|联通/, '通信'],
    [/医|药|诊|健康|体检|门诊|挂号/, '医疗'],
    [/培训|教育|课程|书|学费|考试/, '教育'],
    [/超市|便利店|日用|洗|牙膏|纸巾/, '日用品'],
    [/电|水|燃气|物业|暖气/, '水电物业'],
  ];

  for (const [regex, category] of rules) {
    if (regex.test(allText)) return category;
  }

  return '其他';
}

/**
 * 解析完整票据
 */
export function parseReceipt(ocrResult: any, filename: string): ParsedReceipt {
  const { amount, confidence } = extractAmount(ocrResult);
  const vendor = extractVendor(ocrResult);
  const date = extractDate(ocrResult);
  const category = categorize(ocrResult);
  const rawText = (ocrResult.words_result || [])
    .map((w: any) => w.words)
    .join(' ');

  return {
    filename,
    vendor,
    category,
    amount,
    date,
    rawText,
    confidence,
  };
}
