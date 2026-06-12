"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { handleSessionExpired } from "@/lib/sessionUtils";

type AdminData = {
  adminId: string;
  adminName: string;
  adminRole: string;
  nimNip: string;
  isLoadingAdmin: boolean;
  setAdminName: (name: string) => void;
  setNimNip: (nip: string) => void;
};

const defaultValue: AdminData = {
  adminId: "",
  adminName: "",
  adminRole: "",
  nimNip: "",
  isLoadingAdmin: true,
  setAdminName: () => {},
  setNimNip: () => {},
};

export const AdminContext = createContext<AdminData>(defaultValue);

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminNameState] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [nimNip, setNimNip] = useState("");
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) { handleSessionExpired(); return null; }
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (data?.id != null) {
          setAdminId(String(data.id));
          setAdminNameState(data.nama ?? "");
          setAdminRole(data.role ?? "");
          setNimNip(data.nim_nip ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingAdmin(false));
  }, []);

  const setAdminName = useCallback((name: string) => setAdminNameState(name), []);

  return (
    <AdminContext.Provider
      value={{ adminId, adminName, adminRole, nimNip, isLoadingAdmin, setAdminName, setNimNip }}
    >
      {children}
    </AdminContext.Provider>
  );
}
