"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ProjectContextType {
  selectedProject: string;
  setSelectedProject: (name: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize from search params if present, otherwise default to current date
  const [selectedProject, setSelectedProjectState] = useState("All Projects");
  const [selectedDate, setSelectedDateState] = useState<Date>(new Date());

  useEffect(() => {
    const projectParam = searchParams.get("project");
    if (projectParam) {
      setSelectedProjectState(projectParam);
    }
    const dateParam = searchParams.get("date");
    if (dateParam) {
      // Parse as local date to avoid timezone shift
      const parsed = new Date(dateParam + "T12:00:00");
      if (!isNaN(parsed.getTime())) {
        setSelectedDateState(parsed);
      }
    }
  }, [searchParams]);

  const setSelectedProject = (name: string) => {
    setSelectedProjectState(name);
    
    // Update URL to keep it persistent across refreshes
    const params = new URLSearchParams(searchParams.toString());
    if (name === "All Projects") {
      params.delete("project");
    } else {
      params.set("project", name);
    }
    
    // Use replace to avoid bloating history
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setSelectedDate = (date: Date) => {
    setSelectedDateState(date);
    
    const params = new URLSearchParams(searchParams.toString());
    // Format as YYYY-MM-DD in local time
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    params.set("date", `${yyyy}-${mm}-${dd}`);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject, selectedDate, setSelectedDate }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
