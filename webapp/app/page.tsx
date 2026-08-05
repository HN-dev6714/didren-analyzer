"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/themeButton"
import { Logos } from "@/components/ui/logos"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    //calls the Supabase SDK Auth function
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      //login success, send user to dashboard
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700" 
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}>
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md bg-zinc-50 border-zinc-500 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        <CardHeader className="flex-col items-center justify-center">
          <CardTitle className="text-3xl font-bold font-mono text-center">DidRen Analyzer</CardTitle>
          <CardDescription className="text-center">Please Enter Your Credentials:</CardDescription>
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-100 mt-2">Don't have an account? <Link href="/register" className="text-teal-600 dark:text-teal-200 hover:underline">
              Register here
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wider text-zinc-800 dark:text-zinc-100 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-zinc-800 dark:text-zinc-100 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            {errorMsg && <p className="text-sm text-red-400 font-medium">{errorMsg}</p>}
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div>
        <Logos/>
       </div>
    </div>
  )
}