import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Authcontext';
import './Header.css'; 

function Header() {
    const { isAuthenticated, bhakt, loading } = useContext(AuthContext);
    const handleLogout = () => {
        // Perform logout logic here, like clearing cookies or tokens
        document.cookie = `uid=; expires=${Date.now()}; path=/;`;
        window.location.reload(); // Refresh the page or redirect to login
    };

    if (loading) {
        return <div>Loading...</div>; // You might want to add a spinner or loader here
    }

    return (
        <div>
            <section className="institution-name-section">
                <h1 className="institution-name">Datta Maharaj Sansthan, Gunj</h1>
            </section>

            <nav className="navbar">
                <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="/aboutus">About Us</a></li>
                    <li><a href="/searchBhakt">Search Bhakt</a></li>
                    <li><a href="/audio">Audio</a></li>
                    <li><a href="/gallery">Gallery</a></li>
                    {isAuthenticated ? (
                        <li className="dropdown">
                            <a href="#" className="dropdown-toggle">
                                {bhakt.name} <i className="fas fa-caret-down"></i>
                            </a>
                            <div className="dropdown-menu">
                                <a href="/bhakt">Edit Profile</a>
                                {bhakt.role === 'admin' ?
                                <a href="/admindashboard">Admin Dashboard</a>
                                :
                                null
                                }
                                <a href="#" onClick={handleLogout}>Logout</a>
                            </div>
                        </li>
                    ) : (
                        <li><a href="/login"><i className="fas fa-user"></i> Login/Signup</a></li>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default Header;
