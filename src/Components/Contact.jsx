import React from 'react'

const Contact = () => {
  return (
    
          <section id="contact" className="py-20 bg-white flex justify-between">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-[#034859] mb-2">Contact Us</h2>
              <div className="w-10 h-1 bg-[#034859] mx-auto mb-12 rounded-full"></div>
              <div className="flex flex-col lg:flex-row gap-30">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#034859] mt-9 mb-4">Get In Touch</h3>
                  <p className="text-gray-600 mb-6">Have questions about LeadTrack? Our team is here to help you find the perfect lead tracking solution for your business.</p>
                  <p className="text-gray-600 mb-2"><span className="font-bold">Email:</span> info@leadtrack.com</p>
                  <p className="text-gray-600 mb-2"><span className="font-bold">Phone:</span> +1 (555) 123-4567</p>
                  <p className="text-gray-600"><span className="font-bold">Address:</span> 123 Business Ave, Suite 200, San Francisco, CA 94107</p>
                </div>
                <div className="flex-2 bg-white p-8 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-2xl font-bold text-[#034859] mb-6">Send Us a Message</h3>
                  <form>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                      <input type="text" id="name" placeholder="Your name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-transparent" required />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                      <input type="email" id="email" placeholder="Your email address" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-transparent" required />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                      <input type="text" id="subject" placeholder="Subject" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1  focus:border-transparent" />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                      <textarea id="message" placeholder="Your message" rows="5" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-transparent" required></textarea>
                    </div>
                    <button type="submit" className="w-full rounded px-6 py-3 text-white bg-[#034859] transition shadow-md">Send Message</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        );
      };
      
    
    //         <section className="bg-gray-200 py-16 px-6 max-w-10xl mx-auto text-center">
    //             <h2 className="text-3xl font-bold text-gray-900">Contact & Support</h2>
    //             <p className="mt-4 text-gray-700">Need help? Reach out to our support team.</p>
    //             <form className="mt-8 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
    //                 <div className="mb-4">
    //                     {/* <label className="block text-gray-700 font-medium">Name</label> */}
    //                     <input type="text" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Your Name" />
    //                 </div>
    //                 <div className="mb-4">
    //                     {/* <label className="block text-gray-700 font-medium">Email</label> */}
    //                     <input type="email" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Your Email" />
    //                 </div>
    //                 <div className="mb-4">
    //                     {/* <label className="block text-gray-700 font-medium">Message</label> */}
    //                     <textarea className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Your Message" rows="4"></textarea>
    //                 </div>
    //                 <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">Send Message</button>
    //             </form>
    //         </section>
    //     );
    // };
  


export default Contact