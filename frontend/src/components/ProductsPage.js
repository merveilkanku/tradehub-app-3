import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = process.env.REACT_APP_BACKEND_URL

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const isSupplier = profile?.user_type === 'supplier'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products`),
        axios.get(`${API_BASE}/api/categories`)
      ])
      
      setProducts(productsRes.data.products || [])
      setCategories(categoriesRes.data.categories)
      
      if (isSupplier) {
        const myProductsFiltered = productsRes.data.products.filter(
          product => product.supplier_id === user.id
        )
        setMyProducts(myProductsFiltered)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = (activeTab === 'mine' ? myProducts : products).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Produits</h1>
          {isSupplier && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary px-4 py-2 rounded-lg text-white flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Ajouter
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tous les produits
          </button>
          {isSupplier && (
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'mine' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Mes produits ({myProducts.length})
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400">
              {activeTab === 'mine' ? 'Vous n\'avez encore publié aucun produit' : 'Aucun produit trouvé'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card-dark border border-gray-700 rounded-lg p-4 card-hover"
              >
                <div className="flex gap-4">
                  {product.image_base64 && (
                    <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`data:image/jpeg;base64,${product.image_base64}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {product.name}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {activeTab === 'mine' && (
                          <>
                            <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-accent">
                        ${product.price}
                      </span>
                      <div className="flex gap-2">
                        <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                        <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                          Stock: {product.stock_quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateForm && (
        <CreateProductModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchData()
          }}
          categories={categories}
        />
      )}
    </div>
  )
}

const CreateProductModal = ({ onClose, onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: 1,
    image_base64: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      
      await axios.post(`${API_BASE}/api/products`, {
        ...formData,
        price: parseFloat(formData.price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      onSuccess()
    } catch (error) {
      setError(error.response?.data?.detail || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1]
        setFormData(prev => ({ ...prev, image_base64: base64 }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-dark rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Ajouter un produit</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom du produit"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Prix ($)"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />

            <input
              type="number"
              placeholder="Stock"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
              required
              min="1"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
          >
            <option value="">Choisir une catégorie</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Image du produit</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:bg-indigo-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4"
            />
            {formData.image_base64 && (
              <img
                src={`data:image/jpeg;base64,${formData.image_base64}`}
                alt="Preview"
                className="mt-2 image-preview"
              />
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-2 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le produit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 py-2 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductsPage