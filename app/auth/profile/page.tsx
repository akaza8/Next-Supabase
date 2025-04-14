"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { myAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabaseClient";
import { get } from "http";
import React, { useEffect } from "react";

const Profile = () => {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<{
    name: string;
    email: string;
    phone: string;
    gender: string;
  } | null>(null);

  async function getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setLoading(false);
      setProfile({
        name: user.user_metadata.full_name,
        email: user.email ?? "",
        phone: user.user_metadata.phone ?? "xxxxxxxxx",
        gender: user.user_metadata.gender ?? "xx",
      });
    }
  }
  useEffect(() => {
    getProfile();
  }, []);
  return (
    <>
      <Navbar />
    <div className="container mt-5">
      <h2>Profile</h2>
      <div className="card p-4 shadow-sm">
        {loading ? (
          <p>Loading profile...</p>
        ) : (
          <>
            <p>
              <strong>Name:</strong> {profile?.name ?? "N/A"}
            </p>
            <p>
              <strong>Email:</strong>
              {profile?.email ?? "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {profile?.phone ?? "N/A"}
            </p>
            <p>
              <strong>Gender:</strong> {profile?.gender ?? "N/A"}
            </p>
          </>
        )}
      </div>
    </div>
      <Footer />
      </>
  );
};

export default Profile;
