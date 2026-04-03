import React from 'react'
import Navbar from './Navbar'
import { FiArrowRight } from "react-icons/fi";
import { Link } from 'react-router-dom';
import billingHero from '../assets/monochrome_hero.png';
import homeBg from '../assets/HomeBg/img2.png';
import '../App.css';
const HomePage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background with 3-color gradient and image overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black -z-40"></div>
      <img
        src={homeBg}
        alt=""
        className="fixed   inset-0 w-full h-full object-cover -z-30 pointer-events-none opacity-30 mix-blend-luminosity"
      />

      {/* Deep Shadow / Vignette Overlay */}
      <div className="fixed inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] -z-20 pointer-events-none"></div>

      {/* Subtle Gradient Overlay for content readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-transparent to-black/80 -z-10"></div>

      <Navbar />

      {/* Hero Section with White to Black Gradient Background */}
      <section className="relative pt-2">
        {/* Subtle background overlay to provide some depth without obscuring the image */}

        {/* Subtle texture overlay */}
        <div className="absolute top-0 left-0 w-full h-[90vh] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-multiply -z-10"></div>

        <div className="max-w-7xl mx-auto px-10 py-32 flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
          {/* Left Side: Content */}
          <section className="lg:w-1/2 flex flex-col gap-8 animate-slide-up">
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full w-fit backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em]">
                Governance Platform
              </span>
            </div>

            <div className="flex flex-col gap-6">
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                Control
                <span className="text-zinc-500">Capital.</span>
              </h1>
              <p className="max-w-md text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                Streamline your billing lifecycle with uncompromising security
                and professional clarity. Centrally manage every financial
                policy.
              </p>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <Link
                to="/signup"
                className="group bg-white text-black px-10 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] text-lg"
              >
                <span>Free Trial</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

          {/* Right Side: Image */}
          <section
            className="lg:w-1/2 relative flex justify-center lg:justify-end animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative group">
              {/* Decorative Glow */}
              <div className="absolute -inset-10 bg-black/5 blur-3xl opacity-30 -z-10"></div>

              {/* Mockup with Perspective */}
              <div
                className="relative z-10 bg-zinc-900 p-2 rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out cursor-pointer"
                style={{
                  transform:
                    "perspective(1500px) rotateY(-12deg) rotateX(6deg)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform =
                    "perspective(1500px) rotateY(0deg) rotateX(0deg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform =
                    "perspective(1500px) rotateY(-12deg) rotateX(6deg)")
                }
              >
                <img
                  src={billingHero}
                  alt="Billing Dashboard"
                  className="w-[540px] max-w-full h-auto rounded-[1.8rem] shadow-sm grayscale-[0.1]"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070";
                    e.target.style.opacity = "0.4";
                  }}
                />
              </div>

              {/* Minimalist Floating Tags */}
              <div className="absolute -top-6 right-10 z-20 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl">
                Revenue Safe
              </div>

              <div className="absolute -bottom-8 left-10 z-20 bg-white border border-black/5 text-black px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl">
                99.9% SLM
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Featured Brands / Social Proof Area (Clean Alignment) */}
      <section className="max-w-7xl mx-auto px-10 py-20 bg-black/50 backdrop-blur-md border-t border-white/5">
        <div className="flex flex-col gap-10">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] text-center">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-60 invert">
            <div className="text-2xl font-black italic tracking-tighter text-white">
              S-COMP
            </div>
            <div className="text-2xl font-black italic tracking-tighter text-white">
              FIN-X
            </div>
            <div className="text-2xl font-black italic tracking-tighter text-white">
              REVENUE.LY
            </div>
            <div className="text-2xl font-black italic tracking-tighter text-white">
              BILL.IO
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes slide-up {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up {
            animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>
    </div>
  );
}

export default HomePage