// src/components/Category.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Category = () => {
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);

  const location = useLocation(); // Get the current location to filter based on category clicked

  useEffect(() => {
    // Fetch all polls
    axios.get('http://127.0.0.1:8000/api/polls/')
      .then(response => {
        setPolls(response.data);
        setFilteredPolls(response.data); // Initially show all polls
      })
      .catch(error => {
        console.error('Error fetching polls:', error);
      });
  }, []);

  useEffect(() => {
    // Filter polls based on the category in the URL (if any)
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');

    if (categoryId) {
      const filtered = polls.filter(poll => poll.category === parseInt(categoryId));
      setFilteredPolls(filtered);
    } else {
      setFilteredPolls(polls); // Show all polls if no category is selected
    }
  }, [location, polls]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-left">Polls</h1>

      {/* Display corresponding polls */}
      {filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map(poll => (
            <div key={poll.id} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{poll.description}</h2>
              <ul className="mb-4">
                {poll.options.map(option => (
                  <li key={option.id} className="flex justify-between items-center mb-2">
                    <span>{option.name} - Votes: {option.total_vote}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No polls available for this category.</p>
      )}
    </div>
  );
};

export default Category;
