import React, { useEffect, useState } from 'react';
import api from '../api'; 
import poll from '../assets/poll.png'; 
import survey from '../assets/survey.png';
import { Link } from 'react-router-dom';
import About from './About'; // Import the About component
import './Home.css';

const Home = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch polls data from API
        const fetchPolls = async () => {
            try {
                const response = await api.get('polls/'); // Use the API instance
                // Sort polls in descending order by `id` to show latest polls first
                const sortedPolls = response.data.sort((a, b) => b.id - a.id);
                setPolls(sortedPolls);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching polls: ", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchPolls();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            <div className="row justify-content-center align-items-center">
                <div className="col-md-2 text-center">
                    <img src={poll} alt="Poll Icon" className="img-fluid animated" />
                </div>
                <div className="col-md-6 text-section text-center">
                    <h1 className="custom-heading">
                        Get ahead with the
                        <br />
                        Myanmar Survey Team Center
                    </h1>
                    <div>
                        <Link to="/poll">
                            <button>Poll Now!</button>
                        </Link>
                    </div>
                </div>
            </div>
            <h1 className="text-center"> Latest Polls </h1>
            <p className="text-center">Check out our popular polling averages</p>
            <div className="container-fluid mb-5">
                <div className="row">
                    <div className="col-10 mx-auto">
                        <div className="row gy-4">
                            {polls.slice(0, 3).map((poll) => (
                                <div key={poll.id} className="col-md-4">
                                    <div className="card mb-4 shadow-sm">
                                        <img 
                                            src={survey} 
                                            alt="Poll Icon" 
                                            className="card-img-top poll-img animated" 
                                        />
                                        <div className="card-body">
                                            <h5>{poll.description}</h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <About />
        </>
    );
};

export default Home;
