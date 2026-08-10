import { prisma } from '@/lib/prisma'
import html2canvas from 'html2canvas'

// Helper to create base64 placeholder (we'll generate real thumbs later)
function createPlaceholderThumbnail() {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
}

// REAL Professional Resume Template
const professionalResume = {
  name: "Professional Modern Resume",
  theme: "modern",
  category: "resume",
  prompt: "Create a clean, modern resume template perfect for software engineers, data scientists, and other tech professionals. Should include sections for summary, skills, experience, projects, education. Use a blue accent color.",
  htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Professional Modern Resume</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 2rem; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 800px; margin: 0 auto; background-color: white; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
    <header style="border-bottom: 3px solid #3b82f6; padding-bottom: 1.5rem; margin-bottom: 2rem;">
      <h1 style="font-size: 2.5rem; margin: 0; color: #1e293b;">Jane Doe</h1>
      <p style="font-size: 1.25rem; color: #475569; margin: 0.5rem 0;">Senior Software Engineer</p>
      <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; color: #64748b;">
        <span>📧 jane.doe@email.com</span>
        <span>📱 +1 (555) 123-4567</span>
        <span>🔗 linkedin.com/in/janedoe</span>
        <span>💻 github.com/janedoe</span>
      </div>
    </header>
    
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 0.75rem; margin-top: 0;">Professional Summary</h2>
      <p>Results-driven Senior Software Engineer with 8+ years of experience designing, developing, and deploying scalable web applications. Expert in React, Node.js, and cloud architecture. Passionate about clean code, agile methodologies, and mentoring junior developers.</p>
    </section>
    
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 0.75rem;">Technical Skills</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
        <div><strong>Languages:</strong><br>JavaScript, TypeScript, Python, SQL</div>
        <div><strong>Frameworks:</strong><br>React, Next.js, Express, Django</div>
        <div><strong>Cloud:</strong><br>AWS, Docker, Kubernetes, Terraform</div>
      </div>
    </section>
    
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 0.75rem;">Work Experience</h2>
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <h3 style="margin: 0; color: #1e293b;">TechCorp Inc.</h3>
          <span style="color: #64748b;">2020 - Present</span>
        </div>
        <p style="font-weight: 500; color: #475569; margin: 0;">Senior Software Engineer</p>
        <ul style="margin-top: 0.75rem; color: #475569; padding-left: 1.25rem;">
          <li>Led a team of 5 engineers to build a real‑time analytics platform serving 1M+ users</li>
          <li>Reduced application latency by 40% via optimized database queries and caching strategies</li>
          <li>Implemented CI/CD pipelines that cut deployment time from 30 minutes to 5 minutes</li>
        </ul>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <h3 style="margin: 0; color: #1e293b;">StartupXYZ</h3>
          <span style="color: #64748b;">2017 - 2020</span>
        </div>
        <p style="font-weight: 500; color: #475569; margin: 0;">Full Stack Developer</p>
        <ul style="margin-top: 0.75rem; color: #475569; padding-left: 1.25rem;">
          <li>Developed and launched 3 client‑facing applications from scratch</li>
          <li>Collaborated with UX designers to implement pixel‑perfect interfaces</li>
        </ul>
      </div>
    </section>
    
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 0.75rem;">Education</h2>
      <div style="margin-bottom: 0.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #1e293b;">University of Technology</h3>
          <span style="color: #64748b;">2013 - 2017</span>
        </div>
        <p style="color: #475569; margin: 0;">B.S. Computer Science, Magna Cum Laude</p>
      </div>
    </section>
  </div>
</body>
</html>
  `,
  cssContent: `
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 2rem; background-color: #f8fafc; color: #1e293b; line-height: 1.6; }
@media (max-width: 768px) {
  body { padding: 1rem; }
  .container { padding: 1.5rem; }
}
  `,
  metadata: JSON.stringify({
    sections: ["summary", "skills", "experience", "education"],
    colors: { primary: "#3b82f6", secondary: "#1e40af", background: "#f8fafc" },
    fontFamily: "Segoe UI",
    paperSize: "A4"
  }),
  tags: "modern, professional, software engineer, tech, blue"
};

// REAL Minimal Cover Letter Template
const minimalCoverLetter = {
  name: "Minimal Business Cover Letter",
  theme: "minimal",
  category: "cover-letter",
  prompt: "Create a minimal, professional cover letter template for business professionals. Clean, sans-serif, black and white.",
  htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimal Cover Letter</title>
</head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 2rem; line-height: 1.75; color: #111827; max-width: 800px; margin: 0 auto;">
  <header style="margin-bottom: 3rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb;">
    <h1 style="font-size: 1.75rem; margin: 0; letter-spacing: 0.05em;">JOHN SMITH</h1>
    <p style="margin: 0.5rem 0 0; color: #4b5563; font-size: 0.875rem;">john.smith@email.com · (555) 987‑6543 · New York, NY</p>
  </header>

  <p style="margin: 0 0 1rem; color: #4b5563; font-size: 0.875rem;">October 24, 2026</p>
  
  <p style="margin: 0 0 1.5rem;">
    Hiring Manager<br>
    Innovative Solutions Corp.<br>
    456 Innovation Drive<br>
    New York, NY 10001
  </p>

  <h2 style="font-size: 1.125rem; margin: 2rem 0 1rem; font-weight: 600;">Dear Hiring Manager,</h2>

  <p style="margin: 0 0 1rem;">
    I am writing to express my interest in the Senior Product Manager position at Innovative Solutions Corp.
    With over 7 years of experience leading cross‑functional teams and delivering successful products, I am
    confident I would be a valuable addition to your organization.
  </p>

  <p style="margin: 0 0 1rem;">
    In my previous role at TechLeader Inc., I led the product strategy for our flagship SaaS platform,
    resulting in a 35% increase in user retention and a 25% growth in annual recurring revenue.
    My experience in agile methodologies, user research, and data‑driven decision‑making aligns
    perfectly with the needs outlined in your job description.
  </p>

  <p style="margin: 0 0 1rem;">
    I would welcome the opportunity to discuss how my skills and experience can benefit your team.
    Thank you for considering my application.
  </p>

  <p style="margin: 2rem 0 0.5rem;">Sincerely,</p>
  <p style="margin: 0; font-weight: 600;">John Smith</p>
</body>
</html>
  `,
  cssContent: `
body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 2rem; line-height: 1.75; color: #111827; max-width: 800px; margin: 0 auto; }
@media print { body { margin: 0; } }
  `,
  metadata: JSON.stringify({
    sections: ["header", "date", "recipient", "salutation", "body", "closing"],
    colors: { primary: "#111827", background: "#ffffff" },
    fontFamily: "system-ui",
    paperSize: "A4"
  }),
  tags: "minimal, business, professional, cover letter, clean"
};

// REAL Creative Portfolio Template
const creativePortfolio = {
  name: "Creative Designer Portfolio",
  theme: "creative",
  category: "portfolio",
  prompt: "Create a creative portfolio template for designers and artists. Grid layout for projects, accent colors, bold typography.",
  htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creative Portfolio</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
  <div style="padding: 2rem;">
    <header style="text-align: center; margin-bottom: 4rem;">
      <h1 style="font-size: 4rem; margin: 0; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ALEX RIVERA</h1>
      <p style="font-size: 1.25rem; color: #94a3b8; margin-top: 1rem;">Product Designer & Creative Technologist</p>
    </header>
    
    <section style="margin-bottom: 4rem;">
      <h2 style="font-size: 2rem; margin-bottom: 2rem; color: #ffffff;">Selected Projects</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
          <div style="height: 200px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem;">🎨</div>
          <div style="padding: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem; color: #f1f5f9;">Brand Identity: Nova</h3>
            <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">Complete brand system for fintech startup</p>
          </div>
        </div>
        <div style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
          <div style="height: 200px; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem;">📱</div>
          <div style="padding: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem; color: #f1f5f9;">Mobile App: Pulse</h3>
            <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">Health and wellness app design</p>
          </div>
        </div>
        <div style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
          <div style="height: 200px; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem;">🌐</div>
          <div style="padding: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem; color: #f1f5f9;">Web Design: EcoHub</h3>
            <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">Sustainability platform landing page</p>
          </div>
        </div>
      </div>
    </section>
    
    <footer style="text-align: center; padding: 3rem 0; border-top: 1px solid #334155; margin-top: 4rem;">
      <p style="color: #64748b; font-size: 0.875rem;">© 2026 Alex Rivera. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>
  `,
  cssContent: `
body { margin: 0; padding: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; }
@media (max-width: 768px) {
  h1 { font-size: 2.5rem; }
  section { padding: 0 1rem; }
}
  `,
  metadata: JSON.stringify({
    sections: ["header", "projects", "footer"],
    colors: { primary: "#8b5cf6", secondary: "#ec4899", background: "#0f172a" },
    fontFamily: "Inter",
    paperSize: "A4"
  }),
  tags: "creative, portfolio, designer, artist, dark mode, gradient"
};


async function main() {
  console.log("Creating real production templates...")
  
  // Create Resume
  await prisma.resumeTemplate.create({
    data: {
      name: professionalResume.name,
      category: professionalResume.category,
      theme: professionalResume.theme,
      prompt: professionalResume.prompt,
      htmlContent: professionalResume.htmlContent,
      cssContent: professionalResume.cssContent,
      thumbnail: createPlaceholderThumbnail(),
      metadata: professionalResume.metadata,
      tags: professionalResume.tags,
      status: "published",
      version: "1.0"
    }
  })
  
  // Create Cover Letter
  await prisma.coverLetterTemplate.create({
    data: {
      name: minimalCoverLetter.name,
      category: minimalCoverLetter.category,
      theme: minimalCoverLetter.theme,
      prompt: minimalCoverLetter.prompt,
      htmlContent: minimalCoverLetter.htmlContent,
      cssContent: minimalCoverLetter.cssContent,
      thumbnail: createPlaceholderThumbnail(),
      metadata: minimalCoverLetter.metadata,
      tags: minimalCoverLetter.tags,
      status: "published",
      version: "1.0"
    }
  })
  
  // Create Portfolio
  await prisma.portfolioTemplate.create({
    data: {
      name: creativePortfolio.name,
      category: creativePortfolio.category,
      theme: creativePortfolio.theme,
      prompt: creativePortfolio.prompt,
      htmlContent: creativePortfolio.htmlContent,
      cssContent: creativePortfolio.cssContent,
      thumbnail: createPlaceholderThumbnail(),
      metadata: creativePortfolio.metadata,
      tags: creativePortfolio.tags,
      status: "published",
      version: "1.0"
    }
  })
  
  console.log("✅ Real templates created successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
