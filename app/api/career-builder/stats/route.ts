import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE_PATH = path.join(process.cwd(), 'prisma', 'career_orders.json');

export async function GET() {
  try {
    // 1. Fetch Orders from career_orders.json
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const raw = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
      try {
        orders = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse career_orders.json:', e);
      }
    }

    // Filter completed orders
    const completedOrders = orders.filter((o: any) => o.status === 'Completed');

    // Count completed Resumes (service contains resume or cv)
    const completedResumes = completedOrders.filter((o: any) => {
      const svc = (o.service || '').toLowerCase();
      return svc.includes('resume') || svc.includes('cv');
    });
    const totalResumes = completedResumes.length;

    // Count completed Portfolios (service contains portfolio or site)
    const completedPortfolios = completedOrders.filter((o: any) => {
      const svc = (o.service || '').toLowerCase();
      return svc.includes('portfolio') || svc.includes('site');
    });
    const totalPortfolios = completedPortfolios.length;

    // Distinct completed customer emails/names
    const uniqueCustomers = new Set(completedOrders.map((o: any) => o.email || o.customer));
    const happyClients = uniqueCustomers.size;

    // 2. Fetch ATS Reviews from Database
    const totalReviews = await prisma.atsReview.count();
    const passedReviews = await prisma.atsReview.count({
      where: {
        scores: {
          some: {
            metric: 'overall',
            value: { gte: 80 }
          }
        }
      }
    });

    const atsSuccessRate = totalReviews > 0 ? Math.round((passedReviews / totalReviews) * 100 * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      totalResumes,
      totalPortfolios,
      atsSuccessRate,
      happyClients
    });
  } catch (error: any) {
    console.error('Error generating career builder stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
