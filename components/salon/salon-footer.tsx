'use client'

import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react'

export function SalonFooter() {
  return (
    <footer className="py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Salon Booking AI</h3>
            <p className="text-purple-200/70 mb-6">
              Transform your salon experience with intelligent AI receptionist services.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-purple-200/70">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>+1234567890</span>
              </li>
              <li className="flex items-start gap-3 text-purple-200/70">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>contact@salonbooking.ai</span>
              </li>
              <li className="flex items-start gap-3 text-purple-200/70">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Beauty Street, Style City</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Opening Hours</h4>
            <ul className="space-y-3 text-purple-200/70">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div>Mon - Sat</div>
                  <div className="text-sm">9:00 AM - 7:00 PM</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div>Sunday</div>
                  <div className="text-sm">10:00 AM - 5:00 PM</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-purple-200/70 hover:text-white transition-colors">
                  Book Appointment
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-200/70 hover:text-white transition-colors">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-200/70 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-200/70 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-purple-200/50">
            © 2024 Salon Booking AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
