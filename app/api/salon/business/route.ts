import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated-client-v2'

const prisma = new PrismaClient()

export async function GET() {
  try {
    let settings = await prisma.salonSettings.findFirst()

    if (!settings) {
      // Create default settings
      settings = await prisma.salonSettings.create({
        data: {
          businessName: 'Salon Booking AI',
          whatsappNumber: null,
          email: null,
          address: null,
          openingHours: 'Mon-Sat: 9AM-7PM',
          location: null,
          parkingInfo: null,
          paymentMethods: 'Cash, Card, UPI',
          cancellationPolicy: '24 hours notice required',
          offers: null
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Business settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      businessName,
      logo,
      whatsappNumber,
      email,
      address,
      openingHours,
      location,
      parkingInfo,
      paymentMethods,
      cancellationPolicy,
      offers
    } = await req.json()

    let settings = await prisma.salonSettings.findFirst()

    if (settings) {
      settings = await prisma.salonSettings.update({
        where: { id: settings.id },
        data: {
          businessName: businessName || settings.businessName,
          logo: logo || settings.logo,
          whatsappNumber: whatsappNumber || settings.whatsappNumber,
          email: email || settings.email,
          address: address || settings.address,
          openingHours: openingHours || settings.openingHours,
          location: location || settings.location,
          parkingInfo: parkingInfo || settings.parkingInfo,
          paymentMethods: paymentMethods || settings.paymentMethods,
          cancellationPolicy: cancellationPolicy || settings.cancellationPolicy,
          offers: offers || settings.offers
        }
      })
    } else {
      settings = await prisma.salonSettings.create({
        data: {
          businessName: businessName || 'Salon Booking AI',
          logo: logo || null,
          whatsappNumber: whatsappNumber || null,
          email: email || null,
          address: address || null,
          openingHours: openingHours || 'Mon-Sat: 9AM-7PM',
          location: location || null,
          parkingInfo: parkingInfo || null,
          paymentMethods: paymentMethods || 'Cash, Card, UPI',
          cancellationPolicy: cancellationPolicy || '24 hours notice required',
          offers: offers || null
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Update business settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
}
