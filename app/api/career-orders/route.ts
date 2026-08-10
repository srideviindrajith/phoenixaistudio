import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'prisma', 'career_orders.json');

const INITIAL_ORDERS = [
    {
        id: 'ORD-8291',
        customer: 'Alex Mercer',
        email: 'alex.mercer@gmail.com',
        phone: '+1 (555) 019-2834',
        service: 'ATS Professional Resume',
        packageType: 'Professional',
        selectedTemplate: 'Modern Minimalist',
        assignedStaff: 'Marcus Devore',
        assignedTeam: 'Resume Writing',
        status: 'Processing',
        payment: 'Paid',
        amount: '$149.00',
        orderDate: '2026-07-10',
        deliveryDate: '2026-07-15',
        expectedDelivery: '2026-07-15',
        notes: 'Targeting Senior Software Engineer roles. Wants to focus on Cloud and Kubernetes experience.',
        paymentMethod: 'Credit Card',
        priority: 'High',
        timeline: [
            { title: 'Order Created', time: '2026-07-10 09:30 AM', done: true },
            { title: 'Assigned', time: '2026-07-10 10:15 AM', done: true },
            { title: 'Resume Started', time: '2026-07-11 02:00 PM', done: true },
            { title: 'ATS Review', time: '2026-07-12 11:00 AM', done: false },
            { title: 'Client Review', time: 'Pending', done: false },
            { title: 'Revision', time: 'Pending', done: false },
            { title: 'Completed', time: 'Pending', done: false }
        ]
    },
    {
        id: 'ORD-9123',
        customer: 'Jane Smith',
        email: 'janesmith@tech.co',
        phone: '+1 (555) 012-9876',
        service: 'Developer Portfolio',
        packageType: 'Professional',
        selectedTemplate: 'Aurora Glow',
        assignedStaff: 'Elena Rostova',
        assignedTeam: 'Web Development',
        status: 'Review',
        payment: 'Paid',
        amount: '$299.00',
        orderDate: '2026-07-08',
        deliveryDate: '2026-07-14',
        expectedDelivery: '2026-07-14',
        notes: 'Needs React/Next.js interactive showcase with dark mode and particle animation effects.',
        paymentMethod: 'PayPal',
        priority: 'Urgent',
        timeline: [
            { title: 'Order Created', time: '2026-07-08 11:00 AM', done: true },
            { title: 'Assigned', time: '2026-07-08 11:30 AM', done: true },
            { title: 'Resume Started', time: '2026-07-09 09:00 AM', done: true },
            { title: 'ATS Review', time: '2026-07-10 03:00 PM', done: true },
            { title: 'Client Review', time: '2026-07-12 04:30 PM', done: true },
            { title: 'Revision', time: 'Pending', done: false },
            { title: 'Completed', time: 'Pending', done: false }
        ]
    },
    {
        id: 'ORD-4829',
        customer: 'Sarah Connor',
        email: 'connor.s@cyberdyne.io',
        phone: '+1 (555) 014-4920',
        service: 'Executive Resume Layout',
        packageType: 'Executive',
        selectedTemplate: 'Corporate Slate',
        assignedStaff: 'John Smith',
        assignedTeam: 'Resume Writing',
        status: 'Pending',
        payment: 'Pending',
        amount: '$199.00',
        orderDate: '2026-07-13',
        deliveryDate: '2026-07-20',
        expectedDelivery: '2026-07-20',
        notes: 'Targeting CTO positions. Highlighting strategic operations and AI workload migrations.',
        paymentMethod: 'Bank Transfer',
        priority: 'Medium',
        timeline: [
            { title: 'Order Created', time: '2026-07-13 08:00 AM', done: true },
            { title: 'Assigned', time: 'Pending', done: false },
            { title: 'Resume Started', time: 'Pending', done: false },
            { title: 'ATS Review', time: 'Pending', done: false },
            { title: 'Client Review', time: 'Pending', done: false },
            { title: 'Revision', time: 'Pending', done: false },
            { title: 'Completed', time: 'Pending', done: false }
        ]
    },
    {
        id: 'ORD-3729',
        customer: 'David Clark',
        email: 'dclark@cloudcorp.com',
        phone: '+1 (555) 017-3829',
        service: 'LinkedIn Bio Optimization',
        packageType: 'Starter',
        selectedTemplate: 'N/A',
        assignedStaff: 'Marcus Devore',
        assignedTeam: 'Consulting',
        status: 'Completed',
        payment: 'Paid',
        amount: '$79.00',
        orderDate: '2026-07-05',
        deliveryDate: '2026-07-09',
        expectedDelivery: '2026-07-09',
        notes: 'Wants headline optimized for DevOps Lead / SRE Consultant.',
        paymentMethod: 'Credit Card',
        priority: 'Low',
        timeline: [
            { title: 'Order Created', time: '2026-07-05 10:00 AM', done: true },
            { title: 'Assigned', time: '2026-07-05 11:00 AM', done: true },
            { title: 'Resume Started', time: '2026-07-06 09:00 AM', done: true },
            { title: 'ATS Review', time: '2026-07-07 02:00 PM', done: true },
            { title: 'Client Review', time: '2026-07-08 04:00 PM', done: true },
            { title: 'Revision', time: '2026-07-09 10:00 AM', done: true },
            { title: 'Completed', time: '2026-07-09 11:30 AM', done: true }
        ]
    },
    {
        id: 'ORD-7392',
        customer: 'Elena Rostova',
        email: 'e.rostova@designhub.io',
        phone: '+1 (555) 011-2345',
        service: 'CV Review',
        packageType: 'Starter',
        selectedTemplate: 'N/A',
        assignedStaff: 'Sarah Johnson',
        assignedTeam: 'Review Team',
        status: 'Completed',
        payment: 'Paid',
        amount: '$49.00',
        orderDate: '2026-07-06',
        deliveryDate: '2026-07-08',
        expectedDelivery: '2026-07-08',
        notes: 'Needs review of academic CV for Stanford fellowship application.',
        paymentMethod: 'Stripe',
        priority: 'Low',
        timeline: [
            { title: 'Order Created', time: '2026-07-06 01:00 PM', done: true },
            { title: 'Assigned', time: '2026-07-06 02:30 PM', done: true },
            { title: 'Resume Started', time: '2026-07-07 09:00 AM', done: true },
            { title: 'ATS Review', time: '2026-07-07 03:00 PM', done: true },
            { title: 'Completed', time: '2026-07-08 01:00 PM', done: true }
        ]
    },
    {
        id: 'ORD-2819',
        customer: 'Robert Chen',
        email: 'robert.chen@gmail.com',
        phone: '+1 (555) 018-9122',
        service: 'Cover Letter Writing',
        packageType: 'Starter',
        selectedTemplate: 'Classic Elegant',
        assignedStaff: 'Marcus Devore',
        assignedTeam: 'Resume Writing',
        status: 'Cancelled',
        payment: 'Failed',
        amount: '$59.00',
        orderDate: '2026-07-02',
        deliveryDate: '2026-07-07',
        expectedDelivery: '2026-07-07',
        notes: 'Client cancelled due to duplicate purchase. Payment failed.',
        paymentMethod: 'Credit Card',
        priority: 'Medium',
        timeline: [
            { title: 'Order Created', time: '2026-07-02 04:00 PM', done: true },
            { title: 'Assigned', time: '2026-07-02 04:15 PM', done: true },
            { title: 'Completed', time: '2026-07-03 10:00 AM', done: false }
        ]
    },
    {
        id: 'ORD-1928',
        customer: 'Maya Lin',
        email: 'maya.lin@studio.com',
        phone: '+1 (555) 016-7281',
        service: 'Combined Resume & Site',
        packageType: 'Professional',
        selectedTemplate: 'Creative Glass',
        assignedStaff: 'Elena Rostova',
        assignedTeam: 'Design & Dev',
        status: 'Processing',
        payment: 'Paid',
        amount: '$399.00',
        orderDate: '2026-07-11',
        deliveryDate: '2026-07-18',
        expectedDelivery: '2026-07-18',
        notes: 'Needs portfolio built in next.js and hosting setup. CV template Creative Glass.',
        paymentMethod: 'Credit Card',
        priority: 'High',
        timeline: [
            { title: 'Order Created', time: '2026-07-11 11:30 AM', done: true },
            { title: 'Assigned', time: '2026-07-11 12:00 PM', done: true },
            { title: 'Resume Started', time: '2026-07-12 10:00 AM', done: true },
            { title: 'ATS Review', time: 'Pending', done: false },
            { title: 'Client Review', time: 'Pending', done: false },
            { title: 'Revision', time: 'Pending', done: false },
            { title: 'Completed', time: 'Pending', done: false }
        ]
    },
    {
        id: 'ORD-6291',
        customer: 'James Watson',
        email: 'jwatson@biotech.org',
        phone: '+1 (555) 013-1829',
        service: 'ATS Professional Resume',
        packageType: 'Starter',
        selectedTemplate: 'Modern Minimalist',
        assignedStaff: 'John Smith',
        assignedTeam: 'Resume Writing',
        status: 'Pending',
        payment: 'Paid',
        amount: '$119.00',
        orderDate: '2026-07-12',
        deliveryDate: '2026-07-19',
        expectedDelivery: '2026-07-19',
        notes: 'Needs resume optimized for transition from lab research to bio-tech management.',
        paymentMethod: 'PayPal',
        priority: 'Medium',
        timeline: [
            { title: 'Order Created', time: '2026-07-12 02:00 PM', done: true },
            { title: 'Assigned', time: '2026-07-12 03:00 PM', done: true },
            { title: 'Resume Started', time: 'Pending', done: false },
            { title: 'ATS Review', time: 'Pending', done: false },
            { title: 'Completed', time: 'Pending', done: false }
        ]
    },
    {
        id: 'ORD-5192',
        customer: 'Olivia Martinez',
        email: 'olivia.martinez@outlook.com',
        phone: '+1 (555) 015-8291',
        service: 'LinkedIn Bio Optimization',
        packageType: 'Starter',
        selectedTemplate: 'N/A',
        assignedStaff: 'Sarah Johnson',
        assignedTeam: 'Consulting',
        status: 'Review',
        payment: 'Paid',
        amount: '$79.00',
        orderDate: '2026-07-09',
        deliveryDate: '2026-07-13',
        expectedDelivery: '2026-07-13',
        notes: 'Client is reviewing draft version. Needs checklist matching profile headers.',
        paymentMethod: 'Stripe',
        priority: 'Medium',
        timeline: [
            { title: 'Order Created', time: '2026-07-09 10:00 AM', done: true },
            { title: 'Assigned', time: '2026-07-09 11:30 AM', done: true },
            { title: 'Resume Started', time: '2026-07-10 09:00 AM', done: true },
            { title: 'ATS Review', time: '2026-07-11 04:00 PM', done: true },
            { title: 'Client Review', time: '2026-07-12 05:00 PM', done: true },
            { title: 'Completed', time: 'Pending', done: false }
        ]
    },
    {
        id: 'ORD-4291',
        customer: 'Ethan Hunt',
        email: 'ethan.hunt@imf.org',
        phone: '+1 (555) 007-0007',
        service: 'Developer Portfolio',
        packageType: 'Professional',
        selectedTemplate: 'Vaporwave Grid',
        assignedStaff: 'Elena Rostova',
        assignedTeam: 'Web Development',
        status: 'Completed',
        payment: 'Refunded',
        amount: '$249.00',
        orderDate: '2026-07-01',
        deliveryDate: '2026-07-05',
        expectedDelivery: '2026-07-05',
        notes: 'Order completed but client requested a refund due to internal IMF restructuring.',
        paymentMethod: 'Credit Card',
        priority: 'High',
        timeline: [
            { title: 'Order Created', time: '2026-07-01 08:00 AM', done: true },
            { title: 'Assigned', time: '2026-07-01 09:00 AM', done: true },
            { title: 'Resume Started', time: '2026-07-02 10:00 AM', done: true },
            { title: 'Completed', time: '2026-07-05 06:00 PM', done: true }
        ]
    }
];

function readOrdersFromFile() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            // Seed file
            fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
            fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_ORDERS, null, 2), 'utf-8');
            return INITIAL_ORDERS;
        }
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading orders file:', e);
        return INITIAL_ORDERS;
    }
}

function writeOrdersToFile(orders: any[]) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error writing orders file:', e);
    }
}

export async function GET() {
    const orders = readOrdersFromFile();
    return NextResponse.json({ success: true, orders });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const orders = readOrdersFromFile();
        
        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            customer: body.customer || 'Unnamed Client',
            email: body.email || 'no-email@example.com',
            phone: body.phone || 'N/A',
            service: body.service || 'CV Review',
            packageType: body.packageType || 'Starter',
            selectedTemplate: body.selectedTemplate || 'N/A',
            assignedStaff: body.assignedStaff || 'Unassigned',
            assignedTeam: body.assignedTeam || 'Unassigned',
            status: body.status || 'Pending',
            payment: body.payment || 'Pending',
            amount: body.amount || '$0.00',
            orderDate: body.orderDate || new Date().toISOString().split('T')[0],
            deliveryDate: body.deliveryDate || 'Pending',
            expectedDelivery: body.expectedDelivery || 'Pending',
            notes: body.notes || '',
            paymentMethod: body.paymentMethod || 'Credit Card',
            priority: body.priority || 'Medium',
            timeline: body.timeline || [
                { title: 'Order Created', time: new Date().toLocaleString(), done: true },
                { title: 'Assigned', time: 'Pending', done: false },
                { title: 'Resume Started', time: 'Pending', done: false },
                { title: 'Completed', time: 'Pending', done: false }
            ]
        };

        orders.unshift(newOrder);
        writeOrdersToFile(orders);
        
        return NextResponse.json({ success: true, order: newOrder });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        if (!body.id) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }
        
        const orders = readOrdersFromFile();
        const index = orders.findIndex((o: any) => o.id === body.id);
        
        if (index === -1) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        const updatedOrder = {
            ...orders[index],
            ...body
        };

        orders[index] = updatedOrder;
        writeOrdersToFile(orders);
        
        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }
        
        const orders = readOrdersFromFile();
        const filtered = orders.filter((o: any) => o.id !== id);
        writeOrdersToFile(filtered);
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
