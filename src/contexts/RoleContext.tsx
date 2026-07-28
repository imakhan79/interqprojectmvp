import { createContext, useContext, useState, ReactNode } from "react";

export type AccountRole = "admin" | "company" | "recruiter" | "jobseeker";

interface RoleContextType {
  currentRole: AccountRole;
  setCurrentRole: (role: AccountRole) => void;
  roleLabel: string;
  roleColor: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [currentRole, setCurrentRole] = useState<AccountRole>("admin");

  const roleConfig = {
    admin: { label: "Admin", color: "bg-red-500" },
    company: { label: "Company", color: "bg-blue-500" },
    recruiter: { label: "TAP", color: "bg-green-500" },
    jobseeker: { label: "Job Seeker", color: "bg-purple-500" },
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        roleLabel: roleConfig[currentRole].label,
        roleColor: roleConfig[currentRole].color,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
};
