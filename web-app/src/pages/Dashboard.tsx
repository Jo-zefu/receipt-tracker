import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getReceipts, ParsedReceipt } from '../services/api'
import './Dashboard.css'

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [receipts, setReceipts] = useState<ParsedReceipt[]>([])
  const [loading, setLoading] = useState(true)

  const isZh = i18n.language?.startsWith('zh')
  const currency = isZh ? '¥' : '$'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await getReceipts()
      setReceipts(data.receipts)
    } catch {
      // If backend is down, show empty state
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalReceipts = receipts.length
  const avgPerReceipt = totalReceipts > 0 ? totalAmount / totalReceipts : 0

  // This month's receipts
  const now = new Date()
  const thisMonthReceipts = receipts.filter((r) => {
    if (!r.date) return false
    const d = new Date(r.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const thisMonthTotal = thisMonthReceipts.reduce((sum, r) => sum + (r.amount || 0), 0)

  // Category breakdown
  const byCategory: Record<string, number> = {}
  receipts.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + (r.amount || 0)
  })
  const categoryList = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Category percentage for pie chart
  const categoryColors: Record<string, string> = {
    'Shopping': '#4A7BF7',
    'Food & Dining': '#2ECC8F',
    'Transportation': '#F5A623',
    'Entertainment': '#E74C3C',
    'Healthcare': '#9B59B6',
    '购物': '#4A7BF7',
    '餐饮': '#2ECC8F',
    '交通': '#F5A623',
    '娱乐': '#E74C3C',
    '医疗': '#9B59B6',
    '住宿': '#3498DB',
    '办公用品': '#1ABC9C',
    '通信': '#E67E22',
    '教育': '#8E44AD',
    '日用品': '#27AE60',
    '水电物业': '#2980B9',
    '其他': '#95A5A6',
  }

  const getCategoryColor = (cat: string) => categoryColors[cat] || '#95A5A6'

  // Recent receipts (last 5)
  const recentReceipts = [...receipts]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <span className="spinner"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/scan')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t('receipts.newReceipt')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon receipts-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">{t('dashboard.totalReceipts')}</p>
            <p className="stat-value">{totalReceipts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amount-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">{t('dashboard.totalSpent')}</p>
            <p className="stat-value">{currency}{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon month-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">{t('dashboard.thisMonth')}</p>
            <p className="stat-value">{currency}{thisMonthTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon avg-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">{t('dashboard.avgPerReceipt')}</p>
            <p className="stat-value">{currency}{avgPerReceipt.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>{t('dashboard.spendingByCategory')}</h3>
          </div>
          {categoryList.length > 0 ? (
            <>
              <div className="pie-chart-container">
                <svg viewBox="0 0 200 200" className="pie-chart">
                  {(() => {
                    let cumulative = 0
                    return categoryList.map(([cat, amount], idx) => {
                      const pct = totalAmount > 0 ? amount / totalAmount : 0
                      const startAngle = cumulative * 360
                      cumulative += pct
                      const endAngle = cumulative * 360
                      const startRad = (startAngle - 90) * (Math.PI / 180)
                      const endRad = (endAngle - 90) * (Math.PI / 180)
                      const largeArc = pct > 0.5 ? 1 : 0
                      const x1 = 100 + 80 * Math.cos(startRad)
                      const y1 = 100 + 80 * Math.sin(startRad)
                      const x2 = 100 + 80 * Math.cos(endRad)
                      const y2 = 100 + 80 * Math.sin(endRad)
                      return (
                        <path
                          key={idx}
                          d={`M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z`}
                          fill={getCategoryColor(cat)}
                        />
                      )
                    })
                  })()}
                </svg>
                <div className="pie-labels">
                  {categoryList.map(([cat, amount], idx) => {
                    const pct = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(0) : '0'
                    return (
                      <span key={idx} className="pie-label" style={{ color: getCategoryColor(cat) }}>
                        {cat} {pct}%
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="category-list">
                {categoryList.map(([cat, amount], idx) => (
                  <div key={idx} className="category-item">
                    <div className="category-info">
                      <span className="category-dot" style={{ backgroundColor: getCategoryColor(cat) }}></span>
                      <span>{cat}</span>
                    </div>
                    <span className="category-amount">{currency}{amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>{t('dashboard.noData')}</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>{t('dashboard.recentActivity')}</h3>
            <button className="btn-text" onClick={() => navigate('/receipts')}>{t('dashboard.viewAll')}</button>
          </div>
          {recentReceipts.length > 0 ? (
            <div className="activity-list">
              {recentReceipts.map((r, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{r.vendor || r.filename}</p>
                    <p className="activity-date">{r.date || '-'}</p>
                  </div>
                  <span className="activity-amount">
                    {r.amount !== null ? `${currency}${r.amount.toFixed(2)}` : '-'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('dashboard.noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
