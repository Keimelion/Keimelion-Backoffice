import { Sidebar } from '@/components/shared/sidebar'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { UserMenu } from '@/components/shared/user-menu'
import { SessionGuard } from '@/features/auth/components/session-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <SessionGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-end gap-4 border-b border-border px-6">
            <ThemeToggle />
            <UserMenu />
          </header>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </SessionGuard>
  )
}
