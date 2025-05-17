import React from 'react'

// const Footer = () => {
//     return (
//         <footer className="bg-gray-900 text-white py-12 px-6">
//             <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center md:text-left">
//                 <div>
//                     <h3 className="text-xl font-bold">SalesLeadTrack</h3>
//                     <p className="mt-2 text-gray-400">The best way to manage and track your sales leads.</p>
//                 </div>
//                 <div>
//                     <h3 className="text-lg font-semibold">Company</h3>
//                     <ul className="mt-2 space-y-2">
//                         <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
//                         <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
//                         <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
//                     </ul>
//                 </div>
//                 <div>
//                     <h3 className="text-lg font-semibold">Support</h3>
//                     <ul className="mt-2 space-y-2">
//                         <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
//                         <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
//                         <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
//                     </ul>
//                 </div>
//                 <div>
//                     <h3 className="text-lg font-semibold">Follow Us</h3>
//                     <div className="mt-2 flex justify-center md:justify-start space-x-4">
//                         <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
//                         <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
//                         <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
//                     </div>
//                 </div>
//             </div>
//             <div className="mt-8 text-center text-gray-500 text-sm">&copy; {new Date().getFullYear()} SalesLeadTrack. All rights reserved.</div>
//         </footer>
//     );
// };

const Footer = () => {
    return (
      <footer className="bg-[#022d38] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-indigo-300 mb-4">LeadTrack</h3>
              <p className="text-gray-300 mb-4">Your complete sales lead tracking and management solution designed to boost conversions and grow your business.</p>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-indigo-600 transition">🔗</a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-indigo-600 transition">🔗</a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-indigo-600 transition">🔗</a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-indigo-600 transition">🔗</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-indigo-300 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#hero" className="text-gray-300 hover:text-white transition">Home</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-white transition">About</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-white transition">Services</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-indigo-300 mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-white transition">Lead Tracking</a></li>
                <li><a href="#" className="text-gray-200 hover:text-white transition">Analytics & Reporting</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Mobile Application</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Integration</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Data Security</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Customer Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-indigo-300 mb-4">Newsletter</h3>
              <p className="text-gray-300 mb-4">Subscribe to our newsletter to receive updates and sales tips.</p>
              <form>
                <input type="email" placeholder="Your email address" className="w-full px-4 py-2 bg-white rounded-md text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                <button type="submit" className="w-full px-4 py-2 bg-[#034859] text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition shadow-md">Subscribe</button>
              </form>
            </div> 
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 LeadTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  };
  

export default Footer