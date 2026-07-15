import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ScanReceipt from './pages/ScanReceipt'
import AllReceipts from './pages/AllReceipts'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/receipts" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="scan" element={<ScanReceipt />} />
        <Route path="receipts" element={<AllReceipts />} />
      </Route>
    </Routes>
  )
}

export default App
