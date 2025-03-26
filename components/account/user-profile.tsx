"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

interface UserProfileProps {
  initialProfile?: any
}

export function UserProfile({ initialProfile }: UserProfileProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState(initialProfile || {})
  const [fullName, setFullName] = useState(initialProfile?.full_name || "")
  const [phone, setPhone] = useState(initialProfile?.phone || "")

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user && !initialProfile) {
        // Fetch profile if not provided
        const { data: profileData } = await supabase.from("users").select("*").eq("id", data.user.id).single()

        if (profileData) {
          setProfile(profileData)
          setFullName(profileData.full_name || "")
          setPhone(profileData.phone || "")
        }
      }
    }

    loadUser()
  }, [initialProfile])

  const handleUpdateProfile = async () => {
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating your profile.",
      })
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url || `https://avatar.vercel.sh/${user.email}`} alt={fullName} />
          <AvatarFallback>{fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{fullName || "User"}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>

        <Button onClick={handleUpdateProfile} disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </div>
  )
}

