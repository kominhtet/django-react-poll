import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PollList = () => {
  const [polls, setPolls] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({}); // State to track selected options for each poll

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const pollsResponse = await axios.get('http://127.0.0.1:8000/api/polls/');
        const pollOptionsResponse = await axios.get('http://127.0.0.1:8000/api/poll-options/');
        
        const pollsData = pollsResponse.data;
        const optionsData = pollOptionsResponse.data;

        // Map options to the corresponding poll based on `poll` ID
        const pollsWithOptions = pollsData.map(poll => ({
          ...poll,
          options: optionsData.filter(option => option.poll === poll.id),
        }));

        setPolls(pollsWithOptions);
      } catch (error) {
        console.error("There was an error fetching the polls or poll options!", error);
      }
    };

    fetchPolls();
  }, []);

  // Handle checkbox selection
  const handleCheckboxChange = (pollId, optionId) => {
    setSelectedOptions(prevSelected => {
      const selectedForPoll = prevSelected[pollId] || [];
      if (selectedForPoll.includes(optionId)) {
        return {
          ...prevSelected,
          [pollId]: selectedForPoll.filter(id => id !== optionId) // Remove if already selected
        };
      } else {
        return {
          ...prevSelected,
          [pollId]: [...selectedForPoll, optionId] // Add if not already selected
        };
      }
    });
  };

  // Handle vote submission
  const handleVote = (pollId) => {
    const selected = selectedOptions[pollId] || [];
    if (selected.length === 0) {
      alert('Please select at least one option to vote.');
      return;
    }

    // You can make a POST request here to submit the votes
    // Example payload can be like { pollId, selectedOptions: selected }
    console.log('Submitting vote for poll:', pollId, 'with options:', selected);
    alert(`Your vote for poll ${pollId} has been submitted!`);
    
    // Reset selection after vote submission
    setSelectedOptions(prevSelected => ({
      ...prevSelected,
      [pollId]: []
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-left">Available Survey</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map(poll => (
          <div key={poll.id} className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{poll.description}</h2>
            <ul className="mb-4">
              {poll.options.length > 0 ? (
                poll.options.map(option => (
                  <li key={option.id} className="flex justify-between items-center mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedOptions[poll.id]?.includes(option.id) || false}
                        onChange={() => handleCheckboxChange(poll.id, option.id)}
                        className="mr-2"
                      />
                      <span>{option.name} - Votes: {option.point}</span>
                    </label>
                  </li>
                ))
              ) : (
                <li>No options available</li>
              )}
            </ul>
            {/* Vote button below the options */}
            <button
              onClick={() => handleVote(poll.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollList;
