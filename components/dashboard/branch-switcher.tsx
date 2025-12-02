"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBranch } from "@/contexts/BranchContext"

export default function BranchSwitcher() {
  const { currentBranch, branches, switchBranch, isLoading } = useBranch()
  const { toast } = useToast()

  // Remove the useEffect and data fetching logic since we're using the context

  const handleSwitchBranch = (branchId: string) => {
    switchBranch(branchId)
    toast({
      title: "Branch switched",
      description: `You are now viewing ${branches.find(b => b.id === branchId)?.name || "Unknown Branch"}`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/10">
        <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse"></div>
        <ChevronsUpDown className="h-4 w-4 text-secondary/60" />
      </div>
    )
  }

  // Only show branch switcher for super admins
  if (branches.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/10 hover:bg-secondary/20 w-full justify-between"
        >
          <span className="truncate max-w-[120px]">
            {currentBranch?.name || "Select Branch"}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-secondary/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleSwitchBranch(branch.id)}
            className={currentBranch?.id === branch.id ? "bg-primary/10" : ""}
          >
            {branch.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}