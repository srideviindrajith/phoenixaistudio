import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'prisma', 'cover_letter_templates.json');

const INITIAL_TEMPLATES = [
    {
        id: 'tpl-classic-corporate',
        name: 'Classic Corporate',
        industry: 'Finance',
        theme: 'Corporate Slate',
        templateType: 'Classic',
        experienceLevel: 'Mid-Senior',
        language: 'English',
        status: 'Active',
        visibility: 'Public',
        featured: true,
        premium: false,
        desc: 'A traditional, elegant cover letter template designed for banking, consulting, and corporate roles.',
        previewImage: null,
        sourceTemplate: '/templates/classic_corporate.html',
        samplePdf: '/uploads/classic_corporate_sample.pdf',
        sampleDocx: '/uploads/classic_corporate_sample.docx',
        sampleHtml: '/templates/classic_corporate.html',
        sampleJson: '/uploads/classic_corporate.json',
        atsFriendly: true,
        created: '2026-07-01',
        updated: '2026-07-15'
    },
    {
        id: 'tpl-creative-horizon',
        name: 'Creative Horizon',
        industry: 'Creative',
        theme: 'Aurora Glow',
        templateType: 'Modern',
        experienceLevel: 'Senior',
        language: 'English',
        status: 'Active',
        visibility: 'Public',
        featured: true,
        premium: true,
        desc: 'Vibrant accent colors with a modern structure, ideal for advertising, digital design, and arts roles.',
        previewImage: null,
        sourceTemplate: '/templates/creative_horizon.html',
        samplePdf: '/uploads/creative_horizon_sample.pdf',
        sampleDocx: '/uploads/creative_horizon_sample.docx',
        sampleHtml: '/templates/creative_horizon.html',
        sampleJson: '/uploads/creative_horizon.json',
        atsFriendly: false,
        created: '2026-07-03',
        updated: '2026-07-16'
    },
    {
        id: 'tpl-technical-edge',
        name: 'Technical Edge',
        industry: 'Technology',
        theme: 'Glassmorphic Grid',
        templateType: 'ATS Friendly',
        experienceLevel: 'Entry-Level',
        language: 'English',
        status: 'Active',
        visibility: 'Public',
        featured: false,
        premium: true,
        desc: 'Highly structured and optimized cover letter layout for scanning engines in the tech and software industries.',
        previewImage: null,
        sourceTemplate: '/templates/technical_edge.html',
        samplePdf: '/uploads/technical_edge_sample.pdf',
        sampleDocx: '/uploads/technical_edge_sample.docx',
        sampleHtml: '/templates/technical_edge.html',
        sampleJson: '/uploads/technical_edge.json',
        atsFriendly: true,
        created: '2026-07-05',
        updated: '2026-07-17'
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
        console.error('Error reading cover letter templates file:', e);
        return INITIAL_TEMPLATES;
    }
}

function writeTemplatesToFile(templates: any[]) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(templates, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error writing cover letter templates file:', e);
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

        const id = body.id || `TPL-CL-${Math.floor(1000 + Math.random() * 9000)}`;

        const updatedTemplate = {
            id,
            name: body.name || 'Custom Cover Letter Template',
            industry: body.industry || 'Technology',
            theme: body.theme || 'Modern Minimalist',
            templateType: body.templateType || 'Modern',
            experienceLevel: body.experienceLevel || 'Entry-Level',
            language: body.language || 'English',
            status: body.status || 'Draft',
            visibility: body.visibility || 'Public',
            featured: body.featured ?? false,
            premium: body.premium ?? false,
            desc: body.desc || 'Custom cover letter template.',
            previewImage: body.previewImage || null,
            sourceTemplate: body.sourceTemplate || null,
            samplePdf: body.samplePdf || null,
            sampleDocx: body.sampleDocx || null,
            sampleHtml: body.sampleHtml || null,
            sampleJson: body.sampleJson || null,
            atsFriendly: body.atsFriendly ?? true,
            created: body.created || new Date().toISOString().split('T')[0],
            updated: new Date().toISOString().split('T')[0]
        };

        // Write to database table using Prisma (handles upsert)
        try {
            await prisma.coverLetterTemplate.upsert({
                where: { id: updatedTemplate.id },
                update: {},
                create: { 
                    id: updatedTemplate.id, 
                    name: updatedTemplate.name, 
                    htmlContent: updatedTemplate.desc || '',
                    category: 'cover-letter'
                } as any
            });
        } catch (dbErr) {
            console.error('Database update failed in cover letter templates:', dbErr);
        }

        const existingIndex = templates.findIndex((t: any) => t.id === id);
        if (existingIndex !== -1) {
            // Update
            templates[existingIndex] = {
                ...templates[existingIndex],
                ...updatedTemplate
            };
        } else {
            // Create
            templates.unshift(updatedTemplate);
        }
        
        writeTemplatesToFile(templates);

        return NextResponse.json({ success: true, template: updatedTemplate });
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
            await prisma.coverLetterTemplate.delete({
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
