"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const resolvedTheme: "light" | "dark" | "system" =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "system"

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-5 w-5 text-emerald-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <TriangleAlert className="h-5 w-5 text-amber-500" />,
        error: <OctagonX className="h-5 w-5 text-red-500" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
