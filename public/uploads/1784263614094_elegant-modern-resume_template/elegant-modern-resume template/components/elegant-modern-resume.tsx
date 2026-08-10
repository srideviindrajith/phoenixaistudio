import type { ReactNode } from "react"
// Elegant Modern — PhoenixAI Studio resume template
import {
  Mail,
  Phone,
  MapPin,
  Link2,
  Globe,
  type LucideIcon,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Resume data                                                        */
/* ------------------------------------------------------------------ */

const resume = {
  name: "Olivia Thompson",
  title: "Senior UI/UX Designer",
  contact: {
    email: "olivia.thompson@email.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/oliviathompson",
    portfolio: "oliviathompson.design",
  },
  summary:
    "Creative and detail-oriented UI/UX Designer with over 8 years of experience designing intuitive digital products, enterprise dashboards, SaaS applications, and mobile experiences. Passionate about user-centered design, accessibility, and scalable design systems.",
  experience: [
    {
      role: "Senior UI/UX Designer",
      company: "PixelCraft Studio",
      period: "2021 — Present",
      points: [
        "Designed enterprise SaaS dashboards.",
        "Improved user engagement by 42%.",
        "Built reusable design systems.",
        "Led UX research activities.",
        "Worked closely with product teams.",
      ],
    },
    {
      role: "UI Designer",
      company: "Creative Labs",
      period: "2018 — 2021",
      points: [
        "Designed responsive web interfaces.",
        "Created design prototypes.",
        "Collaborated with developers.",
        "Improved accessibility standards.",
      ],
    },
  ],
  projects: [
    {
      name: "Enterprise Design System",
      description: "Created scalable UI components for enterprise products.",
    },
    {
      name: "Healthcare Mobile App",
      description: "Designed patient management mobile experience.",
    },
  ],
  education: [
    {
      degree: "Bachelor of Design",
      school: "California Institute of Arts",
      period: "2014 — 2018",
    },
  ],
  achievements: ["Best Product Design Award 2023", "Top UX Innovator 2022"],
  skills: [
    "Figma",
    "Adobe XD",
    "Sketch",
    "React",
    "Next.js",
    "HTML",
    "CSS",
    "TailwindCSS",
    "Design Systems",
    "User Research",
    "Wireframing",
    "Prototyping",
  ],
  certifications: [
    "Google UX Design",
    "Adobe Certified Professional",
    "Human-Centered Design",
  ],
  languages: ["English", "French"],
}

/* ------------------------------------------------------------------ */
/*  Reusable primitives                                                */
/* ------------------------------------------------------------------ */

function SectionHeading({
  children,
  tone = "dark",
}: {
  children: ReactNode
  tone?: "dark" | "muted"
}) {
  return (
    <div className="mb-4">
      <h2
        className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
          tone === "dark" ? "text-[#111827]" : "text-[#111827]"
        }`}
      >
        {children}
      </h2>
      <div className="mt-2 h-px w-full bg-[#E5E7EB]" />
      <div className="-mt-px h-[2px] w-10 bg-[#0EA5E9]" />
    </div>
  )
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <li className="flex items-start gap-2.5 text-[12px] leading-relaxed text-[#64748B]">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-[#0EA5E9]" strokeWidth={2} />
      <span className="break-words">{children}</span>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/*  Resume template                                                    */
/* ------------------------------------------------------------------ */

export function ElegantModernResume() {
  return (
    <article
      className="resume-sheet mx-auto flex w-full max-w-[210mm] flex-col bg-[#FFFFFF] text-[#111827] md:min-h-[297mm]"
      aria-label="Resume of Olivia Thompson, Senior UI/UX Designer"
    >
      {/* Header */}
      <header className="px-10 pt-12 pb-8">
        <h1 className="font-serif text-[42px] font-semibold leading-none tracking-tight text-[#111827] text-balance">
          {resume.name}
        </h1>
        <p className="mt-3 text-[16px] font-medium tracking-wide text-[#0EA5E9]">
          {resume.title}
        </p>
        <div className="mt-6 h-px w-full bg-[#E5E7EB]" />
      </header>

      {/* Two column body */}
      <div className="grid flex-1 grid-cols-1 gap-y-10 px-10 pb-12 md:grid-cols-[32%_1fr] md:gap-x-10">
        {/* LEFT COLUMN */}
        <aside className="flex flex-col gap-9">
          {/* Contact / Links */}
          <section>
            <SectionHeading>Contact</SectionHeading>
            <ul className="flex flex-col gap-2.5">
              <ContactRow icon={Mail}>{resume.contact.email}</ContactRow>
              <ContactRow icon={Phone}>{resume.contact.phone}</ContactRow>
              <ContactRow icon={MapPin}>{resume.contact.location}</ContactRow>
              <ContactRow icon={Link2}>{resume.contact.linkedin}</ContactRow>
              <ContactRow icon={Globe}>{resume.contact.portfolio}</ContactRow>
            </ul>
          </section>

          {/* Profile */}
          <section>
            <SectionHeading>Profile</SectionHeading>
            <p className="text-[12.5px] leading-relaxed text-[#64748B] text-pretty">
              {resume.summary}
            </p>
          </section>

          {/* Skills */}
          <section>
            <SectionHeading>Skills</SectionHeading>
            <ul className="flex flex-wrap gap-x-2 gap-y-2">
              {resume.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-sm border border-[#E5E7EB] px-2.5 py-1 text-[11.5px] font-medium text-[#111827]"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          {/* Certifications */}
          <section>
            <SectionHeading>Certifications</SectionHeading>
            <ul className="flex flex-col gap-2">
              {resume.certifications.map((cert) => (
                <li
                  key={cert}
                  className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#64748B]"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#0EA5E9]" />
                  {cert}
                </li>
              ))}
            </ul>
          </section>

          {/* Languages */}
          <section>
            <SectionHeading>Languages</SectionHeading>
            <ul className="flex flex-col gap-2">
              {resume.languages.map((lang) => (
                <li
                  key={lang}
                  className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#64748B]"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#0EA5E9]" />
                  {lang}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* RIGHT COLUMN */}
        <main className="flex flex-col gap-9">
          {/* Experience */}
          <section>
            <SectionHeading>Experience</SectionHeading>
            <div className="flex flex-col gap-6">
              {resume.experience.map((job) => (
                <div key={job.role}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-[15px] font-semibold text-[#111827]">
                      {job.role}
                    </h3>
                    <span className="text-[11.5px] font-medium uppercase tracking-wider text-[#64748B]">
                      {job.period}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] font-medium text-[#0EA5E9]">
                    {job.company}
                  </p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {job.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#64748B]"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#0EA5E9]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section>
            <SectionHeading>Projects</SectionHeading>
            <div className="flex flex-col gap-4">
              {resume.projects.map((project) => (
                <div key={project.name}>
                  <h3 className="text-[13.5px] font-semibold text-[#111827]">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#64748B]">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <SectionHeading>Education</SectionHeading>
            <div className="flex flex-col gap-4">
              {resume.education.map((edu) => (
                <div key={edu.degree}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-[13.5px] font-semibold text-[#111827]">
                      {edu.degree}
                    </h3>
                    <span className="text-[11.5px] font-medium uppercase tracking-wider text-[#64748B]">
                      {edu.period}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] font-medium text-[#0EA5E9]">
                    {edu.school}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Achievements */}
          <section>
            <SectionHeading>Achievements</SectionHeading>
            <ul className="flex flex-col gap-2">
              {resume.achievements.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#64748B]"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#0EA5E9]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </article>
  )
}

export default ElegantModernResume
