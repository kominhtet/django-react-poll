// src/components/Result.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Result = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    // Fetch polls from the API
    axios.get('http://127.0.0.1:8000/api/polls/')
      .then((response) => {
        setPolls(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the polls!', error);
      });
  }, []);

  if (!polls.length) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-left">Poll Results</h1>

      {/* Grid layout for 2 results per row on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map(poll => (
          <div key={poll.id} className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{poll.description}</h2>
            <Bar
              data={{
                labels: poll.options.map(option => option.name),
                datasets: [{
                  label: 'Votes',
                  data: poll.options.map(option => option.total_vote),
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: `Results for: ${poll.description}`,
                  },
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Result;
