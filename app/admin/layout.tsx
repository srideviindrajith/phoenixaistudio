import { AdminLayout } from '@/components/admin/admin-layout'
import { SettingsProvider } from '@/components/public/settings-context'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SettingsProvider>
      <AdminLayout>{children}</AdminLayout>
    </SettingsProvider>
  )
}
