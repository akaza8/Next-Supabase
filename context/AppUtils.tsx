"use client";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext, createContext, useState, useEffect, useMemo } from "react";
import { set } from "react-hook-form";
import toast from "react-hot-toast";
type AppUtilsType = {
  isLoogedIn: boolean;
  setAuthToken: (state: null | string) => void;
  setIsLoogedIn: (state: boolean) => void;
};
const AppUtilsContext = createContext<AppUtilsType | null>(null);
export const AppUtilsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => { 
  const router = useRouter();
  const pathname = usePathname();
  const [isLoogedIn, setIsLoogedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  useEffect(() => {
    const checkSession=async()=>{
      const {data, error} = await supabase.auth.getSession();
      if(error) {
        toast.error("Something went wrong with login");
        router.push("/auth/login");
      }
      if (data.session?.access_token) {
        setAuthToken(data.session?.access_token);
        setIsLoogedIn(true)
        localStorage.setItem('access_token', data.session?.access_token);
      }else{
        if(pathname !== "/auth/register") {
          router.push("/auth/login");
        }
      }
    }
    checkSession();
  }, [isLoogedIn]);
  const values = useMemo(() => ({ isLoogedIn, setAuthToken, setIsLoogedIn }), [isLoogedIn, setAuthToken,
    setIsLoogedIn]);
  return (
    <AppUtilsContext.Provider
      value={values}
    >
      {children}
    </AppUtilsContext.Provider>
  );
};

export const myAppHook = () => {
  const context = useContext(AppUtilsContext);
  if (!context)
    throw new Error("AppUtilsContext must be used within a AppUtilsProvider");
  return context;
};
