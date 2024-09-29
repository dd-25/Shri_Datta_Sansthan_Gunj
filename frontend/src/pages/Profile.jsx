import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTrashAlt, faEdit, faSave, faLock } from '@fortawesome/free-solid-svg-icons';
import { Country, State, City } from 'country-state-city';
import { AuthContext } from '../context/Authcontext';
import axios from '../config/axiosConfig';

function Profile() {
    const { isAuthenticated, bhakt } = useContext(AuthContext);
    if (!isAuthenticated) {
        return <div>Access Denied</div>;
    }

    const [profile, setProfile] = useState({
        name: bhakt.name,
        phone: bhakt.phone || [''],
        dob: bhakt.dob.substr(0, 10),
        gender: bhakt.gender,
        address: {
            street: bhakt.address.street,
            city: bhakt.address.city,
            state: bhakt.address.state,
            country: bhakt.address.country,
            pincode: bhakt.address.pincode,
        },
        aadhar: bhakt.aadhar,
        occupation: bhakt.occupation,
        email: bhakt.email || [''],
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Handle input changes for profile fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handlePhoneChange = (index, value) => {
        const updatedPhones = [...profile.phone];
        updatedPhones[index] = value;
        setProfile({ ...profile, phone: updatedPhones });
    };

    const handleEmailChange = (index, value) => {
        const updatedEmail = [...profile.email];
        updatedEmail[index] = value;
        setProfile({ ...profile, email: updatedEmail });
    };

    // Handle country, state, and city changes properly
    const handleCountryChange = (value) => {
        setProfile({
            ...profile,
            address: { ...profile.address, country: value},
        });
    };

    const handleStateChange = (value) => {
        setProfile({
            ...profile,
            address: { ...profile.address, state: value},
        });
    };

    const handleCityChange = (value) => {
        setProfile({
            ...profile,
            address: { ...profile.address, city: value },
        });
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            address: { ...profile.address, [name]: value },
        });
    };

    const addPhoneNumber = () => {
        if (profile.phone.length < 5) {
            setProfile({ ...profile, phone: [...profile.phone, ''] });
        }
    };

    const removePhoneNumber = (index) => {
        const updatedPhones = profile.phone.filter((_, i) => i !== index);
        setProfile({ ...profile, phone: updatedPhones });
    };

    const addEmail = () => {
        if (profile.email.length < 2) {
            setProfile({ ...profile, email: [...profile.email, ''] });
        }
    };

    const removeEmail = (index) => {
        const updatedEmail = profile.email.filter((_, i) => i !== index);
        setProfile({ ...profile, email: updatedEmail });
    };

    // Save profile changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/api/profile', { username: bhakt.username, ...profile });
            if (response.data.success) {
                setIsEditing(false);
            } else {
                console.log('Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            console.log('Failed to update profile.');
        }
    };

    // Change Password Handler
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }

        try {
            const response = await axios.post('/api/profile/check', { username: bhakt.username, currentPassword });
            if (response.data.success) {
                await axios.post('/api/profile', { username: bhakt.username, newPassword });
                if (response.data.success) {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }
            } else {
                alert('Current password is incorrect');
            }
        } catch (error) {
            console.error(error);
            console.log('Failed to change password.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfile({
            name: bhakt.name,
            phone: bhakt.phone || [''],
            dob: bhakt.dob.substr(0, 10),
            gender: bhakt.gender,
            address: {
                street: bhakt.address.street,
                city: bhakt.address.city,
                state: bhakt.address.state,
                country: bhakt.address.country,
                pincode: bhakt.address.pincode,
            },
            aadhar: bhakt.aadhar,
            occupation: bhakt.occupation,
            email: bhakt.email || [''],
        });
    }

    return (
        <div className="profile-container">
            <h1>Profile</h1>

            {/* Change Password Section */}
            <div className="password-change">
                <button className="change-password-btn" onClick={() => setIsChangingPassword(true)}>
                    <FontAwesomeIcon icon={faLock} /> Change Password
                </button>

                {isChangingPassword && (
                    <form onSubmit={handlePasswordSubmit} className="password-change-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn">
                            <FontAwesomeIcon icon={faSave} /> Save
                        </button>
                        <button type="button" onClick={() => setIsChangingPassword(false)}>
                            Cancel
                        </button>
                    </form>
                )}
            </div>

            {/* Read-Only View */}
            {!isEditing && (
                <div className="profile-details">
                    <p>Name: {profile.name}</p>
                    <p>Phone Numbers: {profile.phone.join(', ')}</p>
                    <p>Date of Birth: {profile.dob}</p>
                    <p>Gender: {profile.gender}</p>
                    <p>Address: {`${profile.address.street}, ${profile.address.city}, ${profile.address.state}, ${profile.address.country} - ${profile.address.pincode}`}</p>
                    <p>Aadhaar Number: {profile.aadhar}</p>
                    <p>Occupation: {profile.occupation}</p>
                    <p>Email: {profile.email.join(', ')}</p>
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                </div>
            )}

            {/* Editable Form */}
            {isEditing && (
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={profile.name} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                        <label>Phone Numbers</label>
                        {profile.phone.map((phone, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                                />
                                {index > 0 && (
                                    <button type="button" onClick={() => removePhoneNumber(index)}>
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addPhoneNumber}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add Phone
                        </button>
                    </div>

                    {/* Date of Birth */}
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={profile.dob}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Gender */}
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="gender" value={profile.gender} onChange={handleInputChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Address */}
                    <div className="form-group">
                        <label>Country</label>
                        <select
                            name="country"
                            value={profile.address.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                        >
                            {Country.getAllCountries().map((country) => (
                                <option key={country.isoCode} value={country.isoCode}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>State</label>
                        <select
                            name="state"
                            value={profile.address.state}
                            onChange={(e) => handleStateChange(e.target.value)}
                            disabled={!profile.address.country}
                        >
                            {State.getStatesOfCountry(profile.address.country).map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>City</label>
                        <select
                            name="city"
                            value={profile.address.city}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={!profile.address.state}
                        >
                            {City.getCitiesOfState(profile.address.country, profile.address.state).map((city) => (
                                <option key={city.name} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Street</label>
                        <input
                            type="text"
                            name="street"
                            value={profile.address.street}
                            onChange={handleAddressChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            value={profile.address.pincode}
                            onChange={handleAddressChange}
                        />
                    </div>

                    {/* Aadhaar Number */}
                    <div className="form-group">
                        <label>Aadhaar Number</label>
                        <input
                            type="text"
                            name="aadhar"
                            value={profile.aadhar}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Occupation */}
                    <div className="form-group">
                        <label>Occupation</label>
                        <input
                            type="text"
                            name="occupation"
                            value={profile.occupation}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label>Email</label>
                        {profile.email.map((email, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                />
                                {index > 0 && (
                                    <button type="button" onClick={() => removeEmail(index)}>
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addEmail}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add Email
                        </button>
                    </div>

                    <button type="submit" className="save-btn">
                        <FontAwesomeIcon icon={faSave} /> Save
                    </button>
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}

export default Profile;
