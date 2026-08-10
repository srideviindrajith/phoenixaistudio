import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'prisma', 'resume_templates.json');

const INITIAL_TEMPLATES = [
    {
        id: 'tpl-modern-minimalist',
        name: 'Modern Minimalist',
        category: 'ATS',
        atsScore: 95,
        pricing: 'Free' as const,
        status: 'Active' as const,
        visibility: 'Public' as const,
        updated: '2026-07-12',
        desc: 'A clean, print-friendly template optimized for professional screening engines.',
        downloads: 1240,
        created: '2026-07-01',
        color: 'from-zinc-900 to-zinc-950',
        resumeService: 'ATS Resume',
        packages: ['Starter', 'Professional'],
        previewImage: null,
        sourceTemplate: '/templates/modern_minimalist.html',
        samplePdf: '/uploads/modern_minimalist_sample.pdf',
        features: ['ATS Optimized', 'Single Page Grid', 'Standard Fonts']
    },
    {
        id: 'tpl-aurora-glow',
        name: 'Aurora Glow',
        category: 'Designer',
        atsScore: 88,
        pricing: 'Premium' as const,
        status: 'Active' as const,
        visibility: 'Public' as const,
        updated: '2026-07-11',
        desc: 'Vibrant accent colors with modern sidebar layout for creatives.',
        downloads: 850,
        created: '2026-07-03',
        color: 'from-purple-900 to-zinc-950',
        resumeService: 'UI/UX Resume',
        packages: ['Professional', 'Enterprise'],
        previewImage: null,
        sourceTemplate: '/templates/aurora_glow.html',
        samplePdf: '/uploads/aurora_glow_sample.pdf',
        features: ['Modern Sidebar', 'Skill Meters', 'Vibrant Gradients']
    },
    {
        id: 'tpl-corporate-slate',
        name: 'Corporate Slate',
        category: 'Executive',
        atsScore: 92,
        pricing: 'Premium' as const,
        status: 'Active' as const,
        visibility: 'Public' as const,
        updated: '2026-07-10',
        desc: 'Classic dual column design tailored for senior leaders and managers.',
        downloads: 640,
        created: '2026-07-05',
        color: 'from-slate-900 to-zinc-950',
        resumeService: 'Executive Resume',
        packages: ['Enterprise'],
        previewImage: null,
        sourceTemplate: '/templates/corporate_slate.html',
        samplePdf: '/uploads/corporate_slate_sample.pdf',
        features: ['Dual Column Structure', 'Milestone Timeline', 'Executive Tone']
    }
];

function readTemplatesFromFile() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
            fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_TEMPLATES, null, 2), 'utf-8');
            return INITIAL_TEMPLATES;
        }
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading resume templates file:', e);
        return INITIAL_TEMPLATES;
    }
}

function writeTemplatesToFile(templates: any[]) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(templates, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error writing resume templates file:', e);
    }
}

export async function GET() {
    const templates = readTemplatesFromFile();
    return NextResponse.json({ success: true, templates });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const templates = readTemplatesFromFile();

        const newTemplate = {
            id: body.id || `TPL-RES-${Math.floor(1000 + Math.random() * 9000)}`,
            name: body.name || 'Custom Resume Template',
            category: body.category || 'Developer',
            atsScore: body.atsScore || 90,
            pricing: body.pricing || 'Free',
            status: body.status || 'Draft',
            visibility: body.visibility || 'Public',
            updated: new Date().toISOString().split('T')[0],
            desc: body.desc || 'Custom uploaded template.',
            downloads: 0,
            created: new Date().toISOString().split('T')[0],
            color: body.color || 'from-zinc-900 to-zinc-950',
            resumeService: body.resumeService || 'Software Developer Resume',
            packages: body.packages || ['Starter'],
            previewImage: body.previewImage || null,
            sourceTemplate: body.sourceTemplate || null,
            samplePdf: body.samplePdf || null,
            features: body.features || ['Custom Layout']
        };

        // Write to database table using Prisma
        try {
            await prisma.resumeTemplate.upsert({
                where: { id: newTemplate.id },
                update: {},
                create: { 
                    id: newTemplate.id, 
                    name: newTemplate.name, 
                    htmlContent: newTemplate.desc || '',
                    category: 'resume'
                } as any
            });
        } catch (dbErr) {
            console.error('Database update failed in resume templates:', dbErr);
        }

        templates.unshift(newTemplate);
        writeTemplatesToFile(templates);

        return NextResponse.json({ success: true, template: newTemplate });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
        }

        // Delete from database
        try {
            await prisma.resumeTemplate.delete({
                where: { id: id }
            });
        } catch (dbErr) {
            // Ignore if not in db
        }

        const templates = readTemplatesFromFile();
        const filtered = templates.filter((t: any) => t.id !== id);
        writeTemplatesToFile(filtered);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
