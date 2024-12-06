// src/components/PollDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; 

const PollDetail = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    api.get(`polls/${id}/`)
      .then((response) => {
        setPoll(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the poll details!", error);
      });
  }, [id]);

  const vote = (optionId) => {
    api.post(`poll-options/${optionId}/vote/`, {}, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then((response) => {
      setPoll((prevPoll) => ({
        ...prevPoll,
        options: prevPoll.options.map(option =>
          option.id === optionId ? { ...option, total_vote: option.total_vote + 1 } : option
        ),
        total_vote: prevPoll.total_vote + 1
      }));
    })
    .catch((error) => {
      console.error("There was an error voting for the option!", error);
    });
  };

  if (!poll) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{poll.description}</h1>
      <p className="text-gray-600 mb-4">Total votes: {poll.total_vote}</p>
      <ul className="mb-4">
        {poll.options.map(option => (
          <li key={option.id} className="flex justify-between items-center mb-2">
            <span>{option.name} - Votes: {option.total_vote}</span>
            <button
              onClick={() => vote(option.id)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Vote
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollDetail;
