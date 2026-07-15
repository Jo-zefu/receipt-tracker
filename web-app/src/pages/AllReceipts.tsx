import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getReceipts, getExportUrl, deleteReceipt, deleteAllReceipts, ParsedReceipt } from '../services/api'
import './AllReceipts.css'

interface DisplayReceipt {
  id: string
  date: string
  merchant: string
  category: string
  paymentMethod: string
  amount: number
  tax: number
  total: number
}

export default function AllReceipts() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [receipts, setReceipts] = useState<DisplayReceipt[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  const isZh = i18n.language?.startsWith('zh')
  const currency = isZh ? '¥' : '$'

  useEffect(() => {
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    try {
      const data = await getReceipts()
      const mapped: DisplayReceipt[] = data.receipts.map((r: ParsedReceipt) => {
        const amount = r.amount || 0
        const tax = isZh ? 0 : amount * 0.08 // Only calculate tax for English
        const total = isZh ? amount : amount + tax
        return {
          id: r.id || '',
          date: r.date || '-',
          merchant: r.vendor || r.filename,
          category: r.category,
          paymentMethod: '-',
          amount,
          tax,
          total,
        }
      })
      setReceipts(mapped)
    } catch {
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All Categories', ...new Set(receipts.map((r) => r.category))]

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      searchTerm === '' ||
      receipt.merchant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'All Categories' || receipt.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalReceipts = filteredReceipts.length
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.total, 0)

  const handleExport = () => {
    window.open(getExportUrl(), '_blank')
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('receipts.confirmDelete'))) {
      return
    }
    try {
      await deleteReceipt(id)
      // Reload receipts after successful deletion
      await loadReceipts()
    } catch (error) {
      console.error('Failed to delete receipt:', error)
      alert(t('receipts.deleteFailed'))
    }
  }

  const handleClearAll = async () => {
    if (!confirm(t('receipts.confirmClearAll'))) {
      return
    }
    try {
      await deleteAllReceipts()
      await loadReceipts()
    } catch (error) {
      console.error('Failed to clear all receipts:', error)
      alert(t('receipts.clearAllFailed'))
    }
  }

  return (
    <div className="all-receipts">
      <div className="page-header">
        <div>
          <h1>{t('receipts.title')}</h1>
          <p className="page-subtitle">{t('receipts.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/scan')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t('receipts.newReceipt')}
        </button>
      </div>

      <div className="controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('receipts.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="dropdown-wrapper">
          <button
            className="dropdown-trigger"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown)
              setShowSortDropdown(false)
            }}
          >
            {categoryFilter === 'All Categories' ? t('receipts.allCategories') : categoryFilter}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showCategoryDropdown && (
            <div className="dropdown-menu">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`dropdown-item ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => {
                    setCategoryFilter(cat)
                    setShowCategoryDropdown(false)
                  }}
                >
                  {cat === 'All Categories' ? t('receipts.allCategories') : cat}
                  {categoryFilter === cat && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="dropdown-trigger"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown)
              setShowCategoryDropdown(false)
            }}
          >
            {t('receipts.sortByDate')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showSortDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item active" onClick={() => setShowSortDropdown(false)}>
                {t('receipts.sortByDate')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={handleExport}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t('receipts.exportExcel')}
        </button>

        {receipts.length > 0 && (
          <button className="btn-danger" onClick={handleClearAll}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            {t('receipts.clearAll')}
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="receipts-table">
          <thead>
            <tr>
              <th>{t('receipts.date')}</th>
              <th>{t('receipts.merchant')}</th>
              <th>{t('receipts.category')}</th>
              <th>{t('receipts.paymentMethod')}</th>
              <th>{t('receipts.amount')}</th>
              {!isZh && <th>{t('receipts.tax')}</th>}
              <th>{t('receipts.total')}</th>
              <th>{t('receipts.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isZh ? 7 : 8} className="loading-cell">
                  <span className="spinner"></span>
                </td>
              </tr>
            ) : filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={isZh ? 7 : 8} className="empty-cell">
                  {t('receipts.noReceipts')}
                </td>
              </tr>
            ) : (
              filteredReceipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td>{receipt.date}</td>
                  <td className="merchant-cell">{receipt.merchant}</td>
                  <td>
                    <span className="category-badge">{receipt.category}</span>
                  </td>
                  <td>{receipt.paymentMethod}</td>
                  <td>{currency}{receipt.amount.toFixed(2)}</td>
                  {!isZh && <td>{currency}{receipt.tax.toFixed(2)}</td>}
                  <td className="total-cell">{currency}{receipt.total.toFixed(2)}</td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" title={t('receipts.view')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button className="icon-btn delete-btn" title={t('receipts.delete')} onClick={() => handleDelete(receipt.id)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="footer-summary">
        <div className="summary-item">
          <span className="summary-label">{t('receipts.totalReceipts')}</span>
          <span className="summary-value">{totalReceipts}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">{t('receipts.totalAmount')}</span>
          <span className="summary-value">{currency}{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
