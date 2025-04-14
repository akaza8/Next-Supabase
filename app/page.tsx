import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <Navbar />
    <div className="container text-center py-5">
        <Header />
        <section className="row g-4">
            <div className="col-md-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">Fast & Secure</h5>
                        <p className="card-text">Built with Next.js and Supabase for speed and security.</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">Authentication</h5>
                        <p className="card-text">Seamless user authentication with Google, GitHub, and more.</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">Database & Storage</h5>
                        <p className="card-text">Manage data effortlessly with Supabase's PostgreSQL and storage.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <Footer />
    </>
  );
}
