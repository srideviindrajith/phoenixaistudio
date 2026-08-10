import { MinimalAtsResume } from "@/components/resume/minimal-ats-resume"

export default function Page() {
  return (
    <main className="resume-page-wrap min-h-screen bg-neutral-100 py-8 print:bg-white print:py-0">
      <MinimalAtsResume />
    </main>
  )
}
