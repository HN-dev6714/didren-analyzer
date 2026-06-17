import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Ask the Supabase Engine to decrypt the cookie and check the user record
  const { data: { user }, error } = await supabase.auth.getUser()

  // If the user session is expired, tampered with, or missing, bounce them back to login
  if (error || !user) {
    redirect("/")
  }

  // User is valid! Render the internal application layout
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50">
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-teal-400 tracking-tight mb-8">HMD Control Center</h2>
          <nav className="space-y-2">
            <a href="/dashboard" className="block text-sm font-medium text-zinc-300 hover:text-white">Active Devices</a>
          </nav>
        </div>
        <div className="text-xs text-zinc-500">Logged in as:<br/>{user.email}</div>
      </aside>
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  )
}