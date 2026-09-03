export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r">{/* sidebar */}</aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
