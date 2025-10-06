import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUsers,
  FaCode,
  FaMusic,
  FaFutbol,
  FaUserTie,
  FaLinkedin,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { motion } from "framer-motion";
import AuthContext from "../../AuthContext/AuthContext";

// import ScrollToTop from "../../Components/ScrollToTop/ScrollToTop";

import mentorImg from "../../assets/team/mentor.jpeg";
import rutuja from "../../assets/team/rutuja.jpg";
import deepmala from "../../assets/team/deepmala.jpg";
import pranav from "../../assets/team/pranav.jpg";

// Dummy data for communities (will be replaced with real data)
const dummyCommunities = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Community ${i + 1}`,
  description: `This is a sample description for Community ${
    i + 1
  }. Join us for amazing events and networking opportunities.`,
  members: Math.floor(Math.random() * 1000) + 100,
  category: ["Technical", "Social", "Cultural", "Sports"][
    Math.floor(Math.random() * 4)
  ],
}));

// Dummy data for events
const events = [
  {
    id: 1,
    title: "Tech Conference 2023",
    date: "2023-12-15",
    type: "Technical",
    description: "Annual technology conference with industry leaders.",
  },
  {
    id: 2,
    title: "Cultural Fest",
    date: "2023-11-20",
    type: "Cultural",
    description: "Celebrating diverse cultures with performances and food.",
  },
  {
    id: 3,
    title: "Sports Day",
    date: "2023-10-10",
    type: "Sports",
    description: "Annual sports competition for all members.",
  },
  {
    id: 4,
    title: "Networking Mixer",
    date: "2023-11-05",
    type: "Social",
    description: "Meet and network with professionals.",
  },
  {
    id: 5,
    title: "Hackathon",
    date: "2023-12-01",
    type: "Technical",
    description: "48-hour coding competition.",
  },
];

// Team members data
const teamMembers = [
  {
    id: 1,
    name: "Rutuja Patil",
    image: rutuja,
    role: "Developer",
    bio: "Enthusiastic full-stack developer with a focus on building user-friendly and scalable web applications.",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/rutuja-patil-2762b3310?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      // twitter: '#',
      // github: '#'
    },
  },
  {
    id: 2,
    name: "Deepmala Khot",
    image: deepmala,
    role: "Developer",
    bio: "Passionate coder who enjoys solving problems and experimenting with new technologies in MERN stack.",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/deepmala-khot-671486292?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      // twitter: '#',
      // github: '#'
    },
  },
  {
    id: 3,
    name: "Pranav Gujar",
    image: pranav,
    role: "Developer",
    bio: "Creative developer committed to delivering reliable solutions and collaborating to bring ideas to life.",
    socials: {
      linkedin: "https://www.linkedin.com/in/pranav-gujar-54551b226/",
      // twitter: '#',
      // github: '#'
    },
  },
];

// Mentor data
const mentor = {
  name: "Ms. N. L. Mudegol",
  image: mentorImg,
  role: "Mentor",
  bio: "Assistant Professor in department Of CSE, Apple Certified Trainer, Research Scholar at VIT Bhopal University.",
  socials: [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/nandini-mudegol-430a2927/",
      icon: <FaLinkedin size={20} />,
    },
    // { name: 'Twitter', url: '#', icon: <FaTwitter size={20} /> },
    // { name: 'LeetCode', url: '#', icon: <SiLeetcode size={20} /> },
    // { name: 'GitHub', url: '#', icon: <FaGithub size={20} /> },
  ],
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCommunities, setVisibleCommunities] = useState(6);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommunityUsers();
  }, []);

  const fetchCommunityUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/community`
      );
      const data = await response.json();

      if (data.success) {
        setCommunities(data.data);
      } else {
        setError("Failed to load community users");
        setCommunities(dummyCommunities); // Fallback to dummy data
      }
    } catch (err) {
      console.error("Error fetching community users:", err);
      setError("Failed to load community users");
      setCommunities(dummyCommunities); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    activeFilter === "All"
      ? events
      : events.filter((event) => event.type === activeFilter);

  const loadMoreCommunities = () => {
    setVisibleCommunities((prev) => Math.min(prev + 3, communities.length));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center justify-center  overflow-hidden">
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 min-h-[1.2em] flex justify-center">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: [0.6, 0.01, 0.1, 0.9] }}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                Welcome to OrbitWCE
              </motion.span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our communities to connect, learn, and grow together.
              Participate in events, share knowledge, and build meaningful
              connections.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!user && (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Join Now
                </button>
              )}
              <button
                onClick={() => navigate("/about")}
                className="border border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Communities */}
      <section className="py-16 ">
        <div className="container mx-auto px-4 text-gray-100">
          <motion.h2
            className="font-bold text-center  text-3xl text-gray-100"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            WCE Communities
          </motion.h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-300">Loading communities...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 mt-5">
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchCommunityUsers}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && communities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">
                No community users found yet.
              </p>
              <p className="text-gray-400 mt-2">
                Check back later or contact an administrator.
              </p>
            </div>
          )}

          {!loading && communities.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
                {communities
                  .slice(0, visibleCommunities)
                  .map((community, index) => (
                    <motion.div
                      key={community._id || community.id}
                      className="relative border border-gray-200 rounded-lg overflow-hidden bg-transparent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:-translate-y-1"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Community
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-200">
                          {community.name}
                        </h3>
                        <p className="text-slate-300 mb-4">
                          {community.bio ||
                            community.motto ||
                            `Welcome to ${community.name}'s community. Join us for amazing events and networking opportunities.`}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">
                            {community.role || "Community"}
                          </span>
                          <button
                            onClick={() =>
                              navigate(
                                `/community/${community._id || community.id}`
                              )
                            }
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
              {visibleCommunities < communities.length && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreCommunities}
                    className="px-6 py-2 border border-gray-400 text-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Load More Communities
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-gray-100">
          <motion.h2
            className="text-3xl text-gray-100 font-bold text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Team
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className="relative border border-gray-200 rounded-lg overflow-hidden bg-transparent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:-translate-y-1 p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-300">
                  {/* {member.name.charAt(0)} */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-200">
                  {member.name}
                </h3>
                <p className="text-blue-500 font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 mb-6">{member.bio}</p>
                <div className="flex justify-center space-x-5">
                  <a
                    href={member.socials.linkedin}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin size={20} />
                  </a>
                  {/* <a href={member.socials.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <FaTwitter size={20} />
                  </a>
                  <a href={member.socials.github} className="text-gray-400 hover:text-white transition-colors">
                    <FaGithub size={20} />
                  </a> */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-gray-100">
          <motion.h2
            className="text-3xl text-gray-100 font-bold text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Mentor
          </motion.h2>
          <div className="flex justify-center">
            <motion.div
              className="relative border border-gray-200 rounded-lg overflow-hidden bg-transparent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:-translate-y-1 w-full max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center">
                  <motion.div
                    className="md:w-1/3 mb-6 md:mb-0"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-40 h-40 mx-auto rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </motion.div>
                  </motion.div>
                  <div className="md:w-2/3 md:pl-8 text-center md:text-left">
                    <motion.h3
                      className="text-2xl font-bold text-gray-200 mb-2"
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {mentor.name}
                    </motion.h3>
                    <motion.p
                      className="text-blue-400 font-medium mb-4"
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {mentor.role}
                    </motion.p>
                    <motion.p
                      className="text-gray-300 mb-6"
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      {mentor.bio}
                    </motion.p>

                    <motion.div
                      className={`flex ${
                        mentor.socials.length === 1
                          ? "justify-center"
                          : "justify-start md:justify-start"
                      } items-center space-x-6`}
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {mentor.socials.map((social, index) => (
                        <motion.a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          whileHover={{ y: -3, scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                        >
                          {social.icon}
                        </motion.a>
                      ))}
                    </motion.div>

                    {/* <motion.div 
                      className="flex justify-center md:justify-start space-x-6"
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {mentor.socials.map((social, index) => (
                        <motion.a 
                          key={index} 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          whileHover={{ y: -3, scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                          {social.icon}
                        </motion.a>
                      ))}
                    </motion.div> */}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
