import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import AdminPage from './pages/AdminPage'
import ApartmentsPage from './pages/ApartmentsPage'
import ContactPage from './pages/ContactPage'
import LegalPage from './pages/LegalPage'
import OwnersPage from './pages/OwnersPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />} path="/" />
        <Route element={<ApartmentsPage />} path="/apartments" />
        <Route element={<AdminPage />} path="/admin" />
        <Route element={<OwnersPage />} path="/owners" />
        <Route element={<ContactPage />} path="/contact" />
        <Route element={<LegalPage variant="privacy" />} path="/privacy" />
        <Route element={<LegalPage variant="terms" />} path="/terms" />
        <Route element={<LegalPage variant="cookies" />} path="/cookies" />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
