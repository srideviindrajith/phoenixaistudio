'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Menu, X, Sparkles, Clock, CheckCircle } from 'lucide-react'
import { SalonBookingForm } from './salon-booking-form'
import { SalonBookingSuccess } from './salon-booking-success'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

const suggestedQuestions = [
  'What services do you offer?',
  'How much does a haircut cost?',
  'Book an appointment for tomorrow',
  'What are your opening hours?',
  'Do you have any special offers?'
]

export function SalonChatInterface() {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'New Conversation',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! Welcome to our salon. I\'m your AI receptionist, here to help you with bookings, answer questions about our services, and assist you in any way I can. How can I help you today?',
          timestamp: new Date()
        }
      ],
      timestamp: new Date()
    }
  ])
  const [currentConversationId, setCurrentConversationId] = useState('1')
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          title: conv.title === 'New Conversation' && conv.messages.length <= 1 
            ? inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : '')
            : conv.title
        }
      }
      return conv
    }))

    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/salon/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: currentConversation?.messages || []
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage]
          }
        }
        return conv
      }))

      // Check if AI suggests booking
      if (data.message.toLowerCase().includes('book') || data.message.toLowerCase().includes('appointment')) {
        setTimeout(() => setShowBookingForm(true), 1000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Message Failed',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Hello! Welcome to our salon. I\'m your AI receptionist, here to help you with bookings, answer questions about our services, and assist you in any way I can. How can I help you today?',
          timestamp: new Date()
        }
      ],
      timestamp: new Date()
    }

    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setSidebarOpen(false)
  }

  const handleBookingComplete = (data: any) => {
    setBookingData(data)
    setBookingSuccess(true)
    setShowBookingForm(false)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col"
          >
            <div className="p-4 border-b border-white/10">
              <button
                onClick={handleNewConversation}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                New Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs text-purple-300/50 uppercase tracking-wider mb-2">Today</div>
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    currentConversationId === conv.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="text-white text-sm font-medium truncate">{conv.title}</div>
                  <div className="text-purple-300/50 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Salon AI</div>
                  <div className="text-purple-300/50 text-xs">Online</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-black/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <div>
              <h1 className="text-white font-semibold">Salon AI Receptionist</h1>
              <div className="text-purple-300/50 text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Available 24/7
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentConversation?.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                    : 'bg-white/10 backdrop-blur-sm border border-white/10 text-white'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-purple-300/50'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {currentConversation?.messages.length === 1 && (
          <div className="px-4 py-2 border-t border-white/10">
            <div className="text-xs text-purple-300/50 mb-2">Suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-purple-200 hover:bg-white/10 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/10 backdrop-blur-xl">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-purple-300" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Mic className="w-5 h-5 text-purple-300" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <SalonBookingForm
                onClose={() => setShowBookingForm(false)}
                onComplete={handleBookingComplete}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Success Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <SalonBookingSuccess
                bookingData={bookingData}
                onClose={() => setBookingSuccess(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
