import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all ATS analyses or specific review by reviewId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('reviewId');

  try {
    if (reviewId) {
      // Fetch specific review with all related data
      const review = await prisma.atsReview.findUnique({
        where: { reviewId },
        include: {
          scores: true,
          keywords: true,
          diagnostics: true,
          timeline: true,
          notes: true,
          suggestions: true,
          versions: true,
          activityLogs: true,
          workflowSteps: true,
          sectionInspectors: true,
          formattingIssues: true,
          grammarIssues: true,
        },
      });

      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json(review);
    } else {
      // Fetch all reviews
      const reviews = await prisma.atsReview.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          scores: true,
          keywords: true,
          diagnostics: true,
          timeline: true,
          notes: true,
          suggestions: true,
          versions: true,
          activityLogs: true,
          workflowSteps: true,
          sectionInspectors: true,
          formattingIssues: true,
          grammarIssues: true,
        },
      });

      return NextResponse.json(reviews);
    }
  } catch (error) {
    console.error('Error fetching ATS review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

// POST - Create new ATS analysis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      filename,
      candidate,
      overallScore,
      keywordMatch,
      grammar,
      formatting,
      readability,
      actionVerbs,
      industryMatch,
      recruiterScore,
      confidenceScore,
      missingKeywords = [],
      matchedKeywords = [],
      weakKeywords = [],
      industryKeywords = [],
      suggestions = [],
      formattingIssues = [],
      grammarIssues = [],
      diagnostics = [],
      sectionInspectors = [],
      versions = [],
      timeline = [],
      activityLogs = [],
      workflowSteps = []
    } = body;

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    const reviewId = `ATS-${Date.now()}`;
    const candidateName = candidate || filename.split('.')[0].replace(/[_-]/g, ' ');

    // Create main review
    const review = await prisma.atsReview.create({
      data: {
        reviewId,
        candidate: candidateName,
        assignedReviewer: 'Alex Chen',
        status: 'In Review',
        priority: 'High',
        reviewDate: new Date().toISOString().split('T')[0],
        scores: {
          create: [
            { metric: 'overall', value: overallScore || 75, trend: 'up', explanation: 'Overall ATS score combines all metrics into a comprehensive rating.', calculation: 'Weighted average of keyword, formatting, readability, industry, and recruiter scores.', progress: overallScore || 75, aiRecommendation: 'Optimize keyword density and formatting to reach 90%+', problems: 'Missing required keywords, layout inconsistencies', suggestions: 'Add missing keywords, standardize margins' },
            { metric: 'keyword', value: keywordMatch || 70, trend: 'up', explanation: 'Keyword match score measures alignment with job description requirements.', calculation: 'Matched keywords / Total required keywords × 100', progress: keywordMatch || 70, aiRecommendation: 'Integrate more required industry terms', problems: 'Missing core skills keywords', suggestions: 'Add missing technical skills' },
            { metric: 'formatting', value: formatting || 80, trend: 'up', explanation: 'Formatting score evaluates ATS compatibility and document structure.', calculation: 'Evaluates margin spacing, font sizes, heading styles, and visual hierarchy.', progress: formatting || 80, aiRecommendation: 'Align layout to single page template', problems: 'Inconsistent page margins', suggestions: 'Standardize to 1-inch margins' },
            { metric: 'readability', value: readability || 75, trend: 'stable', explanation: 'Readability score assesses ease of scanning.', calculation: 'Flesch-Kincaid readability index + grammatical complexity', progress: readability || 75, aiRecommendation: 'Simplify sentence structures', problems: 'Long passive sentences', suggestions: 'Convert to active verbs' },
            { metric: 'sections', value: 85, trend: 'stable', explanation: 'Completeness check of standard resume sections.', calculation: 'Presence of Summary, Experience, Skills, Education.', progress: 85, aiRecommendation: 'Add certifications and achievements', problems: 'Empty sections detected', suggestions: 'Fill out certifications' },
            { metric: 'industry', value: industryMatch || 70, trend: 'up', explanation: 'Evaluates alignment with the target industry.', calculation: 'Target industry keyword frequency and experience years.', progress: industryMatch || 70, aiRecommendation: 'Mention specialized industry standards', problems: 'Lacks industry focus', suggestions: 'Mention industry-specific tools' },
            { metric: 'recruiter', value: recruiterScore || 72, trend: 'up', explanation: 'Simulated score indicating recruiter scanning appeal.', calculation: 'Predictive engagement based on formatting readability and summary impact.', progress: recruiterScore || 72, aiRecommendation: 'Strengthen professional summary', problems: 'Passive summary statements', suggestions: 'Add metrics to summary' },
            { metric: 'confidence', value: confidenceScore || 90, trend: 'stable', explanation: 'AI engine confidence rating of the review data.', calculation: 'Information density + model classification confidence.', progress: confidenceScore || 90, aiRecommendation: 'Data verified and highly reliable', problems: '', suggestions: 'None' }
          ]
        },
        keywords: {
          create: [
            ...matchedKeywords.map((kw: any) => ({ word: typeof kw === 'string' ? kw : kw.word, category: 'matched', importance: kw.importance || 'medium', suggestion: kw.suggestion || '' })),
            ...missingKeywords.map((kw: any) => ({ word: typeof kw === 'string' ? kw : kw.word, category: 'missing', importance: kw.importance || 'high', suggestion: kw.suggestion || `Add to resume` })),
            ...weakKeywords.map((kw: any) => ({ word: typeof kw === 'string' ? kw : kw.word, category: 'weak', importance: kw.importance || 'low', suggestion: kw.suggestion || `Replace term` })),
            ...industryKeywords.map((kw: any) => ({ word: typeof kw === 'string' ? kw : kw.word, category: 'industry', importance: kw.importance || 'medium', suggestion: kw.suggestion || '' }))
          ]
        },
        suggestions: {
          create: suggestions.map((s: any, idx: number) => ({
            priority: s.priority || (idx === 0 ? 'critical' : 'high'),
            title: s.title || `Action item ${idx + 1}`,
            description: s.description || s,
            estimatedGain: s.estimatedGain || 8,
            difficulty: s.difficulty || 'medium',
            impact: s.impact || 'high',
            status: 'pending'
          }))
        },
        formattingIssues: {
          create: formattingIssues.map((issue: any) => ({
            type: issue.type || 'Layout',
            severity: issue.severity || 'medium',
            description: issue.description || issue,
            location: issue.location || 'Document',
          }))
        },
        grammarIssues: {
          create: grammarIssues.map((issue: any) => ({
            type: issue.type || 'Syntax',
            text: issue.text || issue,
            suggestion: issue.suggestion || 'Rephrase',
            aiRecommendation: issue.aiRecommendation || 'Use active action verbs',
          }))
        },
        diagnostics: {
          create: diagnostics.length > 0 ? diagnostics.map((d: any) => ({
            type: d.type || 'keyword',
            severity: d.severity || 'medium',
            title: d.title,
            description: d.description,
            suggestion: d.suggestion,
            expanded: d.expanded || false
          })) : [
            { type: 'keyword', severity: 'critical', title: 'Missing Industry Keywords', description: 'Core technical requirements not found.', suggestion: 'Incorporate missing skills keywords.' },
            { type: 'formatting', severity: 'high', title: 'Margins Standard', description: 'Inconsistent page boundary alignments.', suggestion: 'Standardize to 1-inch margins.' }
          ]
        },
        timeline: {
          create: timeline.length > 0 ? timeline.map((t: any) => ({
            type: t.type || 'created',
            description: t.description,
            timestamp: t.timestamp || new Date().toLocaleString(),
            user: t.user || 'System'
          })) : [
            { type: 'created', description: 'Review workflow initialized', timestamp: new Date().toLocaleString(), user: 'System' },
            { type: 'uploaded', description: `Resume uploaded: ${filename}`, timestamp: new Date().toLocaleString(), user: 'Alex Chen' },
            { type: 'analyzed', description: 'ATS analysis completed', timestamp: new Date().toLocaleString(), user: 'System' }
          ]
        },
        activityLogs: {
          create: activityLogs.length > 0 ? activityLogs.map((a: any) => ({
            type: a.type || 'created',
            description: a.description,
            timestamp: a.timestamp || new Date().toLocaleString(),
            user: a.user || 'System'
          })) : [
            { type: 'created', description: `Review workflow initialized for ${candidateName}`, timestamp: new Date().toLocaleString(), user: 'System' },
            { type: 'uploaded', description: `Resume uploaded: ${filename}`, timestamp: new Date().toLocaleString(), user: 'Alex Chen' },
            { type: 'analyzed', description: `Initial ATS scan completed - Score: ${overallScore || 75}%`, timestamp: new Date().toLocaleString(), user: 'System' }
          ]
        },
        workflowSteps: {
          create: workflowSteps.length > 0 ? workflowSteps.map((w: any) => ({
            stepId: w.stepId,
            label: w.label,
            status: w.status,
            user: w.user || 'System',
            time: w.time || new Date().toLocaleString(),
            details: w.details || ''
          })) : [
            { stepId: '1', label: 'Upload', status: 'completed', user: 'Alex Chen', time: new Date().toLocaleString(), details: `${filename} uploaded successfully.` },
            { stepId: '2', label: 'Parsing', status: 'completed', user: 'Parser API', time: new Date().toLocaleString(), details: 'Document parsed successfully.' },
            { stepId: '3', label: 'ATS Scan', status: 'completed', user: 'ATS Engine', time: new Date().toLocaleString(), details: `Scan complete. Baseline score: ${overallScore || 75}%` },
            { stepId: '4', label: 'AI Review', status: 'completed', user: 'Phoenix AI', time: new Date().toLocaleString(), details: 'AI suggestions generated.' },
            { stepId: '5', label: 'Optimization', status: 'pending', user: 'Alex Chen', time: 'Pending', details: 'Applying optimizations.' },
            { stepId: '6', label: 'Final Review', status: 'pending', user: 'Lead Reviewer', time: 'Pending', details: 'Awaiting supervisor approval.' },
            { stepId: '7', label: 'Client Delivery', status: 'pending', user: 'Delivery API', time: 'Pending', details: 'Pending report share.' }
          ]
        },
        sectionInspectors: {
          create: sectionInspectors.length > 0 ? sectionInspectors.map((s: any) => ({
            name: s.name,
            content: s.content,
            score: s.score || 80,
            issues: s.issues || 0,
            expanded: s.expanded || false
          })) : [
            { name: 'Summary', content: `Senior Specialist with expertise matching target requirements...`, score: 85, issues: 1 },
            { name: 'Experience', content: `Professional positions containing related technical achievements...`, score: 78, issues: 2 },
            { name: 'Education', content: `B.S. in Software Engineering / Computer Science`, score: 100, issues: 0 },
            { name: 'Skills', content: `Next.js, React, Tailwind, TypeScript, REST API, Node.js`, score: 88, issues: 1 }
          ]
        },
        versions: {
          create: versions.length > 0 ? versions.map((v: any) => ({
            date: v.date || new Date().toISOString().split('T')[0],
            resume: v.resume || filename,
            score: v.score || overallScore || 75,
            status: v.status || 'Warning',
            staff: v.staff || 'Alex Chen'
          })) : [
            { date: new Date().toISOString().split('T')[0], resume: filename, score: overallScore || 75, status: 'Warning', staff: 'Alex Chen' }
          ]
        }
      },
      include: {
        scores: true,
        keywords: true,
        diagnostics: true,
        timeline: true,
        notes: true,
        suggestions: true,
        versions: true,
        activityLogs: true,
        workflowSteps: true,
        sectionInspectors: true,
        formattingIssues: true,
        grammarIssues: true,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating ATS analysis:', error);
    return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 });
  }
}

// PUT - Update ATS Review metadata, status, add notes, or suggestions
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, status, priority, note, suggestionId, suggestionStatus, action } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    // Handle Note Addition
    if (note) {
      const parentReview = await prisma.atsReview.findUnique({ where: { reviewId } });
      if (!parentReview) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      const addedNote = await prisma.atsNote.create({
        data: {
          reviewId: parentReview.id,
          type: note.type || 'internal',
          content: note.content,
          author: note.author || 'Alex Chen',
          timestamp: new Date().toLocaleString(),
        }
      });
      return NextResponse.json({ success: true, note: addedNote });
    }

    // Handle Note Delete or Edit in PUT
    if (action === 'deleteNote') {
      const { noteId } = body;
      await prisma.atsNote.delete({
        where: { id: noteId }
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'editNote') {
      const { noteId, content } = body;
      const updatedNote = await prisma.atsNote.update({
        where: { id: noteId },
        data: {
          content,
        }
      });
      return NextResponse.json({ success: true, note: updatedNote });
    }

    // Handle Suggestion Status update
    if (suggestionId && suggestionStatus) {
      const updatedSuggestion = await prisma.atsSuggestion.update({
        where: { id: suggestionId },
        data: { status: suggestionStatus }
      });
      return NextResponse.json({ success: true, suggestion: updatedSuggestion });
    }

    // Handle regular update of status or priority
    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (priority) dataToUpdate.priority = priority;

    const updatedReview = await prisma.atsReview.update({
      where: { reviewId },
      data: dataToUpdate,
    });

    // Create a timeline / log event
    const internalId = updatedReview.id;
    if (status) {
      await prisma.atsTimeline.create({
        data: {
          reviewId: internalId,
          type: status.toLowerCase(),
          description: `Review status updated to ${status}`,
          timestamp: new Date().toLocaleString(),
          user: 'Alex Chen'
        }
      });
      await prisma.atsActivityLog.create({
        data: {
          reviewId: internalId,
          type: status.toLowerCase(),
          description: `Resume status updated to ${status}`,
          timestamp: new Date().toLocaleString(),
          user: 'Alex Chen'
        }
      });
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating ATS review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE - Remove ATS analysis
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('reviewId');

  if (!reviewId) {
    return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
  }

  try {
    await prisma.atsReview.delete({
      where: { reviewId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ATS review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
