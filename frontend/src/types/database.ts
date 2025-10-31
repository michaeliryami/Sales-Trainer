export interface Profile {
  id: string // uuid
  display_name: string
  email: string
  created_at: string
  org: number // int8 - references organization ID
}

export interface Organization {
  id: number // int8
  created_at: string
  name: string
  admin: string // uuid - references profile ID
  users: string[] // text array of user IDs
  insurance_type: string // Insurance type for this organization (life, health, auto, home, business, other)
}

export interface UserRole {
  isAdmin: boolean
  organization: Organization | null
  profile: Profile | null
}
