import React from 'react';
import { FaUsers, FaCalendarAlt, FaChartLine, FaShieldAlt, FaMobileAlt, FaBell, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FaUsers className="text-4xl text-blue-600 mb-4" />,
    title: "Clubs & Communities Hub",
    description: "Discover all WCE clubs and communities in one place — from technical to cultural, explore what matches your passion."
  },
  {
    icon: <FaCalendarAlt className="text-4xl text-blue-600 mb-4" />,
    title: "Event Management",
    description: "Stay updated with every workshop, seminar, and fest at WCE. Register, track, and manage events seamlessly."
  },
  {
    icon: <FaChartLine className="text-4xl text-blue-600 mb-4" />,
    title: "Student Growth & Engagement",
    description: "Engage in opportunities that boost your leadership, creativity, and collaboration skills."
  },
  {
    icon: <FaShieldAlt className="text-4xl text-blue-600 mb-4" />,
    title: "Secure & Reliable",
    description: "Built with modern security standards to ensure safe access for all students and clubs."
  },
  {
    icon: <FaMobileAlt className="text-4xl text-blue-600 mb-4" />,
    title: "Responsive Design",
    description: "Access OrbitWCE anytime, anywhere — on desktop or mobile, with an elegant, responsive interface."
  },
  {
    icon: <FaBell className="text-4xl text-blue-600 mb-4" />,
    title: "Instant Notifications",
    description: "Receive real-time updates about new events, announcements, and opportunities directly from WCE clubs."
  }
];

const About = () => {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About OrbitWCE
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12">
            A unified digital platform for all clubs, communities, and events at Walchand College of Engineering.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-300 mb-8">
            At OrbitWCE, our mission is to bring every WCE club, event, and student initiative into one connected ecosystem.
            We aim to simplify event discovery, participation, and collaboration, helping students engage meaningfully beyond academics.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Why OrbitWCE?</h2>
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
                  title: "Sign Up as a Student",
                  description: "Create your OrbitWCE account using your WCE email and get access to all events and clubs."
                },
                {
                  step: "2",
                  title: "Explore Clubs",
                  description: "Browse and follow WCE’s clubs and communities — from technical to cultural and social."
                },
                {
                  step: "3",
                  title: "Register for Events",
                  description: "Join college fests, workshops, and competitions with just one click."
                },
                {
                  step: "4",
                  title: "Connect & Collaborate",
                  description: "Engage with club members, share experiences, and grow your network at WCE."
                }
              ].map((item, index) => (
                <div key={index} className="relative mb-12">
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl z-10">
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
          <FaGlobe className="text-5xl text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Be Part of WCE’s Orbit</h2>
          <p className="text-xl text-gray-300 mb-8">
            One hub for every club, event, and opportunity — stay connected with the pulse of WCE campus life.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
