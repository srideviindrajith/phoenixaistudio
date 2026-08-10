import { PrismaClient } from './generated-client-v2'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  // For production, set ADMIN_PASSWORD environment variable
  // For development, uses default password (DO NOT use in production)
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@phoenixai.studio' },
    update: {},
    create: {
      email: 'admin@phoenixai.studio',
      password: hashedPassword,
      name: 'Admin',
    },
  })

  console.log('Created admin:', admin.email)
  if (adminPassword === 'admin123') {
    console.warn('WARNING: Using default admin password. Set ADMIN_PASSWORD environment variable for production.')
  }

  // Create packages
  const packages = await Promise.all([
    prisma.package.upsert({
      where: { id: 'pkg-starter' },
      update: {},
      create: {
        id: 'pkg-starter',
        name: 'Starter',
        description: 'Perfect for small projects and startups',
        price: 2499,
        features: 'Basic AI integration\nUp to 5 pages\nMobile responsive\n1 month support\nBasic SEO',
        popular: false,
        order: 0,
      },
    }),
    prisma.package.upsert({
      where: { id: 'pkg-professional' },
      update: {},
      create: {
        id: 'pkg-professional',
        name: 'Professional',
        description: 'Most popular choice for growing businesses',
        price: 4999,
        features: 'Advanced AI features\nUp to 15 pages\nMobile responsive\n3 months support\nAdvanced SEO\nAnalytics dashboard\nCustom integrations',
        popular: true,
        order: 1,
      },
    }),
    prisma.package.upsert({
      where: { id: 'pkg-enterprise' },
      update: {},
      create: {
        id: 'pkg-enterprise',
        name: 'Enterprise',
        description: 'Complete solution for large organizations',
        price: 9999,
        features: 'Full AI suite\nUnlimited pages\nMobile responsive\n12 months support\nPriority support\nCustom development\nAdvanced analytics\nDedicated account manager\nCustom integrations\nTraining included',
        popular: false,
        order: 2,
      },
    }),
  ])

  console.log('Created', packages.length, 'packages')

  // Create projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'proj-1' },
      update: {},
      create: {
        id: 'proj-1',
        title: 'AI Customer Support Platform',
        description: 'Built an intelligent customer support system that reduced response times by 60% using natural language processing.',
        category: 'AI Solution',
        client: 'TechCorp Inc.',
        technologies: 'Python, TensorFlow, React, Node.js, PostgreSQL',
        featured: true,
        order: 0,
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-2' },
      update: {},
      create: {
        id: 'proj-2',
        title: 'E-Commerce Platform',
        description: 'Modern e-commerce platform with AI-powered product recommendations and inventory management.',
        category: 'Web Application',
        client: 'StyleHub',
        technologies: 'Next.js, Stripe, AI Recommendation Engine, MongoDB',
        featured: true,
        order: 1,
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-3' },
      update: {},
      create: {
        id: 'proj-3',
        title: 'Financial Analytics Dashboard',
        description: 'Real-time financial analytics dashboard with predictive modeling and automated reporting.',
        category: 'Data Analytics',
        client: 'FinanceFirst',
        technologies: 'React, D3.js, Python, Flask, PostgreSQL',
        featured: true,
        order: 2,
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-4' },
      update: {},
      create: {
        id: 'proj-4',
        title: 'Healthcare Mobile App',
        description: 'HIPAA-compliant mobile application for patient management with AI-powered health insights.',
        category: 'Mobile App',
        client: 'MediCare Plus',
        technologies: 'React Native, Node.js, AWS, Firebase',
        featured: false,
        order: 3,
      },
    }),
  ])

  console.log('Created', projects.length, 'projects')

  // Create testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.upsert({
      where: { id: 'test-1' },
      update: {},
      create: {
        id: 'test-1',
        name: 'Sarah Johnson',
        role: 'CEO',
        company: 'TechCorp Inc.',
        content: 'PhoenixAI Studio transformed our customer service operations. The AI solution they built reduced our response times by 60% and dramatically improved customer satisfaction.',
        rating: 5,
        approved: true,
        order: 0,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'test-2' },
      update: {},
      create: {
        id: 'test-2',
        name: 'Michael Chen',
        role: 'Head of Engineering',
        company: 'FinanceFirst',
        content: 'The team at PhoenixAI Studio delivered beyond our expectations. Their technical expertise and attention to detail made our analytics platform a huge success.',
        rating: 5,
        approved: true,
        order: 1,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'test-3' },
      update: {},
      create: {
        id: 'test-3',
        name: 'Emily Roberts',
        role: 'Founder',
        company: 'StyleHub',
        content: 'Working with PhoenixAI Studio was an absolute pleasure. They took our vision and turned it into a stunning e-commerce platform that our customers love.',
        rating: 5,
        approved: true,
        order: 2,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'test-4' },
      update: {},
      create: {
        id: 'test-4',
        name: 'David Williams',
        role: 'Product Manager',
        company: 'MediCare Plus',
        content: 'The mobile app PhoenixAI Studio built for us has revolutionized how we interact with patients. The AI health insights feature is particularly impressive.',
        rating: 5,
        approved: true,
        order: 3,
      },
    }),
  ])

  console.log('Created', testimonials.length, 'testimonials')

  // Create settings
  const settingsData = [
    { key: 'site_name', value: 'PhoenixAI Studio' },
    { key: 'site_tagline', value: 'Build the Future with AI' },
    { key: 'hero_title', value: 'Build the Future with AI' },
    { key: 'hero_subtitle', value: 'We transform your ideas into intelligent, scalable applications powered by cutting-edge artificial intelligence technology.' },
    { key: 'contact_email', value: 'contact@phoenixai.studio' },
    { key: 'contact_phone', value: '+1 (555) 123-4567' },
    { key: 'instagram_id', value: '@phoenixai.studio' },
    { key: 'footer_text', value: 'Transforming ideas into intelligent solutions.' },
    { key: 'about_text', value: 'We are a team of passionate technologists dedicated to building innovative AI-powered solutions that drive business growth.' },
    { key: 'cta_button_text', value: 'Get Started' },
    { key: 'hero_stats_projects', value: '150+' },
    { key: 'hero_stats_clients', value: '50+' },
    { key: 'hero_stats_experience', value: '5+' },
    { key: 'hero_stats_satisfaction', value: '99%' },
  ]

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value, type: 'text' },
    })
  }

  await prisma.setting.upsert({
    where: { key: 'site_profile' },
    update: {
      siteName: 'PhoenixAI Studio',
      instagram_id: '@phoenixai.studio',
    },
    create: {
      key: 'site_profile',
      value: '',
      type: 'profile',
      siteName: 'PhoenixAI Studio',
      instagram_id: '@phoenixai.studio',
    },
  })

  console.log('Created', settingsData.length, 'settings')

  // Seed Salon Services
  const salonServices = await Promise.all([
    prisma.salonService.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        name: 'Hair Cut',
        description: 'Professional hair cutting and styling',
        price: 500,
        duration: 30,
        category: 'Hair',
        order: 0,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        name: 'Hair Spa',
        description: 'Relaxing hair spa treatment',
        price: 800,
        duration: 45,
        category: 'Hair',
        order: 1,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        name: 'Hair Coloring',
        description: 'Professional hair coloring services',
        price: 1500,
        duration: 60,
        category: 'Hair',
        order: 2,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-4' },
      update: {},
      create: {
        id: 'service-4',
        name: 'Facial',
        description: 'Rejuvenating facial treatment',
        price: 600,
        duration: 30,
        category: 'Skin',
        order: 3,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-5' },
      update: {},
      create: {
        id: 'service-5',
        name: 'Beard Trim',
        description: 'Professional beard grooming',
        price: 200,
        duration: 15,
        category: 'Grooming',
        order: 4,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-6' },
      update: {},
      create: {
        id: 'service-6',
        name: 'Hair Straightening',
        description: 'Professional hair straightening',
        price: 2000,
        duration: 90,
        category: 'Hair',
        order: 5,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-7' },
      update: {},
      create: {
        id: 'service-7',
        name: 'Bridal Makeup',
        description: 'Complete bridal makeup package',
        price: 5000,
        duration: 120,
        category: 'Makeup',
        order: 6,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-8' },
      update: {},
      create: {
        id: 'service-8',
        name: 'Party Makeup',
        description: 'Glamorous party makeup',
        price: 1500,
        duration: 45,
        category: 'Makeup',
        order: 7,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-9' },
      update: {},
      create: {
        id: 'service-9',
        name: 'Pedicure',
        description: 'Relaxing pedicure treatment',
        price: 400,
        duration: 30,
        category: 'Nails',
        order: 8,
      },
    }),
    prisma.salonService.upsert({
      where: { id: 'service-10' },
      update: {},
      create: {
        id: 'service-10',
        name: 'Manicure',
        description: 'Professional manicure',
        price: 350,
        duration: 30,
        category: 'Nails',
        order: 9,
      },
    }),
  ])

  console.log('Created', salonServices.length, 'salon services')

  // Seed Salon Settings
  const salonSettings = await prisma.salonSettings.upsert({
    where: { id: 'salon-settings-1' },
    update: {},
    create: {
      id: 'salon-settings-1',
      businessName: 'Luxury Beauty Salon',
      whatsappNumber: '+1234567890',
      email: 'contact@luxurysalon.com',
      address: '123 Beauty Street, Style City',
      openingHours: 'Mon-Sat: 9AM-7PM | Sun: 10AM-5PM',
      location: 'City Center Mall, Ground Floor',
      parkingInfo: 'Free parking available for 2 hours',
      paymentMethods: 'Cash, Card, UPI, PayPal',
      cancellationPolicy: '24 hours notice required for cancellation',
      offers: 'First visit: 20% off on all services',
    },
  })

  console.log('Created salon settings')

  // Seed AI Agents
  const agents = [
    {
      id: 'agent-1',
      name: 'OmniChannel Support Agent',
      description: 'Resolves customer support tickets, live chats, and emails with human-like accuracy and intent detection.',
      category: 'Customer Service',
      price: 199.00,
      features: 'Multilingual Support\n24/7 Availability\nCRM Integration\nAuto-escalation to humans',
      status: true,
      isPublic: true
    },
    {
      id: 'agent-2',
      name: 'LeadGen Outreach Agent',
      description: 'Automates cold emailing, linkedin outreach, and lead qualification using hyper-personalized messages.',
      category: 'Sales & Marketing',
      price: 299.00,
      features: 'LinkedIn Automation\nEmail Personalization\nLead Scoring\nMeeting Booking Sync',
      status: true,
      isPublic: true
    },
    {
      id: 'agent-3',
      name: 'DataAnalytica Insights Agent',
      description: 'Monitors business metrics, detects anomalies, and generates automated weekly performance reports.',
      category: 'Analytics',
      price: 399.00,
      features: 'Anomaly Detection\nAutomatic Reporting\nSQL Querying\nSlack Alerts',
      status: true,
      isPublic: true
    }
  ]

  for (const agent of agents) {
    await prisma.aiAgent.upsert({
      where: { id: agent.id },
      update: agent,
      create: agent
    })
  }
  console.log('Seeded AI Agents')

  // Seed Demo Models
  const models = [
    {
      id: 'model-1',
      title: 'Custom NLP Classifier',
      description: 'Interactive demo classifying customer intent and sentiment.',
      category: 'Language Processing',
      liveUrl: 'https://nlp.demo.phoenixai.studio',
      status: true
    },
    {
      id: 'model-2',
      title: 'Computer Vision Object Detection',
      description: 'Identify products in store shelves or warehouses in real-time.',
      category: 'Computer Vision',
      liveUrl: 'https://vision.demo.phoenixai.studio',
      status: true
    },
    {
      id: 'model-3',
      title: 'Predictive Lead Scoring Engine',
      description: 'Forecast purchase likelihood based on user interaction traits.',
      category: 'Predictive Analytics',
      liveUrl: 'https://predictive.demo.phoenixai.studio',
      status: true
    }
  ]

  for (const model of models) {
    await prisma.demoModel.upsert({
      where: { id: model.id },
      update: model,
      create: model
    })
  }
  console.log('Seeded Demo Models')

  // Seed Core Systems
  const coreSystems = [
    {
      id: 'system-1',
      name: 'PhoenixCRM Enterprise',
      description: 'Next-gen Client Relationship Manager with built-in conversational intelligence and automated sales pipelines.',
      category: 'CRM',
      status: true
    },
    {
      id: 'system-2',
      name: 'PhoenixERP Orchestrator',
      description: 'Enterprise Resource Planner connecting supply chain, workforce, and projects under unified AI resource tracking.',
      category: 'ERP',
      status: true
    },
    {
      id: 'system-3',
      name: 'PhoenixBilling & Ledger',
      description: 'Automated invoicing, recurring subscriptions, tax compliance, and finance forecasting engine.',
      category: 'Billing',
      status: true
    },
    {
      id: 'system-4',
      name: 'Workflow AutoPilot',
      description: 'Cross-platform automation framework linking SaaS tools together with zero-code flow builder.',
      category: 'Automation',
      status: true
    },
    {
      id: 'system-5',
      name: 'AuraAnalytics Hub',
      description: 'Real-time BI dashboard combining database pipelines and predictive forecasting plots.',
      category: 'Analytics',
      status: true
    }
  ]

  for (const sys of coreSystems) {
    await prisma.coreSystem.upsert({
      where: { id: sys.id },
      update: sys,
      create: sys
    })
  }
  console.log('Seeded Core Systems')

  console.log('\nSeed completed successfully!')
  console.log('Admin login: admin@phoenixai.studio / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
