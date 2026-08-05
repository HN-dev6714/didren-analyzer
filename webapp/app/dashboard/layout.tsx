import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  //ask the Supabase Engine to decrypt the cookie and check the user record
  const { data: { user }, error } = await supabase.auth.getUser();
  

  //if the user session is invalid, send them back to login
  //this is to prevent people from typing /dashboard and landing in the dashboard page without an naccount
  if (error || !user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen w-full relative justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700" 
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}>
      <main className="flex-1 flex flex-col min-h-full overflow-y-auto p-10">
        {children}
        <div className="absolute bottom-6 left-6 text-xs text-zinc-800 dark:text-zinc-100 pt-6">
          Logged in as:<br/>{user.email}
        </div>
      </main>
    </div>
    
  )
}