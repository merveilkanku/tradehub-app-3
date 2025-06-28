import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Send, ArrowLeft, User, Phone, Video } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const API_BASE = process.env.REACT_APP_BACKEND_URL

const MessagesPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const contactUserId = searchParams.get('contact')

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (contactUserId && conversations.length > 0) {
      const existingConv = conversations.find(conv => conv.user_id === contactUserId)
      if (existingConv) {
        setSelectedConversation(existingConv)
      } else {
        // Create new conversation entry
        const newConv = {
          user_id: contactUserId,
          user_name: 'Nouveau contact',
          last_message: '',
          last_message_time: new Date().toISOString(),
          messages: []
        }
        setSelectedConversation(newConv)
      }
    }
  }, [contactUserId, conversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user_id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const response = await axios.get(`${API_BASE}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(response.data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const response = await axios.get(`${API_BASE}/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSendingMessage(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.post(`${API_BASE}/api/messages`, {
        recipient_id: selectedConversation.user_id,
        content: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setNewMessage('')
      fetchMessages(selectedConversation.user_id)
      fetchConversations() // Refresh conversations list
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = (now - date) / (1000 * 60 * 60)

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-700`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-4">Discussions</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400">
                {conversations.length === 0 ? 'Aucune conversation' : 'Aucun résultat'}
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Contactez des fournisseurs pour commencer à discuter
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.user_id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedConversation?.user_id === conversation.user_id
                      ? 'bg-indigo-600/20 border-r-2 border-indigo-600'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-white truncate">
                          {conversation.user_name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.last_message_time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {conversation.last_message || 'Nouvelle conversation'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-white">
                    {selectedConversation.user_name}
                  </h2>
                  <p className="text-sm text-green-400">En ligne</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Démarrez la conversation</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 text-white ${
                        message.sender_id === user.id
                          ? 'chat-bubble-sent'
                          : 'chat-bubble-received'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="btn-primary px-6 py-3 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="spinner w-5 h-5"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg">Sélectionnez une conversation</p>
              <p className="text-gray-500 text-sm mt-2">
                Choisissez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage