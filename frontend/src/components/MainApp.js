import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BottomNavigation from './BottomNavigation'
import HomePage from './HomePage'
import ProductsPage from './ProductsPage'
import SuppliersPage from './SuppliersPage'
import MessagesPage from './MessagesPage'
import MenuPage from './MenuPage'
import ProductDetail from './ProductDetail'

const MainApp = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user && location.pathname !== '/auth') {
      navigate('/auth')
    } else if (user && location.pathname === '/') {
      navigate('/home')
    }
  }, [user, navigate, location])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="pb-20"> {/* Space for bottom navigation */}
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
      <BottomNavigation />
    </div>
  )
}

export default MainApp