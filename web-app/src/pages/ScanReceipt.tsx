import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { uploadReceipts, ParsedReceipt } from '../services/api'
import './ScanReceipt.css'

export default function ScanReceipt() {
  const { t, i18n } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<ParsedReceipt[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const isZh = i18n.language?.startsWith('zh')
  const currency = isZh ? '¥' : '$'

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    setSelectedFiles((prev) => [...prev, ...imageFiles])
    const urls = imageFiles.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...urls])
    setResults(null)
    setError(null)
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleTakePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    cameraInputRef.current?.click()
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleScan = async () => {
    if (selectedFiles.length === 0) return
    setIsScanning(true)
    setError(null)
    setResults(null)

    try {
      const response = await uploadReceipts(selectedFiles)
      setResults(response.receipts)
    } catch (err: any) {
      setError(err.message || t('scan.error'))
    } finally {
      setIsScanning(false)
    }
  }

  const handleClear = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setPreviewUrls([])
    setResults(null)
    setError(null)
  }

  return (
    <div className="scan-receipt">
      <div className="page-header">
        <div>
          <h1>{t('scan.title')}</h1>
          <p className="page-subtitle">{t('scan.subtitle')}</p>
        </div>
      </div>

      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleChooseFile}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {previewUrls.length > 0 ? (
          <div className="preview-grid" onClick={(e) => e.stopPropagation()}>
            {previewUrls.map((url, idx) => (
              <div key={idx} className="preview-item">
                <img src={url} alt={`Receipt ${idx + 1}`} className="preview-image" />
                <button
                  className="preview-remove"
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx) }}
                >
                  &times;
                </button>
                <p className="preview-filename">{selectedFiles[idx]?.name}</p>
              </div>
            ))}
            <div className="preview-add" onClick={handleChooseFile}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{t('scan.addMore')}</span>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="upload-title">{t('scan.uploadTitle')}</h3>
            <p className="upload-hint">{t('scan.uploadHint')}</p>

            <div className="upload-actions">
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleChooseFile() }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {t('scan.chooseFile')}
              </button>
              <button className="btn-secondary" onClick={handleTakePhoto}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {t('scan.takePhoto')}
              </button>
            </div>

            <p className="upload-support">{t('scan.supports')}</p>
          </div>
        )}
      </div>

      {previewUrls.length > 0 && (
        <div className="action-buttons">
          <button className="btn-primary btn-large" onClick={handleScan} disabled={isScanning}>
            {isScanning ? (
              <>
                <span className="spinner"></span>
                {t('scan.scanning')}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {t('scan.scanButton')}
              </>
            )}
          </button>
          <button className="btn-secondary btn-large" onClick={handleClear} disabled={isScanning}>
            {t('scan.clear')}
          </button>
        </div>
      )}

      {error && (
        <div className="scan-error">
          <p>{error}</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="scan-results">
          <h3>{t('scan.results')}</h3>
          <div className="results-grid">
            {results.map((r, idx) => (
              <div key={idx} className={`result-card ${r.confidence === 'low' ? 'low-confidence' : ''}`}>
                <div className="result-header">
                  <span className="result-vendor">{r.vendor || t('scan.unknownVendor')}</span>
                  {r.confidence === 'low' && <span className="badge-warning">{t('scan.lowConfidence')}</span>}
                </div>
                <div className="result-details">
                  <div className="result-row">
                    <span className="result-label">{t('receipts.amount')}</span>
                    <span className="result-value result-amount">
                      {r.amount !== null ? `${currency}${r.amount.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">{t('receipts.date')}</span>
                    <span className="result-value">{r.date || '-'}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">{t('receipts.category')}</span>
                    <span className="result-value">
                      <span className="category-badge">{r.category}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
