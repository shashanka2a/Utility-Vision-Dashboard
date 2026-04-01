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
  
  // Primary truth: URL search parameters
  const selectedProject = searchParams.get("project") || "All Projects";
  
  const dateParam = searchParams.get("date");
  const selectedDate = dateParam ? new Date(dateParam + "T12:00:00") : new Date();

  const setSelectedProject = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (name === "All Projects") {
      params.delete("project");
    } else {
      params.set("project", name);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setSelectedDate = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    // Format as YYYY-MM-DD in local time
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    params.set("date", `${yyyy}-${mm}-${dd}`);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <ProjectContext.Provider value={{ 
      selectedProject, 
      setSelectedProject, 
      selectedDate: isNaN(selectedDate.getTime()) ? new Date() : selectedDate, 
      setSelectedDate 
    }}>
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
