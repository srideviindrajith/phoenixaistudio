import { PrismaClient } from './generated-client-v2';

const prisma = new PrismaClient();

async function seedATS() {
  console.log('Seeding ATS data...');

  // Create ATS Review
  const review = await prisma.atsReview.create({
    data: {
      reviewId: 'REV-2026-0712-001',
      candidate: 'Sarah Jenkins',
      assignedReviewer: 'Alex Chen',
      status: 'In Review',
      priority: 'High',
      reviewDate: '2026-07-12',
      scores: {
        create: [
          { metric: 'overall', value: 92, trend: 'up', explanation: 'Overall ATS score combines all metrics into a comprehensive rating.', calculation: 'Weighted average: Keyword Match (25%) + Formatting (20%) + Readability (15%) + Sections (15%) + Industry Match (15%) + Recruiter Score (10%)', problems: 'Missing modern keywords, Limited quantified achievements', suggestions: 'Add Turbopack to skills, Quantify 3 more achievements', progress: 92, aiRecommendation: 'Focus on adding missing technical keywords and quantifying achievements to reach 95%+' },
          { metric: 'keyword', value: 88, trend: 'up', explanation: 'Keyword match score measures alignment with job description requirements.', calculation: 'Matched keywords / Total required keywords × 100', problems: 'Missing Turbopack, Missing Micro-Frontend, Missing Server Components', suggestions: 'Add Turbopack to skills section, Include Micro-Frontend in experience, Mention Server Components in projects', progress: 88, aiRecommendation: 'Add the 3 missing high-importance keywords to improve score by 8%' },
          { metric: 'formatting', value: 96, trend: 'up', explanation: 'Formatting score evaluates ATS compatibility and document structure.', calculation: 'Based on margin consistency, font size, header hierarchy, and bullet style', problems: 'Margin inconsistency, Font size below 10pt', suggestions: 'Standardize to 1-inch margins, Increase font size to 11pt+', progress: 96, aiRecommendation: 'Minor formatting fixes will bring this to 100%' },
          { metric: 'readability', value: 85, trend: 'up', explanation: 'Readability score assesses how easily recruiters can scan the resume.', calculation: 'Flesch Reading Ease + sentence structure analysis', problems: 'Some long sentences, Passive voice usage', suggestions: 'Break long sentences, Convert to active voice', progress: 85, aiRecommendation: 'Improve sentence structure for better readability' },
          { metric: 'sections', value: 100, trend: 'neutral', explanation: 'Sections score checks for all required resume components.', calculation: 'Presence of required sections × completeness weight', problems: 'Certificates section incomplete', suggestions: 'Add relevant certifications', progress: 100, aiRecommendation: 'Complete certificates section for perfect score' },
          { metric: 'industry', value: 90, trend: 'up', explanation: 'Industry match score evaluates alignment with target industry.', calculation: 'Industry-specific keywords + relevant experience', problems: 'Limited AI/ML keywords', suggestions: 'Add AI Integration experience, Include Vector Database projects', progress: 90, aiRecommendation: 'Add more AI/ML related keywords and experience' },
          { metric: 'recruiter', value: 87, trend: 'up', explanation: 'Recruiter score predicts initial recruiter engagement.', calculation: 'Based on layout, visual hierarchy, and key information placement', problems: 'Summary could be more impactful', suggestions: 'Add quantified results to summary', progress: 87, aiRecommendation: 'Strengthen summary with specific achievements' },
          { metric: 'confidence', value: 94, trend: 'up', explanation: 'AI confidence score indicates reliability of analysis.', calculation: 'Data quality + pattern recognition confidence', problems: '', suggestions: 'No issues detected', progress: 94, aiRecommendation: 'Analysis is highly reliable' }
        ]
      },
      keywords: {
        create: [
          { word: 'React', category: 'matched', importance: 'high' },
          { word: 'TypeScript', category: 'matched', importance: 'high' },
          { word: 'Next.js', category: 'matched', importance: 'high' },
          { word: 'TailwindCSS', category: 'matched', importance: 'medium' },
          { word: 'GraphQL', category: 'matched', importance: 'medium' },
          { word: 'REST APIs', category: 'matched', importance: 'medium' },
          { word: 'State Management', category: 'matched', importance: 'medium' },
          { word: 'Turbopack', category: 'missing', importance: 'high', suggestion: 'Add to skills section' },
          { word: 'Micro-Frontend', category: 'missing', importance: 'high', suggestion: 'Include in experience' },
          { word: 'WebAssembly', category: 'missing', importance: 'medium', suggestion: 'Mention in projects' },
          { word: 'Server Components', category: 'missing', importance: 'high', suggestion: 'Add Next.js server components experience' },
          { word: 'CSS', category: 'weak', importance: 'low', suggestion: 'Specify modern CSS frameworks' },
          { word: 'HTML', category: 'weak', importance: 'low', suggestion: 'Add semantic HTML expertise' },
          { word: 'Machine Learning', category: 'industry', importance: 'high' },
          { word: 'AI Integration', category: 'industry', importance: 'high' },
          { word: 'NLP', category: 'industry', importance: 'medium' },
          { word: 'Vector Databases', category: 'industry', importance: 'medium' },
          { word: 'Model Deployment', category: 'industry', importance: 'high' }
        ]
      },
      diagnostics: {
        create: [
          { type: 'keyword', severity: 'critical', title: 'Missing Turbopack', description: 'Turbopack is a key technology for the target role', suggestion: 'Add Turbopack to skills section' },
          { type: 'bullet', severity: 'high', title: 'Weak Bullet Points', description: 'Some bullet points lack quantifiable achievements', suggestion: 'Add metrics and results to bullets' },
          { type: 'grammar', severity: 'medium', title: 'Passive Voice Usage', description: 'Found 3 instances of passive voice', suggestion: 'Convert to active voice' },
          { type: 'formatting', severity: 'critical', title: 'Margin Inconsistency', description: 'Margins are not consistent throughout', suggestion: 'Standardize to 1-inch margins' },
          { type: 'passive', severity: 'medium', title: 'Passive Voice in Summary', description: 'Summary uses passive voice', suggestion: 'Rewrite with active voice' },
          { type: 'length', severity: 'minor', title: 'Summary Length', description: 'Summary is slightly long', suggestion: 'Condense to 3-4 lines' },
          { type: 'achievement', severity: 'high', title: 'Low Achievement Score', description: 'Achievement score is 65%', suggestion: 'Add more quantified results' },
          { type: 'section', severity: 'medium', title: 'Certificates Section', description: 'Certificates section is incomplete', suggestion: 'Add relevant certifications' }
        ]
      },
      timeline: {
        create: [
          { type: 'created', description: 'Review created', timestamp: '2026-07-12 09:00', user: 'System' },
          { type: 'uploaded', description: 'Resume uploaded: Sarah_Jenkins_CV_Frontend_v2.4.pdf', timestamp: '2026-07-12 09:05', user: 'Alex Chen' },
          { type: 'analyzed', description: 'ATS analysis completed', timestamp: '2026-07-12 09:10', user: 'System' },
          { type: 'modified', description: 'Resume updated to v2.4', timestamp: '2026-07-12 10:00', user: 'Alex Chen' },
          { type: 'analyzed', description: 'Re-analysis completed', timestamp: '2026-07-12 10:05', user: 'System' }
        ]
      },
      notes: {
        create: [
          { type: 'internal', content: 'Candidate demonstrates strong React/TypeScript foundation. Recommend adding Server Components experience for AI platform alignment.', author: 'Alex Chen', timestamp: '2026-07-12 10:30' },
          { type: 'client', content: 'TechCorp hiring manager approved the technical direction. Focus on vector database integration examples.', author: 'TechCorp HR', timestamp: '2026-07-12 11:15' },
          { type: 'reviewer', content: 'Margin corrections applied. Ready for final quality audit.', author: 'Alex Chen', timestamp: '2026-07-12 11:45' }
        ]
      },
      suggestions: {
        create: [
          { priority: 'critical', title: 'Add Turbopack to Skills', description: 'Turbopack is a key technology for the target AI platform role', estimatedGain: 8, difficulty: 'easy', impact: 'high' },
          { priority: 'critical', title: 'Add Server Components', description: 'Next.js Server Components experience required for modern architecture', estimatedGain: 10, difficulty: 'medium', impact: 'high' },
          { priority: 'high', title: 'Quantify Achievements', description: 'Add specific metrics to experience bullets (conversion rates, load times)', estimatedGain: 12, difficulty: 'medium', impact: 'high' },
          { priority: 'high', title: 'Fix Margins', description: 'Standardize margins throughout document to 1-inch', estimatedGain: 5, difficulty: 'easy', impact: 'medium' },
          { priority: 'medium', title: 'Add Vector DB Experience', description: 'Include PineDB or Weaviate projects for AI platform alignment', estimatedGain: 7, difficulty: 'medium', impact: 'high' },
          { priority: 'medium', title: 'Improve Summary', description: 'Make summary more impactful with quantified results', estimatedGain: 6, difficulty: 'medium', impact: 'medium' }
        ]
      },
      versions: {
        create: [
          { date: '2026-07-11', resume: 'Sarah_Jenkins_CV_Frontend_v2.4.pdf', score: 92, status: 'Optimized', staff: 'Alex Chen' },
          { date: '2026-07-10', resume: 'Sarah_Jenkins_CV_Frontend_v2.3.pdf', score: 78, status: 'Warning', staff: 'Alex Chen' },
          { date: '2026-07-09', resume: 'Sarah_Jenkins_CV_Frontend_v2.2.pdf', score: 71, status: 'Warning', staff: 'Alex Chen' },
          { date: '2026-07-08', resume: 'Sarah_Jenkins_Draft_CS_v1.0.pdf', score: 61, status: 'Critical', staff: 'Alex Chen' }
        ]
      },
      activityLogs: {
        create: [
          { type: 'created', description: 'Review workflow initialized for Sarah Jenkins', timestamp: '2026-07-12 09:00', user: 'System' },
          { type: 'uploaded', description: 'Resume uploaded: Sarah_Jenkins_CV_Frontend_v2.4.pdf', timestamp: '2026-07-12 09:05', user: 'Alex Chen' },
          { type: 'analyzed', description: 'Initial ATS scan completed - Baseline: 61%', timestamp: '2026-07-12 09:10', user: 'System' },
          { type: 'modified', description: 'Applied AI optimization suggestions', timestamp: '2026-07-12 10:00', user: 'Alex Chen' },
          { type: 'analyzed', description: 'Re-analysis completed - Current: 92%', timestamp: '2026-07-12 10:05', user: 'System' },
          { type: 'approved', description: 'Client approved draft for delivery', timestamp: '2026-07-12 11:30', user: 'TechCorp Inc' }
        ]
      },
      workflowSteps: {
        create: [
          { stepId: '1', label: 'Upload', status: 'completed', user: 'Alex Chen', time: 'Jul 12, 09:00 AM', details: 'Sarah_Jenkins_CV_Frontend_v2.4.pdf uploaded to cloud storage bucket.' },
          { stepId: '2', label: 'Parsing', status: 'completed', user: 'Parser API', time: 'Jul 12, 09:05 AM', details: 'Document parsed successfully. Extracted 7 sections including new Publications.' },
          { stepId: '3', label: 'ATS Scan', status: 'completed', user: 'ATS Engine', time: 'Jul 12, 09:10 AM', details: 'ATS compatibility matching completed. Initial baseline: 61%.' },
          { stepId: '4', label: 'AI Review', status: 'running', user: 'Phoenix AI', time: 'Jul 12, 09:12 AM', details: 'Llama-3 model generated 8 optimization suggestions including Server Components.' },
          { stepId: '5', label: 'Optimization', status: 'pending', user: 'Alex Chen', time: 'Jul 12, 10:00 AM', details: 'Applying AI suggestions and correcting margin inconsistencies.' },
          { stepId: '6', label: 'Final Review', status: 'pending', user: 'Lead Reviewer', time: 'Pending', details: 'Final quality audit prior to client dispatch.' },
          { stepId: '7', label: 'Client Delivery', status: 'pending', user: 'Delivery API', time: 'Pending', details: 'Secure client link generation and delivery.' }
        ]
      },
      sectionInspectors: {
        create: [
          { name: 'Summary', content: 'Senior Frontend Engineer with 7+ years experience building scalable web applications...', score: 95, issues: 1 },
          { name: 'Experience', content: 'TechCorp Inc - Senior Frontend Engineer (2021-Present). Led SaaS dashboard development team...', score: 88, issues: 3 },
          { name: 'Projects', content: 'E-commerce Platform with 40% conversion improvement, Real-time Analytics Dashboard...', score: 82, issues: 2 },
          { name: 'Education', content: 'MIT - BS Computer Science (2015-2019). GPA: 3.8/4.0', score: 100, issues: 0 },
          { name: 'Skills', content: 'React, TypeScript, Next.js, TailwindCSS, GraphQL, REST APIs, State Management', score: 85, issues: 2 },
          { name: 'Certificates', content: 'AWS Certified Developer - Associate (2023)', score: 70, issues: 1 }
        ]
      },
      formattingIssues: {
        create: [
          { type: 'Margins', severity: 'critical', description: 'Inconsistent margins detected in header section', location: 'Page 1, Header' },
          { type: 'Spacing', severity: 'medium', description: 'Double spacing in summary block', location: 'Page 1, Summary' },
          { type: 'Font', severity: 'minor', description: 'Font size below 10pt in contact section', location: 'Page 1, Contact' },
          { type: 'Headers', severity: 'medium', description: 'Inconsistent header hierarchy', location: 'Throughout' },
          { type: 'Bullet Consistency', severity: 'minor', description: 'Mixed bullet styles in experience section', location: 'Page 1, Experience' },
          { type: 'Alignment', severity: 'medium', description: 'Text alignment issues in skills section', location: 'Page 1, Skills' },
          { type: 'Section Order', severity: 'minor', description: 'Projects section should follow experience', location: 'Page 2' }
        ]
      },
      grammarIssues: {
        create: [
          { type: 'Passive Voice', text: 'was responsible for managing the team', suggestion: 'managed the team', aiRecommendation: 'Use active voice to demonstrate leadership' },
          { type: 'Long Sentence', text: 'Developed and maintained multiple web applications using various technologies including React TypeScript and Next.js while ensuring high performance and user experience', suggestion: 'Break into 2-3 shorter sentences', aiRecommendation: 'Improve readability by splitting complex sentences' },
          { type: 'Weak Action Verb', text: 'worked on', suggestion: 'engineered / developed / built', aiRecommendation: 'Use strong action verbs to highlight impact' },
          { type: 'Repeated Words', text: 'developed (used 5 times)', suggestion: 'varied: built, created, engineered', aiRecommendation: 'Diversify vocabulary for better engagement' },
          { type: 'Subject-Verb Agreement', text: 'The team were able to deliver', suggestion: 'The team was able to deliver', aiRecommendation: 'Ensure proper subject-verb agreement for collective nouns' }
        ]
      }
    }
  });

  console.log('ATS review created:', review.reviewId);
}

seedATS()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
