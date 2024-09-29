import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axiosConfig';
import { Country, State, City } from 'country-state-city';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    aadhar: '',
    occupation: '',
    email: '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, [formData.address.country]);

  useEffect(() => {
    if (formData.address.country) {
      setStates(State.getStatesOfCountry(formData.address.country));
    } else {
      setStates([]);
    }
  }, [formData.address.country]);

  useEffect(() => {
    if (formData.address.state) {
      setCities(City.getCitiesOfState(formData.address.country, formData.address.state));
    } else {
      setCities([]);
    }
  }, [formData.address.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.address) {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    axios.post('/api/signup', formData)
      .then((response) => {
        if (response.data.success) {
          navigate('/login');
        }
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error during signup:', error);
      });
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        {/* Input fields */}
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          type="date"
          id="dob"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <div className="signup-gender">
          <input
            type="radio"
            id="gender-male"
            name="gender"
            value="male"
            checked={formData.gender === 'male'}
            onChange={handleChange}
            required
          />
          <label htmlFor="gender-male">Male</label>
          <input
            type="radio"
            id="gender-female"
            name="gender"
            value="female"
            checked={formData.gender === 'female'}
            onChange={handleChange}
            required
          />
          <label htmlFor="gender-female">Female</label>
          <input
            type="radio"
            id="gender-other"
            name="gender"
            value="other"
            checked={formData.gender === 'other'}
            onChange={handleChange}
            required
          />
          <label htmlFor="gender-other">Other</label>
        </div>
        <input
          type="text"
          id="street"
          name="street"
          placeholder="Street"
          value={formData.address.street}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <select
          id="country"
          name="country"
          value={formData.address.country}
          onChange={handleChange}
          required
          className="signup-select"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
        <select
          id="state"
          name="state"
          value={formData.address.state}
          onChange={handleChange}
          required
          className="signup-select"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
        <select
          id="city"
          name="city"
          value={formData.address.city}
          onChange={handleChange}
          required
          className="signup-select"
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        <input
          type="tel"
          id="pincode"
          name="pincode"
          placeholder="Pincode"
          value={formData.address.pincode}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          type="tel"
          id="aadhar"
          name="aadhar"
          placeholder="Aadhar Number"
          value={formData.aadhar}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          type="text"
          id="occupation"
          name="occupation"
          placeholder="Occupation"
          value={formData.occupation}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input type="submit" id="signup-submit" className="signup-submit" />
      </form>
    </div>
  );
}

export default Signup;
