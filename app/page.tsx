import { PublicLayout } from '@/components/public/public-layout'
import { HeroSection } from '@/components/public/hero-section'
import { ServicesSection } from '@/components/public/services-section'
import { ContactSection } from '@/components/public/contact-section'

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <ServicesSection />
      <ContactSection />
    </PublicLayout>
  )
}
