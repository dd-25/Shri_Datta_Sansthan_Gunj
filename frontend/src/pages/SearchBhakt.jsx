import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Country, State, City } from 'country-state-city';
import './SearchBhakt.css'; // Import the CSS file
import { AuthContext } from '../context/Authcontext';

function SearchBhakt() {
  const [field, setField] = useState('');
  const [filters, setFilters] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredBhakt, setFilteredBhakt] = useState([]);
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { isAuthenticated, bhakt, loading } = useContext(AuthContext);

  useEffect(() => {
    // Fetch all users when the component mounts
    fetchAllBhakt();
  }, []);

  useEffect(() => {
    if (country) {
      setStates(State.getStatesOfCountry(country));
    } else {
      setStates([]);
      setState('');
      setCities([]);
      setCity('');
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      setCities(City.getCitiesOfState(country, state));
    } else {
      setCities([]);
      setCity('');
    }
  }, [state, country]);

  const handleFieldChange = (e) => {
    setField(e.target.value);
    setAlertMessage('');
    setCountry('');
    setState('');
    setCity('');
    setStates([]);
    setCities([]);
    setValue('');
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleStateChange = (e) => {
    setState(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleAddFilter = () => {
    if (!field) {
      setAlertMessage('Please select a field');
      return;
    }

    if (field === 'address') {
      if (!country) {
        setAlertMessage('Please select a country');
        return;
      }
      if (!state) {
        setAlertMessage('Please select a state');
        return;
      }
      if (!city) {
        setAlertMessage('Please select a city');
        return;
      }

      const addressFilter = { country, state, city };
      setFilters((prevFilters) => ({ ...prevFilters, address: addressFilter }));
      setField('');
      setAlertMessage('');
      setCountry('');
      setState('');
      setCity('');
    } else {
      if (!value) {
        setAlertMessage('Please enter a value for the selected filter');
        return;
      }

      setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
      setField('');
      setValue('');
      setAlertMessage('');
    }

    fetchFilteredData();
  };

  const fetchAllBhakt = () => {
    axios
      .post('/api/searchBhakt', { ...filters, role: 'bhakt' }) // Change to your API endpoint for fetching all Bhakt data
      .then((response) => {
        setFilteredBhakt(response.data);
      })
      .catch((error) => {
        console.error('Error fetching Bhakt data:', error);
        setAlertMessage('Error fetching Bhakt data');
      });
  };

  const fetchFilteredData = () => {
    axios
      .post('/api/searchBhakt', { ...filters, role: 'bhakt' })
      .then((response) => {
        setFilteredBhakt(response.data);
      })
      .catch((error) => {
        console.error('Error sending filters to backend:', error);
        setAlertMessage('Error sending filters to backend');
      });
  };

  const handleRemoveFilter = (key) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      delete newFilters[key];
      return newFilters;
    });
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchFilteredData();
    }
  }, [filters]);

  function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const renderTable = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredBhakt.slice(startIndex, endIndex);

    return (
      <table>
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Address</th>
            <th>Occupation</th>
            <th>Phone Number</th>
            <th>Email</th>
            {bhakt && bhakt.role === 'admin' && (
              <>
                <th>Puja Done</th>
                <th>Donation</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((bhaktItem, index) => (
            <tr key={index}>
              <td>{startIndex + index + 1}</td>
              <td>{bhaktItem.name}</td>
              <td>{bhaktItem.gender}</td>
              <td>{calculateAge(bhaktItem.dob)}</td>
              <td>{bhaktItem.address ? `${bhaktItem.address.city}, ${bhaktItem.address.state}, ${bhaktItem.address.country}` : 'N/A'}</td>
              <td>{bhaktItem.occupation}</td>
              <td>{bhaktItem.phone}</td>
              <td>{bhaktItem.email}</td>
              {bhakt && bhakt.role === 'admin' && (
                <>
                  <td>{bhaktItem.puja_done}</td>
                  <td>{bhaktItem.donations_made.money}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const totalPages = Math.ceil(filteredBhakt.length / itemsPerPage);

  return (
    <>
      <select name="field" id="field" value={field} onChange={handleFieldChange}>
        <option value="">Select a filter</option>
        <option value="name">Name</option>
        <option value="gender">Gender</option>
        <option value="address">Address</option>
        <option value="occupation">Occupation</option>
      </select>

      {field === 'name' && (
        <input
          type="text"
          name="value"
          id="value"
          placeholder="Enter name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}

      {field === 'gender' && (
        <select name="value" id="value" value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      )}

      {field === 'address' && (
        <div>
          <select name="country" id="country" value={country} onChange={handleCountryChange}>
            <option value="">Select country</option>
            {Country.getAllCountries().map((country) => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.name}
              </option>
            ))}
          </select>

          {states.length > 0 && (
            <select name="state" id="state" value={state} onChange={handleStateChange}>
              <option value="">Select state</option>
              {states.map((stateItem) => (
                <option key={stateItem.isoCode} value={stateItem.isoCode}>
                  {stateItem.name}
                </option>
              ))}
            </select>
          )}

          {cities.length > 0 && (
            <select name="city" id="city" value={city} onChange={handleCityChange}>
              <option value="">Select city</option>
              {cities.map((cityItem) => (
                <option key={cityItem.name} value={cityItem.name}>
                  {cityItem.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {field === 'occupation' && (
        <select name="value" id="value" value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Select occupation</option>
          <option value="occupation1">Occupation 1</option>
          <option value="occupation2">Occupation 2</option>
          <option value="occupation3">Occupation 3</option>
        </select>
      )}

      <button onClick={handleAddFilter}>Add Filter</button>
      {alertMessage && <p>{alertMessage}</p>}

      {Object.keys(filters).map((key) => (
        <div key={key}>
          {key}: {typeof filters[key] === 'object' ? JSON.stringify(filters[key]) : filters[key]}
          <button onClick={() => handleRemoveFilter(key)}>Remove</button>
        </div>
      ))}

      {renderTable()}

      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        )}
        {currentPage < totalPages && (
          <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        )}
      </div>
    </>
  );
}

export default SearchBhakt;
