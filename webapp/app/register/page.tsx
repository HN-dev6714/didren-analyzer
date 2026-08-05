"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/themeButton"

export default function RegisterPage() {
  //all state variables needed for the register page ()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  
  //status message hooks
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  //on clicking sign-up, do the following:
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    //if password dosen't match confirm password, return passwords do not match
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.")
      setLoading(false)
      return
    }

    //use the supabase client SDK to sign up account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        //supabase send user back after user clicks confirmation email
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data:{
            user_role: role,
            first_name: firstName,
            last_name: lastName
        }
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      //user could potentially be directly sent to dashboard, or must confirm account depending on situation and authorization
      if (data.session) {
        setSuccessMsg("Account created successfully! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      } else {
        setSuccessMsg("Registration successful! Check your email inbox to confirm your account.")
        setLoading(false)
      }
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
      <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight font-mono">Create DidrenAnalyzer Account</CardTitle>
          <CardDescription>Please enter your information: </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">

            <div>
              <label className="block text-xs tracking-wider text-zinc-700 dark:text-zinc-100 mb-1 font-medium">First Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-sans"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
              />
              
            </div>

            <div>
              <label className="block text-xs tracking-wider text-zinc-700 dark:text-zinc-100 mb-1 font-medium">Surname</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-sans"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
                <label className="block text-xs tracking-wider text-zinc-800 dark:text-zinc-100 font-medium">
                    Account Role
                </label>
                
                <div className="flex items-center gap-6 p-1">
                    <div className="flex items-center gap-2">
                    <input 
                        type="radio" 
                        id="choice1" 
                        name="Role" 
                        value="Clinician"
                        className="h-4 w-4 accent-teal-600 cursor-pointer"
                        checked={role === "Clinician"}
                        onChange={(e) => setRole(e.target.value)}
                    />
                    <label htmlFor="choice1" className="text-sm text-zinc-800 dark:text-zinc-100 cursor-pointer select-none">
                        Clinician
                    </label>
                    </div>

                    <div className="flex items-center gap-2">
                    <input 
                        type="radio" 
                        id="choice2" 
                        name="Role" 
                        value="Researcher"
                        className="h-4 w-4 accent-teal-600 cursor-pointer"
                        checked={role === "Researcher"}
                        onChange={(e) => setRole(e.target.value)}
                    />
                    <label htmlFor="choice2" className="text-sm text-zinc-800 dark:text-zinc-100 cursor-pointer select-none">
                        Researcher
                    </label>
                    </div>
                </div>
                </div>

            <div>
              <label className="block text-xs tracking-wider text-zinc-700 dark:text-zinc-100 mb-1 font-medium">Email Address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-sans"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-zinc-700 dark:text-zinc-100 mb-1 font-medium">Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-sans"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-zinc-700 dark:text-zinc-100 mb-1 font-medium">Confirm Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-sans"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            {errorMsg && <p className="text-sm text-red-400 dark:text-red-200 font-medium font-sans">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-emerald-400 dark:text-emerald-200 font-medium font-sans">{successMsg}</p>}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium" disabled={loading}>
              {loading ? "Registering profile..." : "Create Account"}
            </Button>

            <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-300 font-sans">
              Already have an account?{" "}
              <Link href="/" className="text-teal-500 dark:text-teal-200 hover:underline">
                Sign In here
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}