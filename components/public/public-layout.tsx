import { Navbar } from './navbar'
import { Footer } from './footer'
import { SettingsProvider } from './settings-context'
import { Toaster } from '@/components/ui/toaster'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <div className="phoenix-shell flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </SettingsProvider>
  )
}
