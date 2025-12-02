"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockBranches } from "@/data/mockData";

interface Branch {
  id: string;
  name: string;
}

interface BranchContextType {
  currentBranch: Branch | null;
  branches: Branch[];
  switchBranch: (branchId: string) => void;
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load branches and current branch from localStorage
    const loadBranchData = () => {
      try {
        // Set branches from mock data
        const mockBranchData = mockBranches.map(branch => ({
          id: branch.id,
          name: branch.name
        }));
        setBranches(mockBranchData);
        
        // Get current branch from localStorage or set the first branch as current by default
        const savedBranchId = localStorage.getItem("currentBranchId");
        if (savedBranchId) {
          const savedBranch = mockBranches.find(b => b.id === savedBranchId);
          if (savedBranch) {
            setCurrentBranch({
              id: savedBranch.id,
              name: savedBranch.name
            });
          }
        } else if (mockBranches.length > 0) {
          // Set the first branch as current by default
          setCurrentBranch({
            id: mockBranches[0].id,
            name: mockBranches[0].name
          });
          localStorage.setItem("currentBranchId", mockBranches[0].id);
        }
      } catch (error) {
        console.error("Error loading branch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranchData();
  }, []);

  const switchBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      localStorage.setItem("currentBranchId", branchId);
    }
  };

  return (
    <BranchContext.Provider value={{ currentBranch, branches, switchBranch, isLoading }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}