import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Package, Users, MessageCircle, Menu } from 'lucide-react'

const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/home' },
    { id: 'products', label: 'Produits', icon: Package, path: '/products' },
    { id: 'suppliers', label: 'Fournisseurs', icon: Users, path: '/suppliers' },
    { id: 'messages', label: 'Discussions', icon: MessageCircle, path: '/messages' },
    { id: 'menu', label: 'Menu', icon: Menu, path: '/menu' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 mobile-nav">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                active 
                  ? 'nav-active text-white transform scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'neon-text' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation