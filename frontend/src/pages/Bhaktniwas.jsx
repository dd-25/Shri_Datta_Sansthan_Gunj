import React, { useState, useEffect, useContext } from 'react';
import axios from '../config/axiosConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Bhaktniwas.css';
import { addDays } from 'date-fns';
import { AuthContext } from '../context/Authcontext';

const Bhaktniwas = () => {
  const { isAuthenticated, bhakt } = useContext(AuthContext); // Assuming AuthContext for Bhakt info
  const [niwasType, setNiwasType] = useState(''); // Selected Niwas type (room type)
  const [availableDates, setAvailableDates] = useState([]); // Available date slots
  const [selectedDate, setSelectedDate] = useState(null); // Selected date
  const [message, setMessage] = useState(''); // Messages
  const [isPaymentReady, setIsPaymentReady] = useState(false); // Track payment button state
  const [showCalendar, setShowCalendar] = useState(false); // Toggle calendar visibility
  const [niwasTypes, setNiwasTypes] = useState([]); // Available Niwas types (room types)

  // Fetch niwas types on component mount
  useEffect(() => {
    const fetchNiwasTypes = async () => {
      try {
        const response = await axios.get('/api/niwas');
        if (response.data.success) {
          setNiwasTypes(response.data.niwas); // List of niwas types from backend
        } else {
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching niwas types:', error);
        setMessage('Failed to fetch niwas types.');
      }
    };
    fetchNiwasTypes();
  }, []);

  // Fetch available dates when the niwasType changes
  useEffect(() => {
    if (niwasType) {
      fetchAvailableDates();
    }
  }, [niwasType]);

  // Fetch available dates for selected niwas type
  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get('/api/niwas/niwasType', { params: { niwasType } });
      if (response.data.success) {
        setAvailableDates(response.data.validDates); // validDates from the backend
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
      setMessage('Failed to fetch available dates.');
    }
  };

  // Check if a date is available
  const isDateAvailable = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return availableDates.includes(formattedDate);
  };

  // Date limits: Next 15 days
  const minDate = new Date();
  const maxDate = addDays(new Date(), 15);

  // Handle booking submission and payment integration with Razorpay
  const handleBooking = async () => {
    if (!selectedDate || !niwasType) {
      setMessage('Please select a room type and date.');
      return;
    }

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date to 'yyyy-MM-dd'

      const orderResponse = await axios.post('/api/niwas', {
        niwasType,
        date: formattedDate,
        username: bhakt.username
      });

      if (orderResponse.data.success) {
        // Razorpay options configuration
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Ensure to use the correct environment variable
          amount: orderResponse.data.amount,
          currency: 'INR',
          name: 'Temple Booking', // Change as per your preference
          description: `Booking for ${niwasType} on ${formattedDate}`,
          order_id: orderResponse.data.orderId, // Order ID from Razorpay
          handler: async function (response) {
            // Handle payment success
            try {
              const paymentVerificationResponse = await axios.post('/api/niwas/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                niwasType,
                username: bhakt.username,
                date: formattedDate,
                type: "niwas booking"
              });
              setMessage('Payment successful! ' + paymentVerificationResponse.data.message);
              setNiwasType('');
              setAvailableDates([]);
              setSelectedDate(null);
              setIsPaymentReady(false);
              setShowCalendar(false);
            } catch (error) {
              console.error('Error verifying payment:', error);
              setMessage('Payment verification failed.');
            }
          },
          prefill: {
            name: bhakt.username,
            email: bhakt.email,
          },
          theme: {
            color: '#F37254',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open(); // Open the Razorpay payment window
      } else {
        setMessage('Failed to create payment order.');
      }
    } catch (error) {
      console.error('Error during booking or payment:', error);
      setMessage('Booking or payment failed. Please try again.');
    }
  };

  return (
    <div className="niwas-booking">
      <h2>Book Niwas (Room)</h2>

      {/* Niwas type selection */}
      <label>
        Select Room Type:
        <select value={niwasType} onChange={(e) => setNiwasType(e.target.value)}>
          <option value="">--Select--</option> {/* Default option */}
          {niwasTypes.map((niwasItem) => (
            <option key={niwasItem._id} value={niwasItem.name}>
              {niwasItem.name} - ₹{niwasItem.price}/night
            </option>
          ))}
        </select>
      </label>

      {/* Button to toggle calendar visibility */}
      {niwasType && (
        <button
          className="open-calendar-btn"
          onClick={() => setShowCalendar((prev) => !prev)}
        >
          {showCalendar ? 'Close Calendar' : 'Select Date'}
        </button>
      )}

      {/* Calendar component */}
      {showCalendar && niwasType && (
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setIsPaymentReady(true); // Enable payment button after selecting a date
            setShowCalendar(false); // Close the calendar after selecting a date
          }}
          dayClassName={(date) => (isDateAvailable(date) ? 'valid-date' : 'invalid-date')}
          inline
          minDate={minDate}
          maxDate={maxDate}
        />
      )}

      {/* Payment Button */}
      {isPaymentReady && (
        <button className="payment-btn" onClick={handleBooking}>
          Confirm and Pay
        </button>
      )}

      {/* Booking message */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Bhaktniwas;
