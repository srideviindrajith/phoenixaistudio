import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PACKAGE_CATEGORIES = ['AI Agent', 'Client Solution']
const PACKAGE_STATUSES = ['Draft', 'Active', 'Coming Soon', 'Maintenance', 'Archived']
const PACKAGE_VISIBILITIES = ['Public', 'Hidden']
const PACKAGE_BUTTON_ACTIONS = ['Contact', 'Launch', 'Demo', 'Documentation', 'Custom URL']

function isValidUrl(value: unknown) {
  const url = typeof value === 'string' ? value.trim() : ''

  if (!url) return true

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function optionalText(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || null
}

function packagePayload(data: Record<string, unknown>) {
  const category = PACKAGE_CATEGORIES.includes(String(data.category))
    ? String(data.category)
    : 'AI Agent'
  const rawStatus =
    typeof data.status === 'boolean'
      ? data.status ? 'Active' : 'Draft'
      : String(data.status || 'Active')
  const status = PACKAGE_STATUSES.includes(rawStatus) ? rawStatus : 'Active'
  const visibility = PACKAGE_VISIBILITIES.includes(String(data.visibility))
    ? String(data.visibility)
    : 'Public'
  const buttonAction = PACKAGE_BUTTON_ACTIONS.includes(String(data.buttonAction))
    ? String(data.buttonAction)
    : 'Contact'
  const price = Number.parseFloat(String(data.price || 0))
  const order = Number.parseInt(String(data.order || data.displayOrder || 0), 10)
  const shortDescription = optionalText(data.shortDescription)
  const longDescription = optionalText(data.longDescription)
  const description = String(data.description || shortDescription || longDescription || '')

  return {
    name: String(data.name || ''),
    description,
    category,
    price: Number.isFinite(price) ? price : 0,
    features: String(data.features || ''),
    launchUrl: optionalText(data.launchUrl),
    demoUrl: optionalText(data.demoUrl),
    documentationUrl: optionalText(data.documentationUrl),
    buttonText: String(data.buttonText || 'Contact Sales'),
    buttonUrl: optionalText(data.buttonUrl),
    billingCycle: category === 'AI Agent' ? String(data.billingCycle || 'month') : undefined,
    currency: String(data.currency || '₹'),
    popular: Boolean(data.popular),
    featured: Boolean(data.featured),
    visibility,
    status,
    tags: optionalText(data.tags),
    shortDescription,
    longDescription,
    buttonColor: optionalText(data.buttonColor),
    gradient: optionalText(data.gradient),
    buttonIcon: optionalText(data.buttonIcon),
    buttonAction,
    order: Number.isFinite(order) ? order : 0,
    offerEnabled: Boolean(data.offerEnabled),
    offerLabel: optionalText(data.offerLabel),
    customOfferLabel: optionalText(data.customOfferLabel),
    originalPrice: data.originalPrice !== undefined && data.originalPrice !== null && data.originalPrice !== "" ? Number.parseFloat(String(data.originalPrice)) : null,
    offerPrice: data.offerPrice !== undefined && data.offerPrice !== null && data.offerPrice !== "" ? Number.parseFloat(String(data.offerPrice)) : null,
    offerStartDate: data.offerStartDate ? new Date(String(data.offerStartDate)) : null,
    offerEndDate: data.offerEndDate ? new Date(String(data.offerEndDate)) : null,
    discountPercentage: data.originalPrice && data.offerPrice && Number(data.originalPrice) > 0
      ? Math.round(((Number(data.originalPrice) - Number(data.offerPrice)) / Number(data.originalPrice)) * 100)
      : null,
    offerMetadata: optionalText(data.offerMetadata),
  }
}

function validatePackagePayload(data: Record<string, unknown>) {
  if (!PACKAGE_CATEGORIES.includes(String(data.category || 'AI Agent'))) {
    return 'Package Category must be AI Agent or Client Solution'
  }

  const rawStatus =
    typeof data.status === 'boolean'
      ? data.status ? 'Active' : 'Draft'
      : String(data.status || 'Active')

  if (!PACKAGE_STATUSES.includes(rawStatus)) {
    return 'Status must be Draft, Active, Coming Soon, Maintenance, or Archived'
  }

  if (!isValidUrl(data.launchUrl)) return 'Launch URL must be a valid http or https URL'
  if (!isValidUrl(data.demoUrl)) return 'Demo URL must be a valid http or https URL'
  if (!isValidUrl(data.documentationUrl)) return 'Documentation URL must be a valid http or https URL'
  if (!isValidUrl(data.buttonUrl)) return 'Button URL must be a valid http or https URL'

  const offerEnabled = Boolean(data.offerEnabled)
  const originalPrice = data.originalPrice !== undefined && data.originalPrice !== null && data.originalPrice !== "" ? Number.parseFloat(String(data.originalPrice)) : null
  const offerPrice = data.offerPrice !== undefined && data.offerPrice !== null && data.offerPrice !== "" ? Number.parseFloat(String(data.offerPrice)) : null
  const offerStartDateStr = data.offerStartDate ? String(data.offerStartDate) : ''
  const offerEndDateStr = data.offerEndDate ? String(data.offerEndDate) : ''

  if (offerEnabled) {
    if (originalPrice === null || Number.isNaN(originalPrice)) {
      return 'Original Price (MRP) is required when offer is enabled'
    }
    if (offerPrice === null || Number.isNaN(offerPrice)) {
      return 'Offer Price is required when offer is enabled'
    }
    if (!offerEndDateStr) {
      return 'Offer End Date is required when offer is enabled'
    }
  }

  if (originalPrice !== null && offerPrice !== null && !Number.isNaN(originalPrice) && !Number.isNaN(offerPrice)) {
    if (offerPrice >= originalPrice) {
      return 'Offer Price must be less than Original Price (MRP)'
    }
  }

  if (offerStartDateStr && offerEndDateStr) {
    const start = new Date(offerStartDateStr)
    const end = new Date(offerEndDateStr)
    if (end < start) {
      return 'Offer End Date cannot be before Offer Start Date'
    }
  }

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            status: true,
            isPublic: true,
          },
        },
        _count: {
          select: {
            agents: true,
          },
        },
      },
    })
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    const validationError = validatePackagePayload(data)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const pkg = await prisma.package.update({
      where: { id },
      data: packagePayload(data),
    })
    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Check if package has linked AI Agents
    const agentCount = await prisma.aiAgent.count({
      where: { packageId: id },
    })
    
    if (agentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete package because ${agentCount} AI Agent(s) are using it` },
        { status: 400 }
      )
    }
    
    await prisma.package.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
