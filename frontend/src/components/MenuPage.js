import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Settings, LogOut, Package, Heart, ShoppingBag, 
  Edit, Camera, Globe, Moon, Sun, Smartphone, Mail,
  Phone, MapPin, CreditCard, Shield, HelpCircle, Star
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const MenuPage = () => {
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [darkTheme, setDarkTheme] = useState(true)
  
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isSupplier = profile?.user_type === 'supplier'

  const menuItems = [
    {
      icon: User,
      label: 'Profil',
      onClick: () => setShowProfile(true),
      description: 'Gérer mes informations personnelles'
    },
    {
      icon: Package,
      label: isSupplier ? 'Mes produits vendus' : 'Mes achats',
      onClick: () => navigate('/products'),
      description: isSupplier ? 'Gérer mes produits' : 'Historique des achats'
    },
    {
      icon: Heart,
      label: 'Favoris',
      onClick: () => {},
      description: 'Produits que j\'aime'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      onClick: () => setShowSettings(true),
      description: 'Thème, langue, notifications'
    }
  ]

  const supplierMenuItems = [
    {
      icon: ShoppingBag,
      label: 'Ventes réalisées',
      onClick: () => {},
      description: 'Historique des ventes'
    },
    {
      icon: CreditCard,
      label: 'Revenus',
      onClick: () => {},
      description: 'Gains et statistiques'
    },
    {
      icon: Star,
      label: 'Évaluations',
      onClick: () => {},
      description: 'Avis clients'
    }
  ]

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            {profile?.avatar_base64 ? (
              <img
                src={`data:image/jpeg;base64,${profile.avatar_base64}`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {profile?.full_name || user?.email}
            </h1>
            <p className="text-gray-400">
              {isSupplier ? 'Fournisseur vérifié' : 'Utilisateur'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                {profile?.city}, {profile?.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full p-4 bg-card-dark border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            </button>
          )
        })}

        {/* Supplier specific menu items */}
        {isSupplier && (
          <>
            <div className="py-4">
              <h2 className="text-lg font-semibold text-white mb-2">Espace Fournisseur</h2>
            </div>
            {supplierMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full p-4 bg-card-dark border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.label}</h3>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </>
        )}

        {/* Support & Legal */}
        <div className="py-4">
          <h2 className="text-lg font-semibold text-white mb-2">Support</h2>
        </div>
        
        <button className="w-full p-4 bg-card-dark border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Centre d'aide</h3>
              <p className="text-sm text-gray-400">FAQ et support</p>
            </div>
          </div>
        </button>

        <button className="w-full p-4 bg-card-dark border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Politique de confidentialité</h3>
              <p className="text-sm text-gray-400">Vos données en sécurité</p>
            </div>
          </div>
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full p-4 bg-red-900/20 border border-red-700 rounded-lg hover:bg-red-900/30 transition-colors text-left mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-400">Se déconnecter</h3>
              <p className="text-sm text-gray-400">Quitter l'application</p>
            </div>
          </div>
        </button>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfile(false)}
          onEdit={() => setEditingProfile(true)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          darkTheme={darkTheme}
          setDarkTheme={setDarkTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

const ProfileModal = ({ profile, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-dark rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Mon Profil</h2>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              {profile?.avatar_base64 ? (
                <img
                  src={`data:image/jpeg;base64,${profile.avatar_base64}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <button className="btn-primary px-4 py-2 rounded-lg text-white flex items-center gap-2 mx-auto">
              <Camera className="h-4 w-4" />
              Changer la photo
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Nom complet</label>
              <p className="text-white font-medium">{profile?.full_name}</p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-white font-medium">{profile?.email}</p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Téléphone</label>
              <p className="text-white font-medium">{profile?.phone || 'Non renseigné'}</p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Localisation</label>
              <p className="text-white font-medium">
                {profile?.city}, {profile?.country}
              </p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Adresse</label>
              <p className="text-white font-medium">{profile?.address}</p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Type de compte</label>
              <p className="text-white font-medium">
                {profile?.user_type === 'supplier' ? 'Fournisseur' : 'Utilisateur'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onEdit}
              className="flex-1 btn-primary py-2 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 py-2 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SettingsModal = ({ darkTheme, setDarkTheme, onClose }) => {
  const [language, setLanguage] = useState('fr')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-dark rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Paramètres</h2>
        
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <h3 className="text-white font-medium mb-3">Apparence</h3>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {darkTheme ? <Moon className="h-5 w-5 text-gray-400" /> : <Sun className="h-5 w-5 text-gray-400" />}
                <span className="text-white">Thème sombre</span>
              </div>
              <button
                onClick={() => setDarkTheme(!darkTheme)}
                className={`w-12 h-6 rounded-full transition-all ${
                  darkTheme ? 'bg-indigo-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  darkTheme ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <h3 className="text-white font-medium mb-3">Langue</h3>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="text-white">Français</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-white font-medium mb-3">Notifications</h3>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <span className="text-white">Notifications push</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-all ${
                  notifications ? 'bg-indigo-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-700 py-2 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuPage