

import React from 'react';

const About = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#055063] mb-2">About Our Lead Tracking System</h2>
          <div className="w-20 h-1 bg-[#055063] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Streamline your sales process and maximize conversion rates with our comprehensive solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-[#055063]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015-2.234V11z"></path>
              </svg>
            </div>
            <h3 className="text-xl text-[#055063] font-semibold text-center mb-2">Lead Management</h3>
            <p className="text-gray-600 text-center">
              Efficiently organize, categorize, and prioritize your leads. Never miss an opportunity with our intuitive management system.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-[#055063]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
            </div>
            <h3 className="text-xl text-[#055063] font-semibold text-center mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 text-center">
              Gain valuable insights with powerful analytics. Track conversion rates, identify trends, and make data-driven decisions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-[#055063]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"></path>
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl text-[#055063] font-semibold text-center mb-2">Automated Workflows</h3>
            <p className="text-gray-600 text-center">
              Automate repetitive tasks and follow-ups. Keep your team focused on what matters most—building relationships and closing deals.
            </p>
          </div>
        </div>
        </div>
    </section>
  );
};

export default About;

// import React from 'react';

// const About = () => {
//   return (
//     <ection className="bg-gradient-to-b from-blue-50 to-white py-16">
//       <div className="container mx-auto px-4 max-w-6xl">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl font-bold text-blue-800 mb-2">About Our Lead Tracking System</h2>
//           <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
//           <p className="text-gray-600 text-lg max-w-3xl mx-auto">
//             Streamline your sales process and maximize conversion rates with our comprehensive solution.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
//           <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
//             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
//               <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015-2.234V11z"></path>
//               </svg>
//             </div>
//             <h3 className="text-xl text-blue-800 font-semibold text-center mb-2">Lead Management</h3>
//             <p className="text-gray-600 text-center">
//               Efficiently organize, categorize, and prioritize your leads. Never miss an opportunity with our intuitive management system.
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
//             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
//               <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
//                 <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
//               </svg>
//             </div>
//             <h3 className="text-xl text-blue-800 font-semibold text-center mb-2">Real-time Analytics</h3>
//             <p className="text-gray-600 text-center">
//               Gain valuable insights with powerful analytics. Track conversion rates, identify trends, and make data-driven decisions.
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
//             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
//               <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
//                 <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"></path>
//                 <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
//               </svg>
//             </div>
//             <h3 className="text-xl text-blue-800 font-semibold text-center mb-2">Automated Workflows</h3>
//             <p className="text-gray-600 text-center">
//               Automate repetitive tasks and follow-ups. Keep your team focused on what matters most—building relationships and closing deals.
//             </p>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="md:w-1/2 p-8">
//             <h3 className="text-2xl font-bold text-blue-800 mb-4">Why Choose Our Solution?</h3>
//             <ul className="space-y-3">
//               <li className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//                 </svg>
//                 <span className="text-gray-700">Increase sales conversion by up to 35%</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//                 </svg>
//                 <span className="text-gray-700">Reduce lead response time by 60%</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//                 </svg>
//                 <span className="text-gray-700">Seamless integration with your existing tools</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//                 </svg>
//                 <span className="text-gray-700">Cloud-based access from anywhere, anytime</span>
//               </li>
//             </ul>
//             <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300">
//               Learn More
//             </button>
//           </div>
//           <div className="md:w-1/2 bg-blue-100 p-8 flex items-center justify-center">
//             <div className="text-center">
//               <h4 className="text-xl font-bold text-blue-800 mb-2">Trusted by 500+ Companies</h4>
//               <p className="text-gray-600 mb-4">Join industry leaders who've transformed their sales process</p>
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold">Logo 1</div>
//                 <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold">Logo 2</div>
//                 <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold">Logo 3</div>
//                 <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold">Logo 4</div>
//                 <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold">Logo 5</div>
//                 <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold">Logo 6</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ection>
//   );
// };

// export default About;