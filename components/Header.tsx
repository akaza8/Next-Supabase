import React from "react";

const Header = () => {
  return (
    <header className="mb-5">
      <h1 className="display-4 fw-bold">Welcome to SupaNext</h1>
      <p className="lead">
        A powerful Next.js application with Supabase integration
      </p>
      <button className="btn btn-primary btn-lg">Get Started</button>
    </header>
  );
};

export default Header;
