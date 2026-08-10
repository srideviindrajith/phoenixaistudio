import { SalonHero } from '@/components/salon/salon-hero'
import { SalonFeatures } from '@/components/salon/salon-features'
import { SalonPricing } from '@/components/salon/salon-pricing'
import { SalonFAQ } from '@/components/salon/salon-faq'
import { SalonCTA } from '@/components/salon/salon-cta'
import { SalonFooter } from '@/components/salon/salon-footer'

export default function SalonBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-950 to-slate-950">
      <SalonHero />
      <SalonFeatures />
      <SalonPricing />
      <SalonFAQ />
      <SalonCTA />
      <SalonFooter />
    </div>
  )
}
