import { ElegantModernResume } from "@/components/elegant-modern-resume"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f1f5f9] py-8 md:py-12">
      <div className="mx-auto w-full max-w-[210mm] px-4 md:px-0">
        <div className="resume-sheet overflow-hidden rounded-lg bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
          <ElegantModernResume />
        </div>
      </div>
    </main>
  )
}
