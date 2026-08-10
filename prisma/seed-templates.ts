
import { PrismaClient } from './generated-client-v2';

const prisma = new PrismaClient();

async function seedTemplates() {
  console.log('Seeding templates...');

  // Sample HTML/CSS for a resume
  const resumeHTML = `
    <html>
      <head>
        <title>Sample Resume</title>
      </head>
      <body>
        <div class="resume">
          <header>
            <h1>John Doe</h1>
            <p>john@example.com | +1 555-123-4567 | New York, NY</p>
          </header>
          <section>
            <h2>Professional Summary</h2>
            <p>Experienced software engineer passionate about building great products.</p>
          </section>
          <section>
            <h2>Experience</h2>
            <div class="job">
              <h3>Senior Developer</h3>
              <p>Tech Company, 2020 - Present</p>
              <ul>
                <li>Built scalable applications</li>
                <li>Mentored junior engineers</li>
              </ul>
            </div>
          </section>
        </div>
      </body>
    </html>
  `;
  const resumeCSS = `
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2c3e50; margin-bottom: 5px; }
    h2 { color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 5px; }
    .job h3 { margin-bottom: 0; }
  `;

  // Create resume template
  const resumeTemplate = await prisma.resumeTemplate.create({
    data: {
      name: 'Modern Minimal Resume',
      category: 'resume',
      htmlContent: resumeHTML,
      cssContent: resumeCSS,
      status: 'published',
      theme: 'modern',
      version: '1.0',
    },
  });
  console.log('Created resume template:', resumeTemplate.name);

  // Sample Portfolio
  const portfolioHTML = `
    <html>
      <head>
        <title>Portfolio</title>
      </head>
      <body>
        <div class="portfolio">
          <header>
            <h1>Jane Smith</h1>
            <p>Full Stack Developer</p>
          </header>
          <section>
            <h2>Projects</h2>
            <div class="project">
              <h3>E-commerce Platform</h3>
              <p>Built a complete e-commerce solution</p>
            </div>
          </section>
        </div>
      </body>
    </html>
  `;
  const portfolioCSS = `
    body { font-family: 'Segoe UI', sans-serif; }
    h1 { color: #e74c3c; }
    .project { margin: 15px 0; padding: 10px; border-left: 3px solid #3498db; }
  `;
  const portfolioTemplate = await prisma.portfolioTemplate.create({
    data: {
      name: 'Creative Portfolio',
      category: 'portfolio',
      htmlContent: portfolioHTML,
      cssContent: portfolioCSS,
      status: 'published',
      theme: 'creative',
      version: '1.0',
    },
  });
  console.log('Created portfolio template:', portfolioTemplate.name);

  // Cover letter
  const coverLetterHTML = `
    <html>
      <head>
        <title>Cover Letter</title>
      </head>
      <body>
        <div class="cover-letter">
          <header>
            <p>John Doe</p>
            <p>john@example.com</p>
          </header>
          <hr />
          <p>Dear Hiring Manager,</p>
          <p>I am writing to apply for the position...</p>
        </div>
      </body>
    </html>
  `;
  const coverLetterCSS = `
    body { font-family: Georgia, serif; }
    .cover-letter { max-width: 600px; margin: 0 auto; }
    hr { border-color: #ecf0f1; }
  `;
  const coverLetterTemplate = await prisma.coverLetterTemplate.create({
    data: {
      name: 'Classic Cover Letter',
      category: 'cover-letter',
      htmlContent: coverLetterHTML,
      cssContent: coverLetterCSS,
      status: 'published',
      theme: 'classic',
      version: '1.0',
    },
  });
  console.log('Created cover letter template:', coverLetterTemplate.name);
}

seedTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
