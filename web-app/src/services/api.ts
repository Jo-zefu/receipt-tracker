const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

export interface ParsedReceipt {
  filename: string
  vendor: string | null
  category: string
  amount: number | null
  date: string | null
  rawText: string
  confidence: 'high' | 'low'
  imagePath?: string
}

export interface ReceiptSummary {
  count: number
  total: number
  byCategory: Record<string, number>
}

export interface UploadResponse {
  success: boolean
  receipts: ParsedReceipt[]
  summary: ReceiptSummary
}

export interface ReceiptsResponse {
  receipts: ParsedReceipt[]
  summary: ReceiptSummary
}

export async function uploadReceipts(files: File[]): Promise<UploadResponse> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('receipts', file)
  })

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Upload failed')
  }

  return res.json()
}

export async function getReceipts(): Promise<ReceiptsResponse> {
  const res = await fetch(`${API_BASE}/receipts`)
  if (!res.ok) {
    throw new Error('Failed to fetch receipts')
  }
  return res.json()
}

export async function deleteAllReceipts(): Promise<void> {
  const res = await fetch(`${API_BASE}/receipts`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Error('Failed to delete receipts')
  }
}

export function getExportUrl(): string {
  return `${API_BASE}/export`
}
