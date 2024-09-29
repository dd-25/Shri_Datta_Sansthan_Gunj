import React, { useEffect, useState } from 'react';
import './Home.css';
import axios from '../config/axiosConfig';

function Home() {
  const [notifications, setNotifications] = useState({ recent: [], upcoming: [], daily: [] });
  const [imageSlider, setImageSlider] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // State for current slide index

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/all');
      if (response && response.data) {
        setNotifications(response.data.list);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchImageSlider = async () => {
    try {
      const response = await axios.get('/api/imageslider');
      if (response.data.success)
        setImageSlider(response.data.images);
      else
        setImageSlider([]);
    }
    catch (error) {
      console.log("error: ", error);
    }
  }

  useEffect(() => {
    fetchNotifications();
    fetchImageSlider();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageSlider.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Clean up on component unmount
  }, [imageSlider.length]);

  return (
    <div className="home-container">
      {/* Section 2: Image Slider */}
      <section className="image-slider-section">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {imageSlider.map((image, index) => (
            <div key={index} className="slide">
              <img src={image.image} alt={image.description} />
              <div className="description">{image.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Notifications, Daily Routine, Upcoming Events */}
      <section className="info-section">
        <div className="info-box notifications">
          <h2>Recent Activities</h2>
          <div className="scroll-content">
            <ul>
              {notifications.recent.map((item, index) => <li key={index}><p>{item}</p></li>)}
            </ul>
          </div>
        </div>
        <div className="info-box daily-routine">
          <h2>Daily Activities</h2>
          <div className="scroll-content">
            <ul>
              {notifications.daily.map((item, index) => <li key={index}><p>{item}</p></li>)}
            </ul>
          </div>
        </div>
        <div className="info-box upcoming-events">
          <h2>Upcoming Activities</h2>
          <div className="scroll-content">
            <ul>
              {notifications.upcoming.map((item, index) => <li key={index}><p>{item}</p></li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Flexboxes for Services */}
      <section className="services-section">
        <a href='/products' className="service-box">Products</a>
        <a href='/events' className="service-box">Events</a>
        <a href='/gallery' className="service-box">Gallery</a>
        <a href='/donate' className='service-box'>Make Donations</a>
        <a href='/puja' className="service-box">Book Puja Slot</a>
        <a href='/bhaktniwas' className="service-box">Book Bhakt Niwas Room</a>
      </section>
    </div>
  );
}

export default Home;
