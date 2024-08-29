import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SearchBhakt from "./pages/SearchBhakt";
import Layout from "./Layout";
import './App.css';
import { AuthProvider } from "./context/Authcontext";
import Admindashboard from "./pages/Admindashboard";
import Gallery from "./pages/Gallery";
import Gallerycontents from "./pages/Gallerycontents";
import Audio from "./pages/Audio";

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/searchBhakt" element={<SearchBhakt />} />
            <Route path="/admindashboard" element={<Admindashboard />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:directoryName/:type" element={<Gallerycontents />} />
            <Route path="/audio" element={<Audio />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
