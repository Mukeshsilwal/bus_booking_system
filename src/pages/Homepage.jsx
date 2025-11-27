import React, { useState } from "react";
import NavigationBar from "../components/Navbar";
import ImageSearchComponent from "../components/ImageSearchComponent";
import HotelSearchComponent from "../components/HotelSearchComponent";
import MovieSearchComponent from "../components/MovieSearchComponent";
import Footer from "../components/Footer";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('bus');

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="relative bg-indigo-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-900/40"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-slide-up">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  Travel with <span className="text-indigo-400">Comfort</span> <br />
                  & Confidence
                </h1>
                <p className="text-lg text-indigo-100 max-w-xl leading-relaxed">
                  Experience the most reliable intercity bus booking platform.
                  Choose your preferred seats, pay securely, and travel hassle-free.
                </p>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="#search"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-indigo-900 bg-white hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Book Now
                  </a>
                  <a
                    href="/admin/login"
                    className="inline-flex items-center px-6 py-3 border border-white/30 text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors duration-200 backdrop-blur-sm"
                  >
                    Admin Access
                  </a>
                </div>
              </div>

              <div id="search" className="relative animate-fade-in delay-100">
                {/* Tabs */}
                <div className="flex mb-4 bg-white/10 backdrop-blur-md rounded-lg p-1 w-fit mx-auto lg:mx-0 border border-white/20">
                  <button
                    onClick={() => setActiveTab('bus')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'bus'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    Bus Booking
                  </button>
                  <button
                    onClick={() => setActiveTab('hotel')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'hotel'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    Hotel Booking
                  </button>
                  <button
                    onClick={() => setActiveTab('movie')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'movie'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    Movie Ticket
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20">
                  <div className="bg-white rounded-xl overflow-hidden shadow-inner">
                    {activeTab === 'bus' && <ImageSearchComponent />}
                    {activeTab === 'hotel' && <HotelSearchComponent />}
                    {activeTab === 'movie' && <MovieSearchComponent />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features / How it works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Simple Booking Process</h2>
            <p className="mt-4 text-lg text-slate-600">Get your ticket in 3 easy steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Search",
                desc: "Enter your origin, destination, and travel date to find available buses.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              {
                title: "Select Seat",
                desc: "View real-time seat availability and choose the perfect spot for your journey.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                )
              },
              {
                title: "Pay & Go",
                desc: "Securely pay for your ticket and receive instant confirmation via email/SMS.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 text-center group">
                <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
