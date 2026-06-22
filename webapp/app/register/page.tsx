"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  
  // Status message hooks
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    // Basic Local Validation Check
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.")
      setLoading(false)
      return
    }

    // Trigger the Supabase Client SDK Sign Up Execution
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This is where Supabase sends users back to after clicking a confirmation email
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
      // Handle Account Creation Success States
      // Check if user is auto-confirmed or needs email validation
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
      <Card className="w-full max-w-md bg-zinc-50 border-zinc-300 text-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight font-mono">Create DidrenAnalyzer Account</CardTitle>
          <CardDescription>Please enter your information: </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">

            {/* First Name */}
            <div>
              <label className="block text-xs tracking-wider text-zinc-700 mb-1 font-medium">First Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500 font-sans"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
              />
              
            </div>

            {/* Lastname */}
            <div>
              <label className="block text-xs tracking-wider text-zinc-700 mb-1 font-medium">Surname</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500 font-sans"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
              />
            </div>

            {/* Clinician or Researcher */}
            <div className="flex flex-col gap-2">
                <label className="block text-xs tracking-wider text-zinc-800 font-medium">
                    Account Role
                </label>
                
                <div className="flex items-center gap-6 p-1">
                    {/* Option 1: Clinician */}
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
                    <label htmlFor="choice1" className="text-sm text-zinc-800 cursor-pointer select-none">
                        Clinician
                    </label>
                    </div>

                    {/* Option 2: Researcher */}
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
                    <label htmlFor="choice2" className="text-sm text-zinc-800 cursor-pointer select-none">
                        Researcher
                    </label>
                    </div>
                </div>
                </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs tracking-wider text-zinc-700 mb-1 font-medium">Email Address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500 font-sans"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs tracking-wider text-zinc-700 mb-1 font-medium">Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500 font-sans"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs tracking-wider text-zinc-700 mb-1 font-medium">Confirm Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500 font-sans"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            {/* Dynamic Status Feedback Banners */}
            {errorMsg && <p className="text-sm text-red-400 font-medium font-sans">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-emerald-400 font-medium font-sans">{successMsg}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium" disabled={loading}>
              {loading ? "Registering profile..." : "Create Account"}
            </Button>

            {/* Router Pivot Link */}
            <div className="mt-6 text-center text-sm text-zinc-500 font-sans">
              Already have an account?{" "}
              <Link href="/" className="text-teal-400 hover:underline">
                Sign In here
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}