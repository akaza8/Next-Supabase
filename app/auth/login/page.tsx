"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { myAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabaseClient";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { Formik } from "formik";
import { object, string, number, date, InferType } from "yup";
import { useRouter } from "next/navigation";
const Login = () => {
  const { isLoogedIn,setIsLoogedIn } = myAppHook();
  useEffect(()=>{
    if(isLoogedIn) {
      router.push("/auth/dashboard");
    }
  },[isLoogedIn])
  const signIn = async (provider: "google") => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/dashboard`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
    else {
      localStorage.setItem("loginSuccess", "true");
    }
  };
  let userSchema = object({
    email: string().email().required("Email is required"),
    password: string().required("Password is required"),
  });
  const router = useRouter();
  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="text-center">Login</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={userSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(async() => {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
              })
              if (error) {
                toast.error("Something went wrong with login");
              }
              else {
                router.push("/auth/dashboard");
                localStorage.setItem("loginSuccess", "true");
                setIsLoogedIn(true);
              }
              setSubmitting(false);
            }, 400);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form className="w-50 mx-auto mt-3" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                />
                {errors.email && touched.email && (
                  <div className="text-danger">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                />
                {errors.password && touched.password && (
                  <div className="text-danger">{errors.password}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}
        </Formik>
        <div className="text-center mt-3">
          <button
            className="btn btn-danger mx-2"
            onClick={() => signIn("google")}
          >
            Google
          </button>
          {/* <button className="btn btn-dark mx-2">GitHub</button> */}
        </div>

        <p className="text-center mt-3">
          Don't have an account? <a href="/auth/register">Register</a>
        </p>
      </div>
      <Footer />
    </>
  );
};

export default Login;
