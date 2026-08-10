import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { z } from 'zod';

// Set up DOMPurify for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Validation schemas
const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['resume', 'portfolio', 'cover-letter']),
  htmlContent: z.string().min(1).max(50000), // Max 50KB HTML
  cssContent: z.string().max(20000).optional(), // Max 20KB CSS
  thumbnail: z.string().max(1000000).optional(), // Max 1MB thumbnail (base64)
  status: z.enum(['draft', 'published', 'archived', 'deleted']).optional(),
  theme: z.string().max(255).optional(),
  prompt: z.string().max(10000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(), // Max 20 tags, 50 chars each
  metadata: z.record(z.any()).optional(),
  version: z.string().max(20).optional(),
});

const GetTemplatesQuerySchema = z.object({
  category: z.enum(['all', 'resume', 'portfolio', 'cover-letter']).optional().default('all'),
});

// GET all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = GetTemplatesQuerySchema.parse({ category: searchParams.get('category') || 'all' });
    const { category } = query;

    let templates;

    if (category === 'all') {
      const [resumeTemplates, portfolioTemplates, coverLetterTemplates] = await Promise.all([
        prisma.resumeTemplate.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.portfolioTemplate.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.coverLetterTemplate.findMany({ orderBy: { createdAt: 'desc' } }),
      ]);

      templates = [
        ...resumeTemplates.map(t => ({ ...t, category: 'resume' })),
        ...portfolioTemplates.map(t => ({ ...t, category: 'portfolio' })),
        ...coverLetterTemplates.map(t => ({ ...t, category: 'cover-letter' })),
      ];
    } else if (category === 'resume') {
      templates = await prisma.resumeTemplate.findMany({ orderBy: { createdAt: 'desc' } });
      templates = templates.map(t => ({ ...t, category: 'resume' }));
    } else if (category === 'portfolio') {
      templates = await prisma.portfolioTemplate.findMany({ orderBy: { createdAt: 'desc' } });
      templates = templates.map(t => ({ ...t, category: 'portfolio' }));
    } else if (category === 'cover-letter') {
      templates = await prisma.coverLetterTemplate.findMany({ orderBy: { createdAt: 'desc' } });
      templates = templates.map(t => ({ ...t, category: 'cover-letter' }));
    }

    return NextResponse.json({ templates });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateTemplateSchema.parse(body);
    const { name, category, htmlContent, cssContent, thumbnail, status, theme, prompt, tags, metadata, version } = validatedData;

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedHtml = purify.sanitize(htmlContent);

    let template;

    if (category === 'resume') {
      template = await prisma.resumeTemplate.create({
        data: {
          name,
          category,
          htmlContent: sanitizedHtml,
          cssContent,
          thumbnail,
          status: status || 'draft',
          version: version || '1.0',
          ...(theme !== undefined && { theme }),
          ...(prompt !== undefined && { prompt }),
          ...(tags !== undefined && { tags }),
          ...(metadata !== undefined && { metadata })
        },
      } as any);
    } else if (category === 'portfolio') {
      template = await prisma.portfolioTemplate.create({
        data: {
          name,
          category,
          htmlContent: sanitizedHtml,
          cssContent,
          thumbnail,
          status: status || 'draft',
          version: version || '1.0',
          ...(theme !== undefined && { theme }),
          ...(prompt !== undefined && { prompt }),
          ...(tags !== undefined && { tags }),
          ...(metadata !== undefined && { metadata })
        },
      } as any);
    } else if (category === 'cover-letter') {
      template = await prisma.coverLetterTemplate.create({
        data: {
          name,
          category,
          htmlContent: sanitizedHtml,
          cssContent,
          thumbnail,
          status: status || 'draft',
          version: version || '1.0',
          ...(theme !== undefined && { theme }),
          ...(prompt !== undefined && { prompt }),
          ...(tags !== undefined && { tags }),
          ...(metadata !== undefined && { metadata })
        },
      } as any);
    }

    return NextResponse.json({ template: { ...template, category } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
