import React, { useState, useEffect } from 'react';
import api from '../../api'; // Adjust the import path based on your folder structure

const PollList = (props) => {
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                // If no category is selected, fetch all polls
                const categoryParam = props.selectedCategory ? `?category=${props.selectedCategory}` : '';
                const response = await api.get(`polls/${categoryParam}`); // Fetch polls with or without category filter
                setPolls(response.data);
            } catch (error) {
                console.error('Error fetching polls', error);
            }
        };

        fetchPolls();
    }, [props.selectedCategory]); // Dependency array includes selectedCategory

    // Filter polls based on the searchTerm received from props
    const filteredPolls = polls.filter((poll) => {
        const matchesSearchTerm = poll.description.toLowerCase().includes(props.searchTerm.toLowerCase());
        return matchesSearchTerm;
    });

    if (filteredPolls.length === 0) {
        return <p>No polls match your search or category.</p>;
    }

    return (
        <div
            className="polls-list"
            style={{
                maxHeight: '400px', // Set a max height for the polls list
                overflowY: 'auto',  // Enable vertical scrolling
            }}
        >
            {filteredPolls.map((poll) => (
                <div
                    key={poll.id.toString()}
                    onClick={() => props.selectPoll(poll.id)} // Trigger poll selection
                    className="p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <p className="text-bluelight-700">{poll.description}</p>
                </div>
            ))}
        </div>
    );
};

export default PollList;
