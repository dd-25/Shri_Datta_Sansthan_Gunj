import React, { useState, useEffect, useContext } from 'react';
import axios from '../config/axiosConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Pujaslot.css';
import { addDays } from 'date-fns';
import { AuthContext } from '../context/Authcontext';

const Pujaslot = () => {
  const { isAuthenticated, bhakt } = useContext(AuthContext);
  const [pujaType, setPujaType] = useState(''); // Selected puja type
  const [availableSlots, setAvailableSlots] = useState([]); // Available date slots
  const [selectedDate, setSelectedDate] = useState(null); // Selected date
  const [message, setMessage] = useState(''); // Messages
  const [isPaymentReady, setIsPaymentReady] = useState(false); // Track payment button state
  const [pujaTypes, setPujaTypes] = useState([]); // Available puja types

  // Fetch puja types on component mount
  useEffect(() => {
    const fetchPujaTypes = async () => {
      try {
        const response = await axios.get('/api/pujaslot/puja');
        if (response.data.success) {
          setPujaTypes(response.data.puja);
        } else {
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching puja types:', error);
        setMessage('Failed to fetch puja types.');
      }
    };
    fetchPujaTypes();
  }, []);

  // Fetch available slots when the pujaType changes
  useEffect(() => {
    if (pujaType) {
      fetchAvailableSlots();
    }
  }, [pujaType]);

  // Fetch available slots from the backend
  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get('/api/pujaslot', { params: { pujaType } }); // Updated endpoint
      if (response.data.success) {
        setAvailableSlots(response.data.validDates); // validDates from the backend
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setMessage('Failed to fetch available slots.');
    }
  };

  // Check if a date is available in the valid dates list
  const isDateAvailable = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return availableSlots.includes(formattedDate);
  };

  // Date limits: Next 15 days
  const minDate = new Date();
  const maxDate = addDays(new Date(), 15);

  // Handle booking submission and payment initiation
  const handleBookingAndPayment = async () => {
    if (!selectedDate || !pujaType) {
      setMessage('Please select a puja type and date.');
      return;
    }

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date to 'yyyy-MM-dd'

      const paymentResponse = await axios.post('/api/pujaslot', {
        pujaType,
        date: formattedDate,
        username: bhakt.username,
      });

      if (paymentResponse.data.success) {
        const { order_id, key_id, amount, currency } = paymentResponse.data;

        // Step 3: Initialize Razorpay with the order details
        const options = {
          key: key_id, // Razorpay key ID
          amount: amount, // Amount in paise
          currency: currency, // Currency (INR)
          name: 'Temple Puja Slot Booking', // Title on Razorpay popup
          description: `Booking for ${pujaType}`,
          order_id: order_id, // Razorpay order ID from backend
          handler: async function (response) {
            // Step 4: Send payment success data to the backend for verification
            const verificationResponse = await axios.post('/api/pujaslot/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              username: bhakt.username,
              pujaType: pujaType,
              date: formattedDate,
              type: 'puja slot booking',
            });

            // Step 5: Handle the verification response
            if (verificationResponse.data.success) {
              setMessage('Payment successful and Puja Slot booked!');
            } else {
              setMessage('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: bhakt.username, // Prefill user name
            email: bhakt.email, // Prefill user email
          },
          theme: {
            color: '#F37254', // Theme color for Razorpay popup
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open(); // Open Razorpay payment popup
      } else {
        setMessage('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error making booking:', error);
      setMessage('Booking or payment initiation failed. Please try again.');
    }
  };

  return (
    <div className="puja-booking">
      <h2>Book a Puja</h2>

      {/* Puja type selection */}
      <label>
        Select Puja Type:
        <select value={pujaType} onChange={(e) => setPujaType(e.target.value)}>
          <option value="">--Select--</option> {/* Default option */}
          {pujaTypes.map((pujaItem) => (
            <option key={pujaItem._id} value={pujaItem.name}>
              {pujaItem.name}
            </option>
          ))}
        </select>
      </label>

      {/* Calendar component */}
      {pujaType && (
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setIsPaymentReady(true); // Enable payment button after selecting a date
          }}
          dayClassName={(date) => (isDateAvailable(date) ? 'valid-date' : 'invalid-date')}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Select a date"
          inline
        />
      )}

      {/* Payment Button */}
      {isPaymentReady && (
        <button className="payment-btn" onClick={handleBookingAndPayment}>
          Confirm and Pay
        </button>
      )}

      {/* Booking message */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Pujaslot;
