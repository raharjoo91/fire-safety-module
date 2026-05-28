import Link from "next/link"

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger" | "ghost"
  disabled?: boolean
  className?: string
}

export default function Button({ children, href, onClick, variant = "primary", disabled, className = "" }: ButtonProps) {
  const base = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400 border border-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  }

  const cls = `${base} ${variants[variant]} ${className}`

  if (href) {
    return <Link href={href} className={cls}>{children}</Link>
  }

  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
