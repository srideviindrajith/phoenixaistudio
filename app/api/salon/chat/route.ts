import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Diagnostic logging
console.log('[SALON CHAT] AI Provider Configuration:', {
  provider: 'Gemini',
  envVar: 'GEMINI_API_KEY',
  exists: !!process.env.GEMINI_API_KEY,
  keyLength: process.env.GEMINI_API_KEY?.length || 0,
})

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Fallback responses for testing without API key
const getFallbackResponse = (message: string) => {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('service') || lowerMessage.includes('offer')) {
    return `We offer a wide range of beauty services including:\n\n• Hair Cut - ₹500\n• Hair Spa - ₹800\n• Hair Coloring - ₹1,500\n• Facial - ₹600\n• Beard Trim - ₹200\n• Hair Straightening - ₹2,000\n• Bridal Makeup - ₹5,000\n• Party Makeup - ₹1,500\n• Pedicure - ₹400\n• Manicure - ₹350\n\nWould you like to book an appointment for any of these services?`
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return `Our prices range from ₹200 for a Beard Trim to ₹5,000 for Bridal Makeup. We also have a special offer: First-time visitors get 20% off on all services!\n\nWould you like me to help you book an appointment?`
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
    return `I'd be happy to help you book an appointment! To get started, I'll need some information:\n\n1. Your full name\n2. Email address\n3. Phone number\n4. Which service you'd like\n5. Preferred date and time\n\nYou can click the "Book Appointment" button to fill in these details, or tell me here and I'll guide you through the process.`
  }
  
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
    return `Our opening hours are:\n• Monday - Saturday: 9:00 AM - 7:00 PM\n• Sunday: 10:00 AM - 5:00 PM\n\nWe're located at City Center Mall, Ground Floor. Free parking is available for 2 hours.`
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
    return `We're located at City Center Mall, Ground Floor. Free parking is available for 2 hours. Our address is 123 Beauty Street, Style City.\n\nWould you like directions or help booking an appointment?`
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
    return `We accept multiple payment methods:\n• Cash\n• Card (Credit/Debit)\n• UPI\n• PayPal\n\nPayment can be made at the salon or online when booking. Is there anything else you'd like to know?`
  }
  
  if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
    return `For cancellations or rescheduling, we require 24 hours notice. You can contact us at +1234567890 or I can help you manage your booking.\n\nWhat would you like to do?`
  }
  
  return `Hello! I'm your AI salon receptionist. I can help you with:\n\n• Booking appointments\n• Information about our services and pricing\n• Opening hours and location\n• Payment methods\n• Special offers\n• Cancellations and rescheduling\n\nHow can I assist you today?`
}

export async function POST(req: NextRequest) {
  let userMessage = ''
  try {
    const { message, conversationHistory } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Store message for fallback in catch block
    userMessage = message

    // If no API key, use fallback responses
    if (!genAI) {
      const fallbackResponse = getFallbackResponse(message)
      return NextResponse.json({
        message: fallbackResponse,
        role: 'assistant'
      })
    }

    // Build conversation context
    const systemPrompt = `You are a friendly AI receptionist for a beauty salon. Your role is to help customers with:
    - Booking appointments
    - Checking availability
    - Viewing services and pricing
    - Answering questions about salon information, hours, location, payment methods
    - Handling cancellations and rescheduling
    - Providing information about offers

    Be conversational, professional, and helpful. Always guide customers toward booking when appropriate.
    If you need to collect booking information, ask for: name, phone, service, date, time, stylist preference, and any special notes.

    Services available:
    - Hair Cut
    - Hair Spa
    - Hair Coloring
    - Facial
    - Beard Trim
    - Hair Straightening
    - Bridal Makeup
    - Party Makeup
    - Pedicure
    - Manicure

    When a customer wants to book, acknowledge their request and let them know you'll help them through the process.`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const chatHistory = conversationHistory || []
    const history = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...history
      ]
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      message: text,
      role: 'assistant'
    })
  } catch (error) {
    console.error('Chat API error:', error)
    // Fallback to simple response on error
    const fallbackResponse = getFallbackResponse(userMessage || '')
    return NextResponse.json({
      message: fallbackResponse,
      role: 'assistant'
    })
  }
}
