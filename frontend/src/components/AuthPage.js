import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Smartphone, Mail, User, MapPin, Building, Phone } from 'lucide-react'

const COUNTRIES = {
  "Cameroun": ["Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua"],
  "Côte d'Ivoire": ["Abidjan", "Bouaké", "Daloa", "Korhogo", "Yamoussoukro"],
  "Sénégal": ["Dakar", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"],
  "Mali": ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes"],
  "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"],
  "Niger": ["Niamey", "Zinder", "Maradi", "Agadez", "Tahoua"],
  "Tchad": ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo"],
  "République Centrafricaine": ["Bangui", "Berbérati", "Carnot", "Bambari", "Bouar"],
  "Gabon": ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda"],
  "République du Congo": ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Impfondo"],
  "RDC": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Goma", "Bukavu", "Tshikapa", "Kikwit", "Mbandaka", "Matadi"]
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    user_type: 'user'
  })

  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
        navigate('/')
      } else {
        if (formData.user_type === 'supplier') {
          setError('Pour devenir fournisseur, vous devez payer 5$ USD. Contactez +234979401982 ou +243842578529 pour la RDC.')
          return
        }
        
        const { error } = await signUp(formData)
        if (error) throw error
        setError('Vérifiez votre email pour activer votre compte!')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'country') {
      setSelectedCountry(value)
      setFormData(prev => ({ ...prev, city: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1582150816999-5c92a8c15401)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">TradHub</h1>
          <p className="text-gray-400">Marketplace du futur</p>
        </div>

        {/* Auth Form */}
        <div className="bg-card-dark backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-l-lg font-semibold transition-all ${
                isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-semibold transition-all ${
                !isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Inscription
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Nom complet"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Numéro de téléphone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
                  >
                    <option value="">Sélectionnez un pays</option>
                    {Object.keys(COUNTRIES).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {selectedCountry && (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {COUNTRIES[selectedCountry].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Adresse complète"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Type de compte</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="user_type"
                        value="user"
                        checked={formData.user_type === 'user'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-300">Utilisateur (Gratuit)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="user_type"
                        value="supplier"
                        checked={formData.user_type === 'supplier'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-300">Fournisseur (5$)</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email ou nom d'utilisateur"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  {isLogin ? 'Connexion...' : 'Inscription...'}
                </div>
              ) : (
                isLogin ? 'Se connecter' : "S'inscrire"
              )}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-yellow-200 text-sm">
              <strong>Note:</strong> Pour devenir fournisseur, contactez-nous:
              <br />• RDC: +234979401982, +243842578529
              <br />• Autres pays: Western Union ou virement bancaire
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage