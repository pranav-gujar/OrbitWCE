import { useContext, useEffect, useState } from "react";
import { BiLogInCircle, BiSolidLogInCircle } from "react-icons/bi";
import {
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaHome,
  FaLock,
  FaRegUserCircle,
  FaTimes,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../../AuthContext/AuthContext";
import { showError, showSuccess } from "../../utils/toast";
import NotificationIndicator from "../Notification/NotificationIndicator";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";

// Add scroll effect for navbar
const useScrollEffect = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
};

const Navbar = () => {
  const { handleSubmit, isAuthenticated, user, setUser, setIsAuthenticated } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollEffect();

  // Helper function to clear authentication state
  const clearAuthState = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof setUser === "function") setUser(null);
    if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found in localStorage");
        // Even if there's no token, we should still clear the auth state
        clearAuthState();
        navigate("/login");
        return;
      }

      console.log(
        "Attempting logout with token:",
        token.substring(0, 10) + "..."
      );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Important for clearing httpOnly cookies
      });

      const data = await response.json();
      const status = response.status;

      // Always clear the auth state on the client side, regardless of the response
      clearAuthState();

      if (status === 200) {
        showSuccess(data.message || "Successfully logged out");
      } else {
        console.error("Logout failed:", data.message || "Unknown error");
        showError(data.message || "Failed to log out");
      }

      // Always navigate to login after logout
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear the auth state
      clearAuthState();
      showError("An error occurred during logout");
      navigate("/login");
    } finally {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    // Add event listener for route changes
    const unlisten = () => {
      window.addEventListener("popstate", handleRouteChange);
      return () => window.removeEventListener("popstate", handleRouteChange);
    };

    return unlisten();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector("nav");
      const menuButton = document.querySelector("[aria-expanded]");

      if (
        isMenuOpen &&
        nav &&
        menuButton &&
        !nav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-transparent backdrop-blur-md transition-all duration-500 ease-in-out border-b border-transparent hover:border-gray-200/20"
      style={{ overflow: "visible" }}
    >
      {/* Animated background overlay that appears on scroll */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-blue-900/5 transition-all duration-700 ${
          isScrolled ? "opacity-0" : "opacity-0"
        }`}
        style={{
          backgroundSize: isScrolled ? "200% 200%" : "100% 100%",
          animation: isScrolled ? "gradientBG 15s ease infinite" : "none",
        }}
      ></div>
      <div
        className="relative w-full px-4 sm:px-6 lg:px-8"
        style={{ overflow: "visible" }}
      >
        <div
          className="relative flex justify-between items-center h-16 md:h-20 mx-auto max-w-7xl transition-all duration-300"
          style={{ overflow: "visible" }}
        >
          {/* Logo with animation */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1 group transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src="/ProjectLogo.png"
                  alt="PGT Logo"
                  className="h-28 w-auto "
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - hides below 1050px */}
          <div className="hidden min-[1050px]:flex items-center ml-6 space-x-1 xl:space-x-3 flex-wrap">
            {user?.role !== "superadmin" && (
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`
                }
                style={{
                  transform: "translateY(0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <FaHome className="mr-1.5 flex-shrink-0" />
                <span>Home</span>
              </NavLink>
            )}
            {user?.role !== "superadmin" && (
              <>
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                      isActive
                        ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`
                  }
                  style={{
                    transform: "translateY(0)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains("active")) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains("active")) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <FaCalendarAlt className="mr-1.5 flex-shrink-0" />
                  <span>Events</span>
                </NavLink>
                {user?.role === "community" && (
                  <NavLink
                    to="/messages"
                    className={({ isActive }) =>
                      `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                        isActive
                          ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`
                    }
                    style={{
                      transform: "translateY(0)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains("active")) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains("active")) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <FaUsers className="mr-1.5 flex-shrink-0" />
                    <span>Messages</span>
                  </NavLink>
                )}
              </>
            )}
            {user?.role === "superadmin" && (
              <NavLink
                to="/superadmin"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`
                }
                style={{
                  transform: "translateY(0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <FaUsers className="mr-1.5 flex-shrink-0" />
                <span>Users</span>
              </NavLink>
            )}
            {user?.role === "superadmin" && (
              <NavLink
                to="/superadmin/deletion-requests"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`
                }
                style={{
                  transform: "translateY(0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <FaCalendarAlt className="mr-1.5 flex-shrink-0" />
                <span>Deletion Requests</span>
              </NavLink>
            )}
            {user?.role === "superadmin" && (
              <NavLink
                to="/superadmin/reports"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`
                }
                style={{
                  transform: "translateY(0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <FaChartLine className="mr-1.5 flex-shrink-0" />
                <span>Reports</span>
              </NavLink>
            )}
            {user?.role === "community" && (
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`
                }
                style={{
                  transform: "translateY(0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <FaChartLine className="mr-1.5 flex-shrink-0" />
                <span>Reports</span>
              </NavLink>
            )}
            {user?.role === "superadmin" && (
              <NavLink
                to="/superadmin/permissions"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`
                }
                style={{
                  transform: "translateY(0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <FaLock className="mr-1.5 flex-shrink-0" />
                <span>Permissions</span>
              </NavLink>
            )}

            {isAuthenticated && user ? (
              <>
                {user.role !== "superadmin" && (
                  <div className="mr-4 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative mr-5">
                      <NotificationIndicator />
                    </div>
                  </div>
                )}
                <ProfileDropdown user={user} onLogout={handleLogout} />
              </>
            ) : (
              <div className="flex space-x-2 lg:space-x-4 ml-2">
                <Link
                  to="/login"
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <BiLogInCircle className="mr-1.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-red-600 border border-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <BiSolidLogInCircle className="mr-1.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - shows below 1050px */}
          <div className="max-[1049px]:block hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? "Close main menu" : "Open main menu"}
              </span>
              {isMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - shows when isMenuOpen is true */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 max-[1049px]:block hidden transition-all duration-300 ease-in-out w-full ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible h-0"
        }`}
      >
        <div className="w-full px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-white shadow-lg border-t border-gray-200/30 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {user?.role !== "superadmin" && (
            <NavLink
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                  isActive
                    ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              <FaHome className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Home</span>
            </NavLink>
          )}
          {user?.role !== "superadmin" && (
            <>
              <NavLink
                to="/events"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`
                }
              >
                <FaCalendarAlt className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Events</span>
              </NavLink>
              {user?.role === "community" && (
                <NavLink
                  to="/messages"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                      isActive
                        ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`
                  }
                >
                  <FaUsers className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>Messages</span>
                </NavLink>
              )}
            </>
          )}
          {user?.role === "superadmin" && (
            <NavLink
              to="/superadmin"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                  isActive
                    ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              <FaUsers className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Users</span>
            </NavLink>
          )}
          {user?.role === "superadmin" && (
            <NavLink
              to="/superadmin/deletion-requests"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                  isActive
                    ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              <FaCalendarAlt className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Deletion Requests</span>
            </NavLink>
          )}
          {user?.role === "superadmin" && (
            <NavLink
              to="/superadmin/permissions"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                  isActive
                    ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              <FaLock className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Permissions</span>
            </NavLink>
          )}
          {user?.role !== 'user' && (
            <NavLink
              to={
                user?.role === "superadmin"
                  ? "/superadmin/reports"
                  : "/reports"
              }
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-base font-medium flex items-center transition-all duration-300 ${
                  isActive
                    ? "text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              <FaUserTie className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Reports</span>
            </NavLink>
          )}
          {user?.role !== "superadmin" && (
            <NavLink
              to="/notifications"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-md text-base font-medium flex items-center ${
                  isActive
                    ? "text-violet-500 font-semibold"
                    : "text-sky-500 hover:text-sky-700"
                }`
              }
            >
              <FaBell className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-500 flex-shrink-0" />
              <span>Notifications</span>
            </NavLink>
          )}
          {/* {user?.role === 'user' && (
            <NavLink 
                to="/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `px-4 py-3 rounded-md text-base font-medium flex items-center ${isActive ? 'text-violet-500 font-semibold' : 'text-sky-500 hover:text-sky-700'}`}
            >
                <FaChartLine className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-500 flex-shrink-0" />
                <span>Dashboa</span>
            </NavLink>
    )} */}

          <div className="pt-4 pb-2 border-t border-gray-200 mt-2">
            {isAuthenticated && user ? (
              <div className="space-y-3">
               
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <FaRegUserCircle className="h-10 w-10 text-indigo-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email || ""}
                    </div>
                  </div>
                </Link>
                
               
                <button
                  onClick={(e) => {
                    handleLogout(e);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <BiLogInCircle className="mr-2.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-indigo-600 rounded-md shadow-sm text-base font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <BiSolidLogInCircle className="mr-2.5" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <style data-jsx="true" data-global="true">{`
        @keyframes gradientBG {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .nav-link-active {
          position: relative;
          overflow: hidden;
        }
        .nav-link-active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
        }
        .nav-link-active:hover::after {
          width: 80%;
          left: 10%;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
