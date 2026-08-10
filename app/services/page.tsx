import { PublicLayout } from '@/components/public/public-layout'
import { ServicesSection } from '@/components/public/services-section'
import { ContactSection } from '@/components/public/contact-section'

export const metadata = {
  title: 'Services | PhoenixAI Studio',
  description: 'Explore our comprehensive AI development, web applications, mobile apps, and cloud solutions.',
}

export default function ServicesPage() {
  return (
    <PublicLayout>
      <ServicesSection />
      <ContactSection />
    </PublicLayout>
  )
}
