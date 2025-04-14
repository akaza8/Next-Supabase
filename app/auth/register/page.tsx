"use client";
import React from "react";
import { Formik } from "formik";
import { object, string, number, date, InferType, ref } from "yup";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Register = () => {
  let userSchema = object({
    name: string().required(),
    email: string().email().required(),
    phone: string().required(),
    gender: string().required(),
    password: string().required(),
    confirmPassword: string().required().oneOf([ref('password')], 'Passwords must match'),
  });
  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="text-center">Register</h2>
        <Formik
          initialValues={{
            name: "",
            email: "",
            phone: "",
            gender: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={userSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const { data, error } = await supabase.auth.signUp({
              email: values.email,
              password: values.password,
              options: {
                data: {
                  full_name: values.name,
                  phone: values.phone,
                  gender: values.gender,
                },
              },
            });
            if (error) {
              toast.error(error.message);
              setSubmitting(false);
            }
            // window.location.href = "/auth/dashboard";
            localStorage.setItem("loginSuccess", "true");
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
            validateForm,
          }) => (
            <form className="w-50 mx-auto mt-3" onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-danger">
                    {errors.name && touched.name && errors.name}
                  </p>
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-danger">
                    {errors.email && touched.email && errors.email}
                  </p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-danger">
                    {errors.phone && touched.phone && errors.phone}
                  </p>
                </div>
                <div className="col-md-6">
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    className="form-control"
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                     <option value="" defaultValue={""}>Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-danger">
                    {errors.gender && touched.gender && errors.gender}
                  </p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-danger">
                    {errors.password && touched.password && errors.password}
                  </p>
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="text-danger">
                    {errors.confirmPassword &&
                      touched.confirmPassword &&
                      errors.confirmPassword}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </Formik>
        <p className="text-center mt-3">
          Already have an account? <a href="/auth/login">Login</a>
        </p>
      </div>
      <Footer />
    </>
  );
};

export default Register;
