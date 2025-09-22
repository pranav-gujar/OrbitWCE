import { useContext, useState, useEffect } from "react";
import AuthContext from "../../AuthContext/AuthContext";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaEdit,
  FaGlobe,
  FaQuoteLeft,
  FaUserFriends,
  FaPlus,
  FaTrash,
  FaBell,
  FaUserCog,
  FaSignOutAlt,
  FaUser,
  FaLinkedin,
  FaGithub,
  FaTwitter,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../../utils/toast";
import socket from "../../socket";

const Profile = () => {
  const { user, updateUserProfile, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Determine the API endpoint based on user role
      const endpoint = user.role === 'community' 
        ? '/api/users/profile/update' 
        : '/api/users/profile/user';
      
      // Prepare the request body
      const requestBody = {
        ...formData,
        // If there's a preview image (new photo), include it
        ...(previewImage && { photo: previewImage })
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update the user profile in the context
      updateUserProfile(data.data);
      
      // Show success message
      showSuccess('Profile updated successfully!');
      
      // Reset preview image if any
      setPreviewImage(null);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.match('image.*')) {
      showError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      // First, upload the image to get a URL
      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      // Set the preview image with the new URL
      setPreviewImage(uploadData.url);
      
      // Update the form data with the new photo URL
      setFormData(prev => ({
        ...prev,
        photo: uploadData.url
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image. Please try again.');
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    photo: "",
    bio: "",
    motto: "",
    website: "",
    teamMembers: [],
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    role: "",
    bio: "",
    photo: "",
    linkedin: "",
    github: "",
    twitter: "",
    website: ""
  });
  const [teamMemberPhoto, setTeamMemberPhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newEventNotifications, setNewEventNotifications] = useState([]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Only set form data if we have user data
    if (user) {
      console.log('User data:', user);
      console.log('Team members:', user.teamMembers);
      setFormData({
        photo: user.photo || "",
        bio: user.bio || "",
        motto: user.motto || "",
        website: user.website || "",
        teamMembers: user.teamMembers || [],
      });
      setPreviewImage(user.photo || null);
      setIsLoading(false);
    } else {
      // If we don't have user data but should be authenticated, try to fetch it
      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            setFormData({
              photo: result.data.photo || "",
              bio: result.data.bio || "",
              motto: result.data.motto || "",
              website: result.data.website || "",
              teamMembers: result.data.teamMembers || [],
            });
            setPreviewImage(result.data.photo || null);
          } else {
            throw new Error('Failed to load profile data');
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          showError('Failed to load profile data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserProfile();
    }

    // Fetch notifications in parallel
    fetchNewEventNotifications();
  }, [user, isAuthenticated, authLoading, navigate]);
  
  // Listen for profile updates via socket
  useEffect(() => {
    // Setup socket listener for profile updates
    const handleProfileUpdated = (updatedProfile) => {
      console.log('Received profile_updated event:', updatedProfile);
      
      // Only update if this is the current user's profile or we're viewing someone else's profile
      if (user && updatedProfile._id === user._id) {
        console.log('Updating profile data from socket event');
        
        // Update the local form data
        setFormData({
          photo: updatedProfile.photo || "",
          bio: updatedProfile.bio || "",
          motto: updatedProfile.motto || "",
          website: updatedProfile.website || "",
          teamMembers: updatedProfile.teamMembers || [],
        });
        
        // Update preview image if needed
        setPreviewImage(updatedProfile.photo || null);
        
        // Store updated user in localStorage to persist changes
        localStorage.setItem('user', JSON.stringify(updatedProfile));
      }
    };
    
    // Register socket event listener
    socket.on('profile_updated', handleProfileUpdated);
    
    // Clean up the listener when component unmounts
    return () => {
      socket.off('profile_updated', handleProfileUpdated);
    };
  }, [user]);

  const fetchNewEventNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Filter for new event notifications that are not read
        const newEvents = data.data.filter(
          (notification) =>
            notification.type === "new_event" && !notification.isRead
        );
        setNewEventNotifications(newEvents);
      }
    } catch (error) {
      console.error("Error fetching new event notifications:", error);
      showError("Error fetching notifications");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamMemberChange = (e) => {
    const { name, value } = e.target;
    
    // Handle social links separately
    if (['linkedin', 'github', 'twitter', 'website'].includes(name)) {
      setNewTeamMember(prev => ({
        ...prev,
        socialLinks: {
          ...(prev.socialLinks || {}),
          [name]: value
        }
      }));
    } else {
      // Handle regular fields
      setNewTeamMember(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTeamMemberPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      // Set the preview image
      setTeamMemberPhoto(data.url);
      
      // Update the new team member data with the photo URL
      setNewTeamMember(prev => ({
        ...prev,
        photo: data.url
      }));
    } catch (error) {
      console.error('Error uploading team member photo:', error);
      showError('Failed to upload photo. Please try again.');
    }
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.name?.trim() || !newTeamMember.role?.trim()) {
      showError('Name and Role are required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the team member data with proper structure
      const teamMemberData = {
        name: newTeamMember.name.trim(),
        role: newTeamMember.role.trim(),
        bio: newTeamMember.bio?.trim() || '',
        photo: teamMemberPhoto || '',
        linkedin: newTeamMember.socialLinks?.linkedin?.trim() || '',
        github: newTeamMember.socialLinks?.github?.trim() || '',
        twitter: newTeamMember.socialLinks?.twitter?.trim() || '',
        website: newTeamMember.socialLinks?.website?.trim() || ''
      };

      console.log('Sending team member data:', teamMemberData);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamMemberData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add team member');
      }

      // If successful, update the form data with the new team member
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, data.data]
      }));

      // Reset the form
      setNewTeamMember({
        name: "",
        role: "",
        bio: "",
        photo: "",
        socialLinks: {
          linkedin: "",
          github: "",
          twitter: "",
          website: ""
        }
      });
      setTeamMemberPhoto(null);
      
      showSuccess('Team member added successfully!');
    } catch (error) {
      console.error('Error adding team member:', error);
      showError(error.message || 'Failed to add team member');
    }
  };

  const handleRemoveTeamMember = async (id) => {
    const updatedTeamMembers = formData.teamMembers.filter((member) => member._id !== id);
    
    try {
      const response = await updateUserProfile({ teamMembers: updatedTeamMembers });
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          teamMembers: updatedTeamMembers
        }));
        showSuccess('Team member removed successfully!');
      } else {
        showError(response.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      showError('An error occurred while removing team member');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setPreviewImage(base64Image);
        
        // Create a temporary form data with just the photo
        const tempFormData = { ...formData, photo: base64Image };
        
        try {
          const response = await updateUserProfile({ photo: base64Image });
          if (response.success) {
            setFormData(tempFormData);
            showSuccess('Profile picture updated!');
          } else {
            // Revert the preview if update fails
            setPreviewImage(user.photo);
            showError(response.error || 'Failed to update profile picture');
          }
        } catch (error) {
          console.error('Error updating profile picture:', error);
          setPreviewImage(user.photo);
          showError('An error occurred while updating your profile picture');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfile(formData);
      if (response.success) {
        setIsEditing(false);
        showSuccess('Profile updated successfully!');
      } else {
        showError(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("An error occurred while updating your profile");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Please log in to view your profile
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view this page
          </p>
          <a
            href="/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto ">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-md overflow-hidden ">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative">
            {user.role === "community" && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              >
                <FaEdit className="text-blue-600" />
              </button>
            )}
            {user.role === "community" ? (
              isEditing && (
                <div className="absolute -bottom-12 left-6">
                  <div className="w-36 h-36 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                    <span className="text-white text-5xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        <FaEdit className="text-white text-xl" />
                      </label>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="absolute -bottom-12 left-6">
                <div className="w-36 h-36 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-5xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div>
            <div className="flex flex-col lg:flex-row gap-6 mt-16">
  {/* Left Section */}
  <div className="flex-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl border-t-4 border-b-4 border-indigo-500 text-gray-100">
    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>

    <div className="flex items-center text-gray-500 mt-1">
      <FaEnvelope className="mr-2 text-sm" />
      <span>{user.email}</span>
    </div>

    <div className="flex items-center mt-2">
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          user.isVerified
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {user.isVerified ? "Verified" : "Unverified"}
      </span>
      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
        {user.role === "superadmin"
          ? "Admin"
          : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </span>
    </div>

    {user.role === "community" && user.motto && (
      <div className="mt-3 italic text-gray-600 flex">
        <FaQuoteLeft className="mr-2 text-gray-400" />
        <p>"{user.motto}"</p>
      </div>
    )}

    {user.role === "community" && user.website && (
      <div className="mt-2 flex items-center">
        <FaGlobe className="mr-2 text-gray-500" />
        <a
          href={user.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {user.website}
        </a>
      </div>
    )}
  </div>

  {/* Right Section */}
  <div className="flex-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl border-t-4 border-b-4 border-indigo-500 text-gray-100">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">
      Account Information
    </h2>
    <div className="space-y-3">
      <div>
        <p className="text-sm text-gray-500">Full Name</p>
        <p className="text-gray-400">{user.name || "Not provided"}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Email Address</p>
        <p className="text-gray-400">{user.email}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Account Status</p>
        <p className="text-gray-400">
          {user.isVerified ? (
            <span className="flex items-center text-green-600">
              <FaCheckCircle className="mr-1" /> Verified
            </span>
          ) : (
            <span className="flex items-center text-yellow-600">
              <FaTimesCircle className="mr-1" /> Not Verified
            </span>
          )}
        </p>
      </div>
    </div>
  </div>
</div>


              {user.role === "community" && (
                <div className="flex flex-col lg:flex-row gap-6 mt-5">
  {/* About Us */}
  {user.bio && (
    <div className="flex-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl border-t-4 border-b-4 border-indigo-500 text-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">About Us</h2>
      <p className="text-gray-400">{user.bio}</p>
    </div>
  )}

  {/* Team Members */}
  {user.teamMembers && user.teamMembers.length > 0 && (
    <div className="flex-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 rounded-xl border-t-4 border-b-4 border-indigo-500">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Team Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user.teamMembers.map((member, index) => (
          <div
            key={member._id || index}
            className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-gray-100"
          >
            <div className="flex items-start space-x-4">
             

              {/* Member Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-100">{member.name}</h3>
                    <p className="text-sm text-indigo-300">{member.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(member._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
                
                {member.bio && (
                  <p className="text-sm text-gray-300 mt-2">{member.bio}</p>
                )}

                {/* Social Links */}
                {(member.socialLinks?.linkedin || 
                  member.socialLinks?.github || 
                  member.socialLinks?.twitter || 
                  member.socialLinks?.website) && (
                  <div className="flex space-x-3 mt-3 pt-3 border-t border-white/10">
                    {member.socialLinks?.linkedin && (
                      <a 
                        href={`${member.socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="LinkedIn"
                      >
                        <FaLinkedin size={16} />
                      </a>
                    )}
                    {member.socialLinks?.github && (
                      <a 
                        href={`${member.socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                        title="GitHub"
                      >
                        <FaGithub size={16} />
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a 
                        href={`${member.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Twitter"
                      >
                        <FaTwitter size={16} />
                      </a>
                    )}
                    {member.socialLinks?.website && (
                      <a 
                        href={member.socialLinks.website.startsWith('http') ? 
                              member.socialLinks.website : 
                              `${member.socialLinks.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                        title="Website"
                      >
                        <FaGlobe size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pt-16 px-6 pb-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold ">
                  {user.name}
                </h1>
                <div className="flex items-center text-gray-400 mt-1">
                  <FaEnvelope className="mr-2 text-sm" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    Community
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Motto
                  </label>
                  <input
                    type="text"
                    name="motto"
                    value={formData.motto}
                    onChange={handleInputChange}
                    placeholder="Your community's motto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://your-website.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your community"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Team Members
                  </label>
                  <div className="space-y-3">
                    {formData.teamMembers.map((member, index) => (
                      <div
                        key={member._id || index}
                        className="flex items-start space-x-4 border rounded-md p-3 text-gray-400"
                      >
                        {/* Member Photo */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {member.photo ? (
                              <img 
                                src={member.photo} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-gray-400 text-2xl" />
                            )}
                          </div>
                        </div>
                        
                        {/* Member Details */}
                        <div className="flex-grow">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                          {member.bio && (
                            <p className="text-sm mt-1 mb-2">{member.bio}</p>
                          )}
                          
                          {/* Social Links */}
                          <div className="flex space-x-3 mt-2">
                            {member.socialLinks?.linkedin && (
                              <a 
                                href={`https://linkedin.com/in/${member.socialLinks.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600"
                              >
                                <FaLinkedin size={18} />
                              </a>
                            )}
                            {member.socialLinks?.github && (
                              <a 
                                href={`https://github.com/${member.socialLinks.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-gray-900"
                              >
                                <FaGithub size={18} />
                              </a>
                            )}
                            {member.socialLinks?.twitter && (
                              <a 
                                href={`https://twitter.com/${member.socialLinks.twitter}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-500"
                              >
                                <FaTwitter size={18} />
                              </a>
                            )}
                            {member.socialLinks?.website && (
                              <a 
                                href={member.socialLinks.website.startsWith('http') ? member.socialLinks.website : `https://${member.socialLinks.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <FaGlobe size={18} />
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(member._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}

                    <div className="border rounded-md p-3 text-gray-400">
                      <h4 className="text-sm font-medium mb-2">
                        Add Team Member
                      </h4>
                      <div className="space-y-3">
                        {/* Photo Upload */}
                        <div className="flex items-center space-x-4">
                          <div className="relative group">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {teamMemberPhoto ? (
                                <img 
                                  src={teamMemberPhoto} 
                                  alt="Team Member"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FaUser className="text-gray-400 text-2xl" />
                              )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                              <FaPlus size={12} />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleTeamMemberPhotoChange}
                              />
                            </label>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 mb-1">Upload a photo (optional)</p>
                            <p className="text-xs text-gray-500">JPG, PNG, max 5MB</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <input
                              type="text"
                              name="name"
                              value={newTeamMember.name}
                              onChange={handleTeamMemberChange}
                              placeholder="Full Name *"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                              
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <input
                              type="text"
                              name="role"
                              value={newTeamMember.role}
                              onChange={handleTeamMemberChange}
                              placeholder="Role/Position *"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                              <span className="px-3 text-gray-400  h-full flex items-center">
                                <FaLinkedin className="text-blue-600" />
                              </span>
                              <input
                                type="text"
                                name="linkedin"
                                value={newTeamMember.linkedin}
                                onChange={handleTeamMemberChange}
                                placeholder="LinkedIn Link"
                                className="w-full px-3 py-2 focus:outline-none text-gray-400"
                              />
                            </div>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                              <span className="px-3 text-gray-400  h-full flex items-center">
                                <FaGithub />
                              </span>
                              <input
                                type="text"
                                name="github"
                                value={newTeamMember.github}
                                onChange={handleTeamMemberChange}
                                placeholder="GitHub Link"
                                className="w-full px-3 py-2 focus:outline-none text-gray-400"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                              <span className="px-3 text-gray-400  h-full flex items-center">
                                <FaTwitter className="text-blue-400" />
                              </span>
                              <input
                                type="text"
                                name="twitter"
                                value={newTeamMember.twitter}
                                onChange={handleTeamMemberChange}
                                placeholder="Twitter Link"
                                className="w-full px-3 py-2 focus:outline-none text-gray-400"
                              />
                            </div>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                              <span className="px-3 text-gray-400  h-full flex items-center">
                                <FaGlobe className="text-gray-600" />
                              </span>
                              <input
                                type="url"
                                name="website"
                                value={newTeamMember.website}
                                onChange={handleTeamMemberChange}
                                placeholder="Personal website"
                                className="w-full px-3 py-2 focus:outline-none text-gray-400"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <textarea
                            name="bio"
                            value={newTeamMember.bio}
                            onChange={handleTeamMemberChange}
                            placeholder="Short bio (optional)"
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                          ></textarea>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddTeamMember}
                          disabled={!newTeamMember.name.trim() || !newTeamMember.role.trim()}
                          className={`flex items-center justify-center w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            !newTeamMember.name.trim() || !newTeamMember.role.trim()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <FaPlus className="mr-2" /> Add Team Member
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
               
                <div className="space-x-3 ">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
