import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import axios from '../config/axiosConfig';
import './Admindashboard.css';
import { AuthContext } from '../context/Authcontext';
import cloudinaryAxios from '../config/cloudinaryAxiosConfig';

function Admindashboard() {
    const { isAuthenticated, bhakt } = useContext(AuthContext);

    // Redirect or show "Access Denied" if not authenticated or not admin
    if (!isAuthenticated) {
        return <div>Access Denied</div>;
    } else if (bhakt.role !== 'admin') {
        return <div>Access Denied</div>;
    }

    const [activeSection, setActiveSection] = useState('notifications');
    const [activeNotificationType, setActiveNotificationType] = useState('recent');
    const [notifications, setNotifications] = useState({
        recent: [],
        daily: [],
        upcoming: [],
    });
    const [newNotification, setNewNotification] = useState({
        recent: '',
        daily: '',
        upcoming: '',
    });
    const [editing, setEditing] = useState({
        type: '',
        index: null,
        value: '',
    });
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageSlider, setImageSlider] = useState([]);
    const [editingDescription, setEditingDescription] = useState(false);
    const [newDescription, setNewDescription] = useState('');

    // Fetch notifications when component mounts or activeNotificationType changes
    useEffect(() => {
        fetchNotifications();
        fetchImageSlider();
    }, [activeNotificationType]);

    // Fetch Notifications from Backend
    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications', {
                params: { name: activeNotificationType },
            });
            setNotifications((prevNotifications) => ({
                ...prevNotifications,
                [activeNotificationType]: response.data.list || [],
            }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Add Notification
    const addNotification = async (type) => {
        if (newNotification[type].trim()) {
            try {
                await axios.post('/api/notifications', {
                    name: type,
                    notification: newNotification[type],
                });
                fetchNotifications();
                setNewNotification({ ...newNotification, [type]: '' });
            } catch (error) {
                console.error('Error adding notification:', error);
            }
        }
    };

    // Delete Notification
    const deleteNotification = async (type, index) => {
        const notificationToDelete = notifications[type][index];
        try {
            const response = await axios.delete('/api/notifications', {
                params: {
                    name: type,
                    notification: notificationToDelete,
                },
            });

            if (response.data.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Save Edited Notification
    const saveEditNotification = async () => {
        try {
            const response = await axios.put('/api/notifications', {
                name: editing.type,
                notification: notifications[editing.type][editing.index],
                newNotification: editing.value,
            });

            if (response.data.success) {
                setNotifications((prevNotifications) => ({
                    ...prevNotifications,
                    [editing.type]: prevNotifications[editing.type].map((note, i) =>
                        i === editing.index ? editing.value : note
                    ),
                }));
                cancelEditNotification();
            }
        } catch (error) {
            console.error('Error editing notification:', error);
        }
    };

    // Edit Notification
    const editNotification = (type, index) => {
        setEditing({
            type,
            index,
            value: notifications[type][index], // Initialize with the current notification value
        });
    };

    const cancelEditNotification = () => {
        setEditing({ type: '', index: null, value: '' });
    };

    const handleNotificationChange = (type, e) => {
        setNewNotification({ ...newNotification, [type]: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleImageSliderSubmit = async () => {
        if (!image || !description.trim()) {
            alert('Please select an image and add a description.');
            setImage(null);
            return;
        }
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Replace with your Cloudinary upload preset
        try {
            // Upload the image to Cloudinary
            const cloudinaryResponse = await cloudinaryAxios.post(
                import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
                formData
            );
            const imageUrl = cloudinaryResponse.data.secure_url;
            // Now send the image URL and description to your backend
            const response = await axios.post('/api/imageslider', {
                url: imageUrl,
                description,
            });
            if (response.data.success) {
                setImage(null);
                setDescription('');
                fetchImageSlider();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const saveEditedDescription = async (e) => {
        try {
            const response = await axios.put('/api/imageslider', {
                url: `${e.target.name}`,
                description: newDescription,
            });
            if (response.data.success) {
                fetchImageSlider();
            }
        } catch (error) {
            console.error('Error saving edited description:', error);
        }
        setEditingDescription(false);
        setNewDescription('');
    };

    const deleteImageSlider = async (url, index) => {
        console.log(url);
        try {
            const response = await axios.delete('/api/imageslider', {data: { url }});
            if (response.data.success) {
                fetchImageSlider();
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const fetchImageSlider = async () => {
        try {
            const response = await axios.get('/api/imageslider');
            setImageSlider(response.data.images);
        } catch (error) {
            console.log('Error: ', error);
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <nav className="admin-nav">
                <button
                    onClick={() => setActiveSection('notifications')}
                    className={activeSection === 'notifications' ? 'active' : ''}
                >
                    Notifications
                </button>
                <button
                    onClick={() => setActiveSection('homepage')}
                    className={activeSection === 'homepage' ? 'active' : ''}
                >
                    Homepage Image Slider
                </button>
            </nav>
            <section className="admin-section">
                {activeSection === 'notifications' && (
                    <div className="admin-section-content notifications-section">
                        <h2>Notifications</h2>
                        <nav className="notification-nav">
                            <button
                                onClick={() => setActiveNotificationType('recent')}
                                className={activeNotificationType === 'recent' ? 'active' : ''}
                            >
                                Recent Activities
                            </button>
                            <button
                                onClick={() => setActiveNotificationType('daily')}
                                className={activeNotificationType === 'daily' ? 'active' : ''}
                            >
                                Daily Routine
                            </button>
                            <button
                                onClick={() => setActiveNotificationType('upcoming')}
                                className={activeNotificationType === 'upcoming' ? 'active' : ''}
                            >
                                Upcoming Events
                            </button>
                        </nav>
                        <div className="notification-type">
                            <h3 style={{ textAlign: 'center' }}>
                                {activeNotificationType.charAt(0).toUpperCase() +
                                    activeNotificationType.slice(1)}
                            </h3>
                            <input
                                type="text"
                                value={newNotification[activeNotificationType]}
                                onChange={(e) => handleNotificationChange(activeNotificationType, e)}
                                placeholder={`Enter ${activeNotificationType} notification`}
                                className="notification-input"
                            />
                            <button
                                className="add-notification-btn"
                                onClick={() => addNotification(activeNotificationType)}
                            >
                                Add Notification
                            </button>
                            <ul className="notification-list">
                                {notifications[activeNotificationType].map((note, index) => (
                                    <li key={index} className="notification-item">
                                        {editing.type === activeNotificationType &&
                                            editing.index === index ? (
                                            <input
                                                type="text"
                                                value={editing.value}
                                                onChange={(e) =>
                                                    setEditing({ ...editing, value: e.target.value })
                                                }
                                                className="notification-edit-input"
                                            />
                                        ) : (
                                            <span>{note}</span>
                                        )}
                                        {editing.type === activeNotificationType &&
                                            editing.index === index ? (
                                            <div className="notification-edit-actions">
                                                <button
                                                    className="notification-action-btn save"
                                                    onClick={saveEditNotification}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    className="notification-action-btn cancel"
                                                    onClick={cancelEditNotification}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="notification-actions">
                                                <button
                                                    className="notification-action-btn edit"
                                                    onClick={() =>
                                                        editNotification(activeNotificationType, index)
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="notification-action-btn delete"
                                                    onClick={() =>
                                                        deleteNotification(
                                                            activeNotificationType,
                                                            index
                                                        )
                                                    }
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                {activeSection === 'homepage' && (
                    <div className="admin-section-content homepage-section">
                        <h2>Image Slider</h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="image-input"
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter image description"
                            className="description-input"
                        />
                        <button
                            className="add-image-btn"
                            onClick={handleImageSliderSubmit}
                        >
                            Add Image
                        </button>
                        <ul className="image-slider-list">
                            {imageSlider.map((img, index) => (
                                <li key={img.image} className="image-slider-item">
                                    <img src={img.image} alt="slider" className="slider-image" />
                                    {editingDescription ? (
                                        <>
                                        <input
                                            type="text"
                                            value={newDescription}
                                            onChange={(e) =>
                                                setNewDescription(e.target.value)
                                            }
                                            className="description-edit-input"
                                        />
                                        </>
                                    ) : (
                                        <span>{img.description}</span>
                                    )}
                                    {editingDescription ? (
                                        <div className="description-edit-actions">
                                            <button
                                                name={img.image}
                                                className="description-action-btn save"
                                                onClick={saveEditedDescription}
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                className="description-action-btn cancel"
                                                onClick={(e)=>{
                                                    setNewDescription('');
                                                    setEditingDescription(false);
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="description-actions">
                                            <button
                                                className="description-action-btn edit"
                                                onClick={()=>{
                                                    setNewDescription(img.description);
                                                    setEditingDescription(true)
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="description-action-btn delete"
                                                onClick={() => deleteImageSlider(img.image, index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Admindashboard;
