import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../AuthContext/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { showSuccess, showError } from '../../utils/toast';
import './UserProfileEdit.css';

const UserProfileEdit = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        bio: '',
        photo: '',
        skills: [],
        socialLinks: {
            linkedin: '',
            portfolio: '',
            github: '',
            twitter: ''
        }
    });
    
    const [newSkill, setNewSkill] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                bio: user.bio || '',
                photo: user.photo || '',
                skills: user.skills || [],
                socialLinks: {
                    linkedin: user.socialLinks?.linkedin || '',
                    portfolio: user.socialLinks?.portfolio || '',
                    github: user.socialLinks?.github || '',
                    twitter: user.socialLinks?.twitter || ''
                }
            });
            if (user.photo) {
                setPreviewImage(user.photo);
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle nested socialLinks
        if (name.startsWith('socialLinks.')) {
            const socialMedia = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialMedia]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showError('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({
                    ...prev,
                    photo: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSkill = () => {
        if (newSkill.trim() !== '' && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update the user context with the new data
                setUser(prev => ({
                    ...prev,
                    ...data.data
                }));
                
                showSuccess('Profile updated successfully!');
                navigate('/profile');
            } else {
                showError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('An error occurred while updating your profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-profile-edit">
            <div className="profile-edit-header">
                <h2>Edit Profile</h2>
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/profile')}
                >
                    <FaTimes /> Cancel
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="profile-picture-section">
                    <div className="profile-picture-upload">
                        <div className="profile-avatar">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <FaUser size={40} />
                                </div>
                            )}
                        </div>
                        <div className="upload-controls">
                            <label className="btn btn-outline">
                                Change Photo
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {previewImage && (
                                <button 
                                    type="button" 
                                    className="btn btn-text"
                                    onClick={() => {
                                        setPreviewImage(null);
                                        setFormData(prev => ({ ...prev, photo: '' }));
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaUser /> Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label><FaEnvelope /> Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label><FaPhone /> Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label><FaMapMarkerAlt /> Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your address"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label><FaCalendarAlt /> Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>About</h3>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows="4"
                        />
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Skills</h3>
                    <div className="skills-input">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            placeholder="Add a skill and press Enter"
                        />
                        <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={handleAddSkill}
                        >
                            <FaPlus /> Add
                        </button>
                    </div>
                    
                    <div className="skills-tags">
                        {formData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                                <button 
                                    type="button" 
                                    className="remove-tag"
                                    onClick={() => handleRemoveSkill(skill)}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Social Links</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaLinkedin /> LinkedIn</label>
                            <div className="input-with-icon">
                                <span className="input-prefix">linkedin.com/in/</span>
                                <input
                                    type="text"
                                    name="socialLinks.linkedin"
                                    value={formData.socialLinks.linkedin}
                                    onChange={handleInputChange}
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label><FaGithub /> GitHub</label>
                            <div className="input-with-icon">
                                <span className="input-prefix">github.com/</span>
                                <input
                                    type="text"
                                    name="socialLinks.github"
                                    value={formData.socialLinks.github}
                                    onChange={handleInputChange}
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label><FaTwitter /> Twitter</label>
                            <div className="input-with-icon">
                                <span className="input-prefix">twitter.com/</span>
                                <input
                                    type="text"
                                    name="socialLinks.twitter"
                                    value={formData.socialLinks.twitter}
                                    onChange={handleInputChange}
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label><FaGlobe /> Portfolio</label>
                            <input
                                type="url"
                                name="socialLinks.portfolio"
                                value={formData.socialLinks.portfolio}
                                onChange={handleInputChange}
                                placeholder="https://yourportfolio.com"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={() => navigate('/profile')}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfileEdit;
