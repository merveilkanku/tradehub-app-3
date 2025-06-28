import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, MessageCircle, Package, User } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = process.env.REACT_APP_BACKEND_URL

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [locations, setLocations] = useState({})

  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, locationsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products`),
        axios.get(`${API_BASE}/api/locations`)
      ])
      
      // Extract unique suppliers from products
      const supplierMap = new Map()
      
      productsRes.data.products.forEach(product => {
        if (product.profiles && product.supplier_id) {
          const supplierId = product.supplier_id
          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              id: supplierId,
              full_name: product.profiles.full_name,
              country: product.profiles.country,
              city: product.profiles.city,
              avatar_base64: product.profiles.avatar_base64,
              products: []
            })
          }
          supplierMap.get(supplierId).products.push(product)
        }
      })
      
      setSuppliers(Array.from(supplierMap.values()))
      setLocations(locationsRes.data.countries)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCountry = !selectedCountry || supplier.country === selectedCountry
    return matchesSearch && matchesCountry
  })

  const handleContactSupplier = (supplierId) => {
    navigate(`/messages?contact=${supplierId}`)
  }

  const getSupplierRating = () => {
    return (Math.random() * 2 + 3).toFixed(1) // Random rating between 3-5
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Fournisseurs</h1>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none custom-select"
          >
            <option value="">Tous les pays</option>
            {Object.keys(locations).map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <p className="text-gray-400 text-sm mt-2">
          {filteredSuppliers.length} fournisseur(s) dans votre région
        </p>
      </div>

      {/* Suppliers List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucun fournisseur trouvé</p>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-card-dark border border-gray-700 rounded-lg p-6 card-hover"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {supplier.avatar_base64 ? (
                      <img
                        src={`data:image/jpeg;base64,${supplier.avatar_base64}`}
                        alt={supplier.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Supplier Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {supplier.full_name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{getSupplierRating()}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-400 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{supplier.city}, {supplier.country}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Package className="h-4 w-4" />
                        <span className="text-sm">{supplier.products.length} produit(s)</span>
                      </div>
                      <div className="text-green-400 text-sm">
                        ● En ligne
                      </div>
                    </div>

                    {/* Recent Products */}
                    <div className="mb-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-2">Produits récents :</h4>
                      <div className="flex gap-2 overflow-x-auto">
                        {supplier.products.slice(0, 3).map((product, index) => (
                          <div key={index} className="flex-shrink-0 bg-gray-800 rounded px-2 py-1">
                            <span className="text-xs text-gray-300">{product.name}</span>
                          </div>
                        ))}
                        {supplier.products.length > 3 && (
                          <div className="flex-shrink-0 bg-gray-800 rounded px-2 py-1">
                            <span className="text-xs text-gray-400">
                              +{supplier.products.length - 3} autres
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContactSupplier(supplier.id)}
                        className="flex-1 btn-primary py-2 px-4 rounded-lg text-white flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contacter
                      </button>
                      <button
                        onClick={() => navigate(`/products?supplier=${supplier.id}`)}
                        className="flex-1 bg-gray-700 py-2 px-4 rounded-lg text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Voir produits
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info for becoming supplier */}
        {profile?.user_type !== 'supplier' && (
          <div className="mt-8 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-600/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Devenez fournisseur
            </h3>
            <p className="text-gray-300 mb-4">
              Rejoignez notre réseau de fournisseurs et vendez vos produits à travers l'Afrique francophone.
            </p>
            <div className="text-sm text-gray-400">
              <p>💰 Frais d'inscription : 5$ USD</p>
              <p>📞 RDC : +234979401982, +243842578529</p>
              <p>🌍 Autres pays : Western Union ou virement bancaire</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuppliersPage