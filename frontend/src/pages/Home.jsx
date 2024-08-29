import React, {useContext} from 'react';
import './Home.css';

function Home() {

  return (
    <div className="home-container">
      {/* Section 2: Image Slider */}
      <section className="image-slider-section">
        <div className="slider">
          <div className="slide">
            <img src="image1" alt="Description 1" />
            <div className="description">Description for Image 1</div>
          </div>
          <div className="slide">
            <img src="image2" alt="Description 2" />
            <div className="description">Description for Image 2</div>
          </div>
          {/* Add more slides as needed */}
        </div>
      </section>

      {/* Section 3: Notifications, Daily Routine, Upcoming Events */}
      <section className="info-section">
        <div className="info-box notifications">
          <h2>Recent Activities</h2>
          <div className="scroll-content">
            <p>Notification 1</p>
            <p>Notification 2</p>
            {/* Add more notifications */}
          </div>
        </div>
        <div className="info-box daily-routine">
          <h2>Daily Routine</h2>
          <p>Morning Prayer: 6:00 AM</p>
          <p>Afternoon Prayer: 12:00 PM</p>
          {/* Add more routine details */}
        </div>
        <div className="info-box upcoming-events">
          <h2>Upcoming Events</h2>
          <p>Event 1 on Date 1</p>
          <p>Event 2 on Date 2</p>
          {/* Add more events */}
        </div>
      </section>

      {/* Section 4: Flexboxes for Services */}
      <section className="services-section">
        <div className="service-box">Products</div>
        <div className="service-box">Events</div>
        <div className="service-box">Gallery</div>
        <div className="service-box">Make Donations</div>
        <div className="service-box">Book Puja Slot</div>
        <div className="service-box">Book Bhakt Niwas Room</div>
      </section>
    </div>
  );
}

export default Home;
