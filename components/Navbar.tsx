"use client"; 
import Link from "next/link";
import { myAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

const Navbar = () => {
  const { setAuthToken, setIsLoogedIn, isLoogedIn } = myAppHook();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    setAuthToken(null);
    setIsLoogedIn(false);
    const { error } = await supabase.auth.signOut();
    toast.success("You are logged out successfully");
    if (error) {
      toast.error("Something went wrong with logout");
    }
    router.push("/auth/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg px-4"
      style={{ backgroundColor: "#343a40" }}
    >
      <Link className="navbar-brand fw-bold text-white" href="/">
        SupaNext
      </Link>
      {isLoogedIn ? (
        <div className="ms-auto">
          <Link
            className={`me-3 text-decoration-none ${pathname === '/auth/profile' ? 'text-warning' : 'text-white'}`}
            href="/auth/profile"
          >
            Profile
          </Link>
          <Link
            className={`me-3 text-decoration-none ${pathname === '/auth/dashboard' ? 'text-warning' : 'text-white'}`}
            href="/auth/dashboard"
          >
            Dashboard
          </Link>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="ms-auto">
          <Link
            className={`me-3 text-decoration-none ${pathname === '/' ? 'text-warning' : 'text-white'}`}
            href="/"
          >
            Home
          </Link>
          <Link
            className={`text-decoration-none ${pathname === '/auth/login' ? 'text-warning' : 'text-white'}`}
            href="/auth/login"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

