import React from 'react'

const ServiceCard = () => {
    const services = [
        { icon: "📈", title: "Lead Tracking", description: "Monitor lead status, activity, and engagement throughout the sales pipeline with our intuitive tracking system." },
        { icon: "📊", title: "Advanced Analytics", description: "Gain valuable insights into your sales performance with customizable reports and real-time dashboards." },
        { icon: "🔔", title: "Smart Notifications", description: "Never miss a follow-up with timely reminders and automated notifications based on lead activity." },
        { icon: "📱", title: "Mobile Access", description: "Manage your leads on the go with our fully responsive mobile application for iOS and Android." },
        { icon: "🔄", title: "Integration", description: "Seamlessly connect with your existing CRM, email marketing, and customer service tools." },
        { icon: "🛡️", title: "Data Security", description: "Rest easy knowing your valuable lead data is protected with enterprise-grade security measures." }
    ];

    return (
        <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-[#034050] mb-2">Our Services</h2>
                <div className="w-24 h-1 bg-[#055063] mx-auto mb-12 rounded-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="p-6 bg-white rounded-lg shadow-lg text-center">
                            <div className="text-4xl">{service.icon}</div>
                            <h3 className="text-xl font-semibold text-[#034757] mt-4">{service.title}</h3>
                            <p className="mt-2 text-gray-600">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


export default ServiceCard


