import axios from 'axios';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAccessToken(): Promise<string> {
  // Token 有效期 30 天，缓存起来
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('缺少 BAIDU_API_KEY 或 BAIDU_SECRET_KEY 环境变量');
  }

  const res = await axios.post(
    'https://aip.baidubce.com/oauth/2.0/token',
    null,
    {
      params: {
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: secretKey,
      },
    }
  );

  if (!res.data.access_token) {
    throw new Error(`百度 OAuth 认证失败: ${JSON.stringify(res.data)}`);
  }

  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return cachedToken!;
}

/**
 * 标准化 OCR 结果为统一的 { words_result: [{words: string}] } 格式
 */
function normalizeOcrResult(data: any): any {
  // 如果已经是通用 OCR 格式，直接返回
  if (data.words_result && Array.isArray(data.words_result)) {
    return data;
  }

  // 百度票据识别返回格式：words_result 是对象，包含各字段
  // 例如 { words_result: { shop_name: "...", total_amount: "..." } }
  if (data.words_result && typeof data.words_result === 'object' && !Array.isArray(data.words_result)) {
    const fields = data.words_result;
    const wordsList: { words: string }[] = [];

    // 将结构化字段转成文本行
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'string' && value.trim()) {
        wordsList.push({ words: value.trim() });
      } else if (Array.isArray(value)) {
        // 某些字段是数组（如 commodity_name）
        for (const item of value) {
          if (typeof item === 'string' && item.trim()) {
            wordsList.push({ words: item.trim() });
          } else if (item && item.word) {
            wordsList.push({ words: item.word });
          } else if (item && item.words) {
            wordsList.push({ words: item.words });
          }
        }
      }
    }

    return {
      words_result: wordsList,
      words_result_num: wordsList.length,
      // 保留原始结构化数据供解析器使用
      _structured: fields,
    };
  }

  // 百度票据识别另一种格式：result 字段
  if (data.result) {
    const result = data.result;
    const wordsList: { words: string }[] = [];

    if (typeof result === 'object') {
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string' && value.trim()) {
          wordsList.push({ words: value.trim() });
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              wordsList.push({ words: item });
            } else if (item && (item.word || item.words)) {
              wordsList.push({ words: item.word || item.words });
            }
          }
        }
      }
    }

    return {
      words_result: wordsList,
      words_result_num: wordsList.length,
      _structured: result,
    };
  }

  // 兜底：返回空结果
  return { words_result: [], words_result_num: 0 };
}

/**
 * 通用票据识别
 */
export async function recognizeReceipt(imageBase64: string): Promise<any> {
  const token = await getAccessToken();
  const res = await axios.post(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/receipt?access_token=${token}`,
    `image=${encodeURIComponent(imageBase64)}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  // 检查 API 错误
  if (res.data.error_code) {
    throw new Error(`百度票据识别错误 [${res.data.error_code}]: ${res.data.error_msg}`);
  }

  return normalizeOcrResult(res.data);
}

/**
 * 通用文字识别（高精度版）- 备用
 */
export async function recognizeGeneral(imageBase64: string): Promise<any> {
  const token = await getAccessToken();
  const res = await axios.post(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`,
    `image=${encodeURIComponent(imageBase64)}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  // 检查 API 错误
  if (res.data.error_code) {
    throw new Error(`百度通用OCR错误 [${res.data.error_code}]: ${res.data.error_msg}`);
  }

  return res.data;
}
