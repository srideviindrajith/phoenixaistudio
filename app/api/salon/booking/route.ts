import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated-client-v2'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, service, date, time, stylist, specialNotes } = await req.json()

    if (!name || !email || !phone || !service || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find or create customer
    let customer = await prisma.salonCustomer.findUnique({
      where: { email }
    })

    if (!customer) {
      customer = await prisma.salonCustomer.create({
        data: {
          name,
          email,
          phone
        }
      })
    } else {
      // Update customer info if changed
      customer = await prisma.salonCustomer.update({
        where: { email },
        data: {
          name,
          phone
        }
      })
    }

    // Find service
    const salonService = await prisma.salonService.findFirst({
      where: {
        name: service,
        status: true
      }
    })

    if (!salonService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Create appointment
    const appointment = await prisma.salonAppointment.create({
      data: {
        customerId: customer.id,
        serviceId: salonService.id,
        date: new Date(date),
        time,
        stylist: stylist || null,
        specialNotes: specialNotes || null,
        status: 'confirmed'
      },
      include: {
        customer: true,
        service: true
      }
    })

    return NextResponse.json({
      success: true,
      appointment
    })
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const appointments = await prisma.salonAppointment.findMany({
      where: {
        customer: {
          email
        }
      },
      include: {
        customer: true,
        service: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const appointmentId = searchParams.get('id')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    await prisma.salonAppointment.update({
      where: { id: appointmentId },
      data: { status: 'cancelled' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}
