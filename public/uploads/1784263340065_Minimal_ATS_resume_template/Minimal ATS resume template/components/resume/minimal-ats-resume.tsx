import { resumeData } from "./resume-data"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#E5E7EB] pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">
      {children}
    </h2>
  )
}

export function MinimalAtsResume() {
  const { name, title, contact, summary, experience, projects, education, skills, certificates, languages } = resumeData

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.portfolio,
  ]

  return (
    <article
      className="resume-sheet mx-auto w-full max-w-[210mm] bg-white px-12 py-12 text-[#111111] shadow-sm print:shadow-none"
      style={{ minHeight: "297mm" }}
      aria-label={`Resume of ${name}`}
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#111111] text-balance">
          {name}
        </h1>
        <p className="mt-1 text-base font-medium text-[#555555]">{title}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[12px] leading-relaxed text-[#555555]">
          {contactItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </header>

      {/* Summary */}
      <section className="mb-7">
        <SectionHeading>Professional Summary</SectionHeading>
        <p className="text-[13px] leading-relaxed text-[#555555]">{summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-7">
        <SectionHeading>Experience</SectionHeading>
        <div className="flex flex-col gap-5">
          {experience.map((job) => (
            <div key={job.company}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[14px] font-semibold text-[#111111]">{job.role}</h3>
                <span className="whitespace-nowrap text-[12px] text-[#555555]">{job.period}</span>
              </div>
              <p className="mb-2 text-[13px] font-medium text-[#555555]">{job.company}</p>
              <ul className="list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-[#555555] marker:text-[#111111]">
                {job.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-7">
        <SectionHeading>Projects</SectionHeading>
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div key={project.name}>
              <h3 className="text-[14px] font-semibold text-[#111111]">{project.name}</h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-[#555555]">{project.description}</p>
              {project.tech.length > 0 && (
                <p className="mt-1 text-[12px] text-[#555555]">
                  <span className="font-medium text-[#111111]">Tech: </span>
                  {project.tech.join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-7">
        <SectionHeading>Education</SectionHeading>
        <div className="flex flex-col gap-4">
          {education.map((edu) => (
            <div key={edu.school}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[14px] font-semibold text-[#111111]">{edu.degree}</h3>
                <span className="whitespace-nowrap text-[12px] text-[#555555]">{edu.period}</span>
              </div>
              <p className="text-[13px] text-[#555555]">{edu.school}</p>
              <p className="mt-0.5 text-[12px] text-[#555555]">{edu.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-7">
        <SectionHeading>Skills</SectionHeading>
        <p className="text-[13px] leading-relaxed text-[#555555]">{skills.join(" · ")}</p>
      </section>

      {/* Certificates */}
      <section className="mb-7">
        <SectionHeading>Certificates</SectionHeading>
        <ul className="list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-[#555555] marker:text-[#111111]">
          {certificates.map((cert) => (
            <li key={cert}>{cert}</li>
          ))}
        </ul>
      </section>

      {/* Languages */}
      <section>
        <SectionHeading>Languages</SectionHeading>
        <p className="text-[13px] leading-relaxed text-[#555555]">{languages.join(" · ")}</p>
      </section>
    </article>
  )
}
