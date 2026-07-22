import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

/**
 * The Dashboard Page
 * 
 * This page will contain two pathways: to the testing or analyzing page.
 * After confirming that the user is indeed a valid user and is logged in, 
 * we offer the options to go to the testing or analyzing page. 
 * Maybe we create a log out feature, or a user account page where users
 * can log out, delete account, or change parameters. 
 * 
 * @param param0 children
 * @returns i'm really not sure what this returns
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Ask the Supabase Engine to decrypt the cookie and check the user record
  const { data: { user }, error } = await supabase.auth.getUser()

  // If the user session is expired, tampered with, or missing, bounce them back to login
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