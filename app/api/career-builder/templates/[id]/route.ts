import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const IdParamSchema = z.object({
  id: z.string().min(1).max(255),
});

const SingleTemplateQuerySchema = z.object({
  category: z.enum(['resume', 'portfolio', 'cover-letter']).default('resume'),
});

const UpdateTemplateSchema = z.object({
  category: z.enum(['resume', 'portfolio', 'cover-letter']),
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['draft', 'published', 'archived', 'deleted']).optional(),
  theme: z.string().max(255).optional(),
  prompt: z.string().max(10000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.any()).optional(),
  version: z.string().max(20).optional(),
});

// GET single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = IdParamSchema.parse(params);
    const { searchParams } = new URL(request.url);
    const { category } = SingleTemplateQuerySchema.parse({ category: searchParams.get('category') || 'resume' });

    let template;

    if (category === 'resume') {
      template = await prisma.resumeTemplate.findUnique({ where: { id } });
    } else if (category === 'portfolio') {
      template = await prisma.portfolioTemplate.findUnique({ where: { id } });
    } else if (category === 'cover-letter') {
      template = await prisma.coverLetterTemplate.findUnique({ where: { id } });
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template: { ...template, category } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

// PATCH update template (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = IdParamSchema.parse(params);
    const body = await request.json();
    const validatedData = UpdateTemplateSchema.parse(body);
    const { category, name, status, theme, prompt, tags, metadata, version } = validatedData;

    let template;

    if (category === 'resume') {
      template = await prisma.resumeTemplate.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status && { status }),
          ...(version && { version }),
          ...(theme !== undefined && { theme }),
          ...(prompt !== undefined && { prompt }),
          ...(tags !== undefined && { tags }),
          ...(metadata !== undefined && { metadata }),
          updatedAt: new Date()
        },
      } as any);
    } else if (category === 'portfolio') {
      template = await prisma.portfolioTemplate.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status && { status }),
          ...(version && { version }),
          ...(theme !== undefined && { theme }),
          ...(prompt !== undefined && { prompt }),
          ...(tags !== undefined && { tags }),
          ...(metadata !== undefined && { metadata }),
          updatedAt: new Date()
        },
      } as any);
    } else if (category === 'cover-letter') {
      template = await prisma.coverLetterTemplate.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status && { status }),
          ...(version && { version }),
          ...(theme !== undefined && { theme }),
          ...(prompt !== undefined && { prompt }),
          ...(tags !== undefined && { tags }),
          ...(metadata !== undefined && { metadata }),
          updatedAt: new Date()
        },
      } as any);
    }

    return NextResponse.json({ template: { ...template, category } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body or parameters', details: error.errors }, { status: 400 });
    }
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

// DELETE template (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = IdParamSchema.parse(params);
    const { searchParams } = new URL(request.url);
    const { category } = SingleTemplateQuerySchema.parse({ category: searchParams.get('category') || 'resume' });

    // Soft delete by setting status to 'archived'
    if (category === 'resume') {
      await prisma.resumeTemplate.update({
        where: { id },
        data: { status: 'archived', updatedAt: new Date() }
      } as any);
    } else if (category === 'portfolio') {
      await prisma.portfolioTemplate.update({
        where: { id },
        data: { status: 'archived', updatedAt: new Date() }
      } as any);
    } else if (category === 'cover-letter') {
      await prisma.coverLetterTemplate.update({
        where: { id },
        data: { status: 'archived', updatedAt: new Date() }
      } as any);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
