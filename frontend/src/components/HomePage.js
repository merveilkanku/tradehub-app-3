import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Star, MapPin, Heart } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = process.env.REACT_APP_BACKEND_URL

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState({})

  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, selectedCountry, selectedCity])

  const fetchData = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/categories`),
        axios.get(`${API_BASE}/api/locations`)
      ])
      
      setCategories(categoriesRes.data.categories)
      setLocations(locationsRes.data.countries)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedCountry) params.append('country', selectedCountry)
      if (selectedCity) params.append('city', selectedCity)
      
      const response = await axios.get(`${API_BASE}/api/products?${params.toString()}`)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedCountry('')
    setSelectedCity('')
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1582150816999-5c92a8c15401)',
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl font-bold gradient-text mb-2">TradHub</h1>
          <p className="text-gray-300 text-lg">Marketplace du futur</p>
          <p className="text-gray-400 mt-2">
            Bienvenue {profile?.full_name || user?.email} 👋
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-all ${
              showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-800 border-gray-600 text-gray-300'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-800 rounded-lg slide-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedCity('')
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
              >
                <option value="">Tous les pays</option>
                {Object.keys(locations).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              {selectedCountry && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
                >
                  <option value="">Toutes les villes</option>
                  {locations[selectedCountry]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchProducts}
                className="px-4 py-2 btn-primary text-white rounded-lg"
              >
                Appliquer les filtres
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Effacer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Produits disponibles 
          {selectedCountry && ` - ${selectedCountry}`}
          {selectedCity && ` - ${selectedCity}`}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucun produit trouvé</p>
            <p className="text-gray-500">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="bg-card-dark rounded-lg border border-gray-700 overflow-hidden card-hover cursor-pointer"
              >
                {product.image_base64 && (
                  <div className="h-48 bg-gray-800">
                    <img
                      src={`data:image/jpeg;base64,${product.image_base64}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white text-lg line-clamp-2">
                      {product.name}
                    </h3>
                    <button className="text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-accent">
                      ${product.price}
                    </span>
                    <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs">
                      {product.category}
                    </span>
                  </div>
                  
                  {product.profiles && (
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {product.profiles.city}, {product.profiles.country}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-gray-400 text-sm ml-2">
                        {product.likes_count || 0} likes
                      </span>
                    </div>
                    
                    <span className="text-green-400 text-sm font-medium">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage