import { useContext, useState } from 'react';
import axios from '../config/axiosConfig'; // Import your axios config
import { AuthContext } from '../context/Authcontext'; // Import your Auth Context

function Makedonations() {
  const { isAuthenticated, bhakt } = useContext(AuthContext); // Get authenticated user
  const [donationAmount, setDonationAmount] = useState(''); // State to track donation amount

  const handleDonate = async () => {
    try {
      // Step 1: Validate donation amount
      if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
        alert('Please enter a valid donation amount.');
        return;
      }

      // Step 2: Request backend to create a Razorpay order
      const response = await axios.post('/api/donate', {
        amount: Number(donationAmount), // Parse amount to a number
        type: 'donation',
        username: bhakt.username
      });

      // Step 3: Check if order is successfully created
      if (response.data.success) {
        const { order_id, key_id, amount, currency } = response.data;

        // Step 4: Initialize Razorpay with the order details
        const options = {
          key: key_id, // Razorpay key ID
          amount: amount, // Amount in paise
          currency: currency, // Currency (INR)
          name: 'Temple Donations', // Title on Razorpay popup
          description: 'Donation Payment',
          order_id: order_id, // Razorpay order ID from backend
          handler: async function (response) {
            // Step 5: Send payment success data to the backend for verification
            const verificationResponse = await axios.post('/api/donate/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              username: bhakt.username,
              amount: Number(donationAmount),
              type: 'donation'
            });

            // Step 6: Handle the verification response
            if (verificationResponse.data.success) {
              alert('Payment successful and transaction completed!');
            } else {
              alert('Payment verification failed. Please try again.');
            }
          },
          prefill: {
            name: bhakt.username, // User's name for prefill
            email: bhakt.email, // User's email
          },
          theme: {
            color: '#F37254' // Theme color for Razorpay popup
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open(); // Open Razorpay popup
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment.');
    }
  };

  const handleUploadItem = () => {
    // Logic for uploading an item (unrelated to Razorpay integration)
    alert('Item uploaded successfully!');
  };

  return (
    <div>
      <h1>Welcome to the Donation Page</h1>
      <button onClick={handleUploadItem}>Upload Item</button>
      <div>
        <input
          type="number"
          placeholder="Enter donation amount"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
        />
        <button onClick={handleDonate}>Donate Money</button>
      </div>
    </div>
  );
}

export default Makedonations;