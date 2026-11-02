import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps): React.JSX.Element {
  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">K</span>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  )
}
