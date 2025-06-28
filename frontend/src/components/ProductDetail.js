import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Heart, Share, MessageCircle, Star, MapPin, 
  Package, Shield, Truck, Send, User, Phone, Video
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const API_BASE = process.env.REACT_APP_BACKEND_URL

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.post(`${API_BASE}/api/products/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLiked(!liked)
      fetchProduct() // Refresh to get updated like count
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    setSendingComment(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.post(`${API_BASE}/api/comments`, {
        product_id: id,
        content: comment.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setComment('')
      fetchProduct() // Refresh to get new comments
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSendingComment(false)
    }
  }

  const handleContactSeller = () => {
    navigate(`/messages?contact=${product.supplier_id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">Produit non trouvé</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-400 hover:underline"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const isOwner = product.supplier_id === user?.id

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-lg border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`p-2 transition-colors ${
                liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Share className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Image */}
      <div className="h-80 bg-gray-800">
        {product.image_base64 ? (
          <img
            src={`data:image/jpeg;base64,${product.image_base64}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-20 w-20 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-white pr-4">{product.name}</h1>
            <span className="text-3xl font-bold text-accent">${product.price}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>4.8 (127 avis)</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{product.likes_count || 0} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>Stock: {product.stock_quantity}</span>
            </div>
          </div>

          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
            {product.category}
          </span>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
          <p className="text-gray-300 leading-relaxed">{product.description}</p>
        </div>

        {/* Seller Info */}
        {product.profiles && (
          <div className="bg-card-dark border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Vendeur</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                {product.profiles.avatar_base64 ? (
                  <img
                    src={`data:image/jpeg;base64,${product.profiles.avatar_base64}`}
                    alt={product.profiles.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{product.profiles.full_name}</h4>
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{product.profiles.city}, {product.profiles.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">4.9</span>
              </div>
            </div>
            
            {!isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={handleContactSeller}
                  className="flex-1 btn-primary py-2 px-4 rounded-lg text-white flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter
                </button>
                <button className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors">
                  <Video className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Avantages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-gray-300">Garantie 1 an</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Truck className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Livraison rapide</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Package className="h-5 w-5 text-purple-400" />
              <span className="text-gray-300">Emballage sécurisé</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Commentaires ({product.comments?.length || 0})
          </h3>
          
          {/* Add Comment */}
          {!isOwner && (
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!comment.trim() || sendingComment}
                  className="btn-primary px-6 py-3 rounded-lg text-white disabled:opacity-50"
                >
                  {sendingComment ? (
                    <div className="spinner w-5 h-5"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {product.comments?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun commentaire pour le moment</p>
            ) : (
              product.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.profiles?.avatar_base64 ? (
                      <img
                        src={`data:image/jpeg;base64,${comment.profiles.avatar_base64}`}
                        alt={comment.profiles.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {comment.profiles?.full_name || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      {!isOwner && (
        <div className="sticky bottom-0 p-4 bg-gray-900/90 backdrop-blur-lg border-t border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={handleContactSeller}
              className="flex-1 bg-gray-700 py-3 px-6 rounded-lg text-white hover:bg-gray-600 transition-colors"
            >
              Négocier le prix
            </button>
            <button className="flex-1 btn-primary py-3 px-6 rounded-lg text-white">
              Acheter maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail