import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-md bg-indigo-500 flex items-center justify-center">
                                <span className="font-bold text-white">TK</span>
                            </div>
                            <span className="text-xl font-bold">TicketKatum</span>
                        </div>
                        <p className="text-slate-400 max-w-sm">
                            Your one-stop platform for all ticketing needs. Book buses, flights, movies, and hotels with ease and confidence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/buslist" className="text-slate-400 hover:text-white transition-colors">Book Tickets</Link></li>
                            <li><Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Contact</h3>
                        <ul className="space-y-2 text-slate-400">
                            <li>support@ticketkatum.com</li>
                            <li>+1 (555) 123-4567</li>
                            <li>Kathmandu, Nepal</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} TicketKatum. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
