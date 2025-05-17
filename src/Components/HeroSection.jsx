import React from 'react'
// import image from '../assets/istockphoto'
import image from "../assets/crm_image.jpg";

import About from './About';
import Footer from './Footer';
import ServiceCard from './ServiceCard';
import Contact from './Contact';
import { NavLink } from 'react-router-dom';



const HeroSection = () => {
    return (
<>
        <section id="hero" className="pt-32 pb-16 bg-gradient-to- r h-screen bg-gradient-to-r
        from-[#006e89]   via-white to-[#98411a]">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 mt-[100px]">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Track and Convert Your <span className="  text-[#98411a]">Sales Leads</span> Effectively</h1>
                        <p className="text-lg text-gray-700 mb-8">LeadTrack helps sales teams organize, track, and convert leads into customers with our powerful yet intuitive lead management system.</p>
                       <NavLink to="/dashboard-panel"> <button className="px-6 py-3 bg-[#045266] text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition transform hover:-translate-y-0.5 shadow-md">Get Started Today</button></NavLink>
                    </div>
                    <div className="flex-1 ml-[-40px] mr-[-20px]">
                        <img src={image} alt="Sales Lead Management Dashboard" className=" h-[450px] rounded-lg shadow-xl w-[1800px] mr-5 " />
                    </div>
                </div>
            </div>

        </section>
        <About/>
        <ServiceCard/>
        <Contact/>
        <Footer/>
            </>

    );
};

export default HeroSection;
