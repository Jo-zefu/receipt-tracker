// receipt-ocr 后端 API 服务
import * as FileSystem from 'expo-file-system';

// 开发时用本机 IP，真机调试请改成电脑局域网 IP
const BASE_URL = 'http://192.168.1.100:3001';

export function setBaseUrl(url: string) {
  (globalThis as any).__API_BASE_URL = url;
}

function getBaseUrl(): string {
  return (globalThis as any).__API_BASE_URL || BASE_URL;
}

export interface ReceiptResult {
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
 * 上传图片到 receipt-ocr 后端
 */
export async function uploadReceipts(imageUris: string[]): Promise<ReceiptResult[]> {
  const url = `${getBaseUrl()}/api/upload`;

  const formData = new FormData();
  for (const uri of imageUris) {
    const filename = uri.split('/').pop() || 'receipt.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    formData.append('receipts', {
      uri,
      name: filename,
      type: mimeType,
    } as any);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.receipts || data.results || [];
}

/**
 * 获取已识别的所有票据
 */
export async function getReceipts(): Promise<ReceiptResult[]> {
  const url = `${getBaseUrl()}/api/receipts`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch receipts (${response.status})`);
  }

  const data = await response.json();
  return data.receipts || [];
}

/**
 * 清空所有票据
 */
export async function clearReceipts(): Promise<void> {
  const url = `${getBaseUrl()}/api/receipts`;
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`清空失败 (${response.status})`);
  }
}

/**
 * 导出 Excel（返回下载 URL）
 */
export function getExportUrl(): string {
  return `${getBaseUrl()}/api/export`;
}
