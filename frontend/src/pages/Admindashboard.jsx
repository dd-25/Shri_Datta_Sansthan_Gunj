import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaAlignCenter } from 'react-icons/fa';
import './Admindashboard.css';

function Admindashboard() {
    const [activeSection, setActiveSection] = useState('notifications');
    const [activeNotificationType, setActiveNotificationType] = useState('recent');
    const [notifications, setNotifications] = useState({
        recent: [],
        daily: [],
        upcoming: []
    });
    const [newNotification, setNewNotification] = useState({ recent: '', daily: '', upcoming: '' });
    const [editing, setEditing] = useState({ type: '', index: null, value: '' });
    const [homepageContent, setHomepageContent] = useState({
        images: [],
        description: ''
    });

    const handleNotificationChange = (type, e) => {
        setNewNotification({ ...newNotification, [type]: e.target.value });
    };

    const addNotification = (type) => {
        if (newNotification[type].trim()) {
            setNotifications({
                ...notifications,
                [type]: [...notifications[type], newNotification[type]]
            });
            setNewNotification({ ...newNotification, [type]: '' });
        }
    };

    const deleteNotification = (type, index) => {
        setNotifications({
            ...notifications,
            [type]: notifications[type].filter((_, i) => i !== index)
        });
    };

    const editNotification = (type, index) => {
        setEditing({ type, index, value: notifications[type][index] });
    };

    const saveEditNotification = () => {
        setNotifications({
            ...notifications,
            [editing.type]: notifications[editing.type].map((note, i) =>
                i === editing.index ? editing.value : note
            )
        });
        setEditing({ type: '', index: null, value: '' });
    };

    const cancelEditNotification = () => {
        setEditing({ type: '', index: null, value: '' });
    };

    const handleHomepageContentChange = (e) => {
        const { name, value } = e.target;
        setHomepageContent({
            ...homepageContent,
            [name]: value
        });
    };

    const handleHomepageImageChange = (e) => {
        setHomepageContent({
            ...homepageContent,
            images: [...homepageContent.images, e.target.files[0]]
        });
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
                                {activeNotificationType.charAt(0).toUpperCase() + activeNotificationType.slice(1)}
                            </h3>
                            <input
                                type='text'
                                value={newNotification[activeNotificationType]}
                                onChange={(e) => handleNotificationChange(activeNotificationType, e)}
                                placeholder={`Enter ${activeNotificationType} notification`}
                                className="notification-input"
                            />
                            <button className="add-notification-btn" onClick={() => addNotification(activeNotificationType)}>
                                Add Notification
                            </button>
                            <ul className="notification-list">
                                {notifications[activeNotificationType].map((note, index) => (
                                    <li key={index} className="notification-item">
                                        {editing.type === activeNotificationType && editing.index === index ? (
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
                                        <div className="action-buttons">
                                            {editing.type === activeNotificationType && editing.index === index ? (
                                                <>
                                                    <FaCheck
                                                        className="save-icon"
                                                        onClick={saveEditNotification}
                                                    />
                                                    <FaTimes
                                                        className="cancel-icon"
                                                        onClick={cancelEditNotification}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <FaEdit
                                                        className="edit-icon"
                                                        onClick={() => editNotification(activeNotificationType, index)}
                                                    />
                                                    <FaTrash
                                                        className="delete-icon"
                                                        onClick={() => deleteNotification(activeNotificationType, index)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                {activeSection === 'homepage' && (
                    <div className="admin-section-content homepage-section">
                        <h2>Update Homepage Image Slider</h2>
                        <input
                            type="file"
                            name="image"
                            onChange={handleHomepageImageChange}
                            className="homepage-image-input"
                            multiple
                        />
                        <div className="homepage-image-slider">
                            {homepageContent.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={URL.createObjectURL(image)}
                                    alt={`Homepage Slide ${index}`}
                                    className="admin-homepage-image-preview"
                                />
                            ))}
                        </div>
                        <textarea
                            name="description"
                            value={homepageContent.description}
                            onChange={handleHomepageContentChange}
                            placeholder="Homepage Description"
                            className="homepage-description-input"
                        />
                        <button className="update-homepage-btn">Update Homepage</button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Admindashboard;
