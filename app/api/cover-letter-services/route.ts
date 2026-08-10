import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'prisma', 'cover_letter_services.json');

const INITIAL_SERVICES = [
  {
    id: 'svc-basic-review',
    title: 'Basic Cover Letter Review',
    category: 'Review',
    package: 'Starter',
    price: '₹999',
    discount: '10%',
    delivery: '3 Business Days',
    revisions: '2 Rounds',
    support: 'Email Support',
    status: 'Active',
    visibility: 'Public',
    featured: false,
    popular: false,
    desc: 'Professional review of your existing cover letter with actionable line-by-line feedback.',
    features: [
      'Grammar & Syntax Check',
      'Tone & Impact Assessment',
      'Formatting Alignment'
    ],
    deliverables: [
      'Annotated PDF with comments',
      '1-page PDF feedback summary report'
    ],
    faqs: [
      {
        q: 'What do I need to submit?',
        a: 'You need to submit your current resume, existing cover letter, and a link to the job description you are targeting.'
      },
      {
        q: 'Can you rewrite it for me?',
        a: 'This service is for review and feedback only. For a complete rewrite, please select our Professional or Executive options.'
      }
    ],
    requirements: [
      'Target Job Description link or text',
      'Current resume in DOCX or PDF format',
      'Draft cover letter to be reviewed'
    ],
    instructions: [
      'Upload all files in the requirement submission form post-purchase.',
      'Highlight any specific areas of concern you\'d like the reviewer to focus on.'
    ],
    addons: [
      {
        title: 'Extra Fast 24h Delivery',
        price: '₹499'
      }
    ]
  },
  {
    id: 'svc-professional-writing',
    title: 'Professional Cover Letter Writing',
    category: 'Writing',
    package: 'Professional',
    price: '₹1,999',
    discount: '15%',
    delivery: '2 Business Days',
    revisions: 'Unlimited for 14 Days',
    support: '24/7 Priority Support',
    status: 'Active',
    visibility: 'Public',
    featured: true,
    popular: true,
    desc: 'Custom-written cover letter tailored to your target role and industry to maximize interview chances.',
    features: [
      'ATS Keyword Optimization',
      'Custom Value Proposition',
      'Industry-specific phrasing',
      'Editable Source Files included'
    ],
    deliverables: [
      '1 Custom Cover Letter (DOCX format)',
      '1 PDF ready-to-print version',
      'Keyword Optimization report'
    ],
    faqs: [
      {
        q: 'Is this cover letter editable?',
        a: 'Yes, we provide the final deliverable in fully editable Microsoft Word (.docx) format.'
      },
      {
        q: 'Is the cover letter ATS friendly?',
        a: 'Yes, we integrate key terms from your targeted job listing so it passes automated applicant tracking scanners.'
      }
    ],
    requirements: [
      'Target Job Description link or text',
      'Current resume or detailed list of work accomplishments'
    ],
    instructions: [
      'Ensure your resume is updated and reflects your most recent role before uploading.',
      'Submit the specific job posting URL so our writers can match the job requirements precisely.'
    ],
    addons: [
      {
        title: 'LinkedIn Profile Summary Copy',
        price: '₹699'
      },
      {
        title: 'Extra Fast 24h Delivery',
        price: '₹599'
      }
    ]
  },
  {
    id: 'svc-executive-strategy',
    title: 'Executive Cover Letter & Strategy',
    category: 'Executive Strategy',
    package: 'Enterprise',
    price: '₹3,499',
    discount: '20%',
    delivery: '1 Business Day',
    revisions: 'Unlimited for 30 Days',
    support: '1-on-1 Dedicated Consultant',
    status: 'Active',
    visibility: 'Public',
    featured: true,
    popular: false,
    desc: 'High-impact narrative design and letter writing for VP, Director, and C-level executive roles.',
    features: [
      'C-Suite Value Positioning',
      'Executive Narrative Alignment',
      'Metrics and Leadership Showcasing',
      '1-on-1 Strategy Consultation Call (30 mins)'
    ],
    deliverables: [
      '1 Executive Cover Letter (DOCX & PDF)',
      '1 Personalized Cold Outreach email template',
      'Consultation Call Recording'
    ],
    faqs: [
      {
        q: 'How does the consultation call work?',
        a: 'Once purchased, you will receive a scheduling link to book a 30-minute Zoom call with your dedicated executive writer.'
      }
    ],
    requirements: [
      'Executive profile draft or CV',
      'Links to targeted executive search listings or target board positions'
    ],
    instructions: [
      'Schedule your call within 48 hours of purchase to avoid delivery delays.',
      'Send any executive bios or reference materials in advance of the call.'
    ],
    addons: [
      {
        title: 'Executive Bio Writing (1-page)',
        price: '₹1,499'
      },
      {
        title: 'LinkedIn Profile Optimization Writeup',
        price: '₹1,299'
      }
    ]
  }
];

function readServicesFromFile() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_SERVICES, null, 2), 'utf-8');
      return INITIAL_SERVICES;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading cover letter services file:', e);
    return INITIAL_SERVICES;
  }
}

function writeServicesToFile(services: any[]) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(services, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing cover letter services file:', e);
  }
}

export async function GET() {
  const services = readServicesFromFile();
  return NextResponse.json({ success: true, services });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const services = readServicesFromFile();

    const id = body.id || `SVC-CL-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedService = {
      id,
      title: body.title || 'Custom Cover Letter Service',
      category: body.category || 'Writing',
      package: body.package || 'Starter',
      price: body.price || '₹1,999',
      discount: body.discount || '0%',
      delivery: body.delivery || '3 Business Days',
      revisions: body.revisions || '2 Rounds',
      support: body.support || 'Email Support',
      status: body.status || 'Active',
      visibility: body.visibility || 'Public',
      featured: body.featured ?? false,
      popular: body.popular ?? false,
      desc: body.desc || 'Custom cover letter writing service.',
      features: body.features || [],
      deliverables: body.deliverables || [],
      faqs: body.faqs || [],
      requirements: body.requirements || [],
      instructions: body.instructions || [],
      addons: body.addons || []
    };

    // Write to database using Prisma (handles upsert)
    try {
      await prisma.coverLetterService.upsert({
        where: { id: updatedService.id },
        update: {},
        create: { id: updatedService.id }
      });
    } catch (dbErr) {
      console.error('Database update failed in cover letter services:', dbErr);
    }

    const existingIndex = services.findIndex((s: any) => s.id === id);
    if (existingIndex !== -1) {
      // Update
      services[existingIndex] = {
        ...services[existingIndex],
        ...updatedService
      };
    } else {
      // Create
      services.unshift(updatedService);
    }

    writeServicesToFile(services);

    return NextResponse.json({ success: true, service: updatedService });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }

    // Delete from database
    try {
      await prisma.coverLetterService.delete({
        where: { id: id }
      });
    } catch (dbErr) {
      // Ignore if not in db
    }

    const services = readServicesFromFile();
    const filtered = services.filter((s: any) => s.id !== id);
    writeServicesToFile(filtered);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
