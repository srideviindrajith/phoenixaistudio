import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify server-side
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

const RequestSchema = z.object({
  formType: z.enum(['resume', 'portfolio', 'cover-letter']),
  aiPrompt: z.string().min(1).max(2000),
  selectedTheme: z.string().optional().default('modern'),
  sampleData: z.record(z.any()).optional(),
});

const GeminiOutputSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['resume', 'portfolio', 'cover-letter']),
  htmlContent: z.string().min(10),
  cssContent: z.string().default(''),
  theme: z.string().default('modern'),
  prompt: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().default({}),
});

function sanitizeCSS(css: string): string {
  if (!css) return '';
  let cleaned = css
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/<\/style>/gi, '')
    .replace(/<!--|-->/g, '');

  cleaned = cleaned.replace(/url\s*\(\s*['"]?\s*(javascript|vbscript|data:text\/html):[^'"]*['"]?\s*\)/gi, 'url("")');
  cleaned = cleaned
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/behavior\s*:[^;}]*/gi, '')
    .replace(/-moz-binding\s*:[^;}]*/gi, '');

  cleaned = cleaned.replace(/@import\s+url\((?!['"]?https:\/\/fonts\.googleapis\.com)[^)]+\);?/gi, '');

  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    // Diagnostic logging
    console.log('[CAREER BUILDER] AI Provider Configuration:', {
      provider: 'Gemini',
      envVar: 'GEMINI_API_KEY',
      exists: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length || 0,
    })

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Missing GEMINI_API_KEY' },
        { status: 500 }
      );
    }


    const body = await request.json();
    const parsedRequest = RequestSchema.parse(body);
    const { formType, aiPrompt, selectedTheme, sampleData } = parsedRequest;

    const systemPrompt = `You are an expert web designer & developer creating high quality career document templates (Resumes, Portfolios, Cover Letters).
    You MUST output valid JSON ONLY matching this exact structure:
    {
      "name": "Descriptive title for the template",
      "category": "${formType}",
      "htmlContent": "Full standalone HTML body content or document. Use semantic tags like <header>, <section>, <h1>, <h2>, <p>, <div>. Keep placeholder tokens like {{fullName}}, {{email}}, {{phone}}, {{location}}, {{summary}}, {{experience}}, {{skills}} or realistic content.",
      "cssContent": "Comprehensive, clean CSS styling matching the specified theme (${selectedTheme}). Include modern layout (flexbox/grid), typography, spacing, and visually appealing design.",
      "theme": "${selectedTheme}",
      "prompt": "${aiPrompt.replace(/"/g, '\\"')}",
      "tags": ["${formType}", "${selectedTheme}", "career-builder"],
      "metadata": {
        "version": "1.0",
        "generatedBy": "Gemini AI"
      }
    }
    
    User Requirements:
    - Document Type: ${formType}
    - Visual Theme: ${selectedTheme}
    - Prompt instruction: "${aiPrompt}"
    ${sampleData ? `- Reference Context: ${JSON.stringify(sampleData)}` : ''}

    Rules:
    - DO NOT include markdown backticks like \`\`\`json in your response. Return pure raw JSON string only.
    - Ensure HTML and CSS are valid, clean, and fully responsive.
    - Materially incorporate the user's prompt into the layout structure, styling, color palette, and section arrangement.`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });
    // No fallback needed; error handling below will capture any issues.


    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error status:', response.status);
      console.error('Gemini API error response body:', errorText);
      
      // Try to parse error as JSON for better diagnostics
      let errorDetails = '';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error?.message || errorJson.message || errorText;
      } catch {
        errorDetails = errorText;
      }
      
      return NextResponse.json(
        { 
          error: `Gemini API call failed with status ${response.status}`,
          geminiError: errorDetails,
          endpoint: endpoint.replace(/key=[^\u0026]+/, 'key=REDACTED')
        },
        { status: response.status >= 400 && response.status < 600 ? response.status : 500 }
      );
    }

    const geminiResult = await response.json();
    const rawText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: 'Gemini API returned an empty or unparseable response.' },
        { status: 502 }
      );
    }

    let parsedOutput: any;
    try {
      const cleanedJsonText = rawText.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsedOutput = JSON.parse(cleanedJsonText);
    } catch (e) {
      console.error('Failed to parse JSON from Gemini response:', e);
      return NextResponse.json(
        { error: 'Invalid non-JSON output returned by Gemini model.' },
        { status: 502 }
      );
    }

    const validatedOutput = GeminiOutputSchema.parse(parsedOutput);

    // Sanitize HTML and CSS
    const sanitizedHtml = purify.sanitize(validatedOutput.htmlContent);
    const sanitizedCss = sanitizeCSS(validatedOutput.cssContent);

    const template = {
      id: `generated-${Date.now()}`,
      name: validatedOutput.name || `${formType.charAt(0).toUpperCase() + formType.slice(1)} Template`,
      category: validatedOutput.category,
      htmlContent: sanitizedHtml,
      cssContent: sanitizedCss,
      theme: validatedOutput.theme,
      prompt: aiPrompt,
      tags: validatedOutput.tags,
      metadata: validatedOutput.metadata,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request or model output format validation failed.', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Career builder generation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during template generation.' },
      { status: 500 }
    );
  }
}
