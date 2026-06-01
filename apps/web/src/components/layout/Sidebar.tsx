"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  History, 
  ShieldAlert,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Analyze',
    icon: ShieldAlert,
    href: '/analyze',
    color: 'text-emerald-500',
  },
  {
    label: 'History',
    icon: History,
    href: '/history',
    color: 'text-violet-500',
  },
  {
    label: 'Admin',
    icon: Settings,
    href: '/admin',
    color: 'text-gray-500',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredRoutes = routes.filter(route => {
    if (route.href === '/admin' && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            TruthGuard AI
          </h1>
        </Link>
        <div className="space-y-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="px-3 py-2">
        <button
          onClick={logout}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            Logout
          </div>
        </button>
      </div>
    </div>
  )
}
