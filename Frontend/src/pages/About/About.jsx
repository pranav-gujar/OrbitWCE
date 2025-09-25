import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaChartLine, FaShieldAlt, FaMobileAlt, FaBell, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FaUsers className="text-4xl text-red-600 mb-4" />,
    title: "Community Building",
    description: "Connect with like-minded individuals and build meaningful relationships within specialized communities."
  },
  {
    icon: <FaCalendarAlt className="text-4xl text-red-600 mb-4" />,
    title: "Event Management",
    description: "Create, manage, and participate in events with our comprehensive event management tools."
  },
  {
    icon: <FaChartLine className="text-4xl text-red-600 mb-4" />,
    title: "Growth Opportunities",
    description: "Access resources and opportunities for personal and professional development."
  },
  {
    icon: <FaShieldAlt className="text-4xl text-red-600 mb-4" />,
    title: "Secure Platform",
    description: "Your data's security is our top priority with enterprise-grade security measures."
  },
  {
    icon: <FaMobileAlt className="text-4xl text-red-600 mb-4" />,
    title: "Mobile Friendly",
    description: "Access the platform on any device with our responsive design."
  },
  {
    icon: <FaBell className="text-4xl text-red-600 mb-4" />,
    title: "Real-time Notifications",
    description: "Stay updated with instant notifications about community activities and events."
  }
];

const About = () => {
  return (
    <div className="min-h-screen  text-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About PGT Global Networks
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12">
            Empowering communities through seamless connections and meaningful interactions
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 mb-8">
              At PGT Global Networks, we believe in the power of community. Our mission is to create a platform where individuals can connect, collaborate, and grow together in a secure and engaging environment.
            </p>
           
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose PGT Global Networks?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800 p-8 rounded-xl hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
             
              
              {[
                {
                  step: "1",
                  title: "Create an Account",
                  description: "Sign up and create your profile to join the PGT Global Networks community."
                },
                {
                  step: "2",
                  title: "Join Communities",
                  description: "Discover and join communities that match your interests and goals."
                },
                {
                  step: "3",
                  title: "Participate in Events",
                  description: "Attend virtual or in-person events, webinars, and workshops."
                },
                {
                  step: "4",
                  title: "Connect & Grow",
                  description: "Network with other members, share knowledge, and grow together."
                }
              ].map((item, index) => (
                <div key={index} className="relative mb-12">
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl z-10">
                      {item.step}
                    </div>
                    <div className={`flex-1 ${index % 2 === 0 ? 'ml-8 text-left' : 'mr-8 text-right'}`}>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <FaGlobe className="text-5xl text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Ready to Join Our Global Community?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Become part of a growing network of professionals, creators, and innovators from around the world.
          </p>
         
        </div>
      </section>

     
    </div>
  );
};

export default About;
