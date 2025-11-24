import React from "react";
import NavigationBar from "../components/Navbar";
import ImageSearchComponent from "../components/ImageSearchComponent";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <NavigationBar />

      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Hero copy */}
          <div className="space-y-6 px-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 leading-tight">
              Book Reliable Bus Tickets
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              Fast, simple and secure booking for intercity buses. Find routes, select seats and
              complete payments in a few clicks — built for passengers and admins alike.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#search"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-md shadow-md transition"
              >
                Search Buses
              </a>
              <a
                href="/admin/login"
                className="inline-block bg-white border border-indigo-600 text-indigo-600 font-medium px-5 py-3 rounded-md shadow-sm hover:shadow-md transition"
              >
                Admin Panel
              </a>
            </div>
          </div>

          {/* Right: Search card (ImageSearchComponent) */}
          <div id="search" className="px-2">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <ImageSearchComponent />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <section className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Search</h3>
              <p className="text-sm text-slate-600">Enter source, destination and travel date.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Select Seat</h3>
              <p className="text-sm text-slate-600">Choose from live seat availability.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Confirm & Pay</h3>
              <p className="text-sm text-slate-600">Complete secure payment and get your ticket.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
