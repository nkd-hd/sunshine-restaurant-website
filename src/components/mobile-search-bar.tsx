"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input placeholder="Search Sunshine Restaurant" className="pl-10 h-12 rounded-xl bg-gray-50 border-0 text-base" />
    </div>
  )
}
