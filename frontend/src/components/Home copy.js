import React, { useEffect, useState } from 'react';
import api from '../api'; // Adjust the import path based on your folder structure
import survey from '../assets/survey.png'; // Image asset for the survey icon
import { Link } from 'react-router-dom';


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
        <div style={styles.home}>
           
            {/* <div style={styles.header} className="row justify-content-center">
                <div className="col-2">
                    <img src={survey} alt="Survey Icon" style={styles.headerImage} />
                </div>
                <div className="col-6 text-section" style={styles.textSection}>
                    <h1 style={styles.get}>
                        <span style={styles.line1}>Get ahead with the</span>
                        <br />
                        <span style={styles.line2}>Myanmar survey team center</span>
                    </h1>

              
                    <div style={styles.buttonWrapper}>
                        <Link to="/poll">
                            <button style={styles.button}>Poll Now!</button>
                        </Link>
                    </div>
                </div>
            </div> */}

            {/* Latest Polls Section */}
            {/* <div style={styles.pollsSection} className="text-center">
                <h2 style={styles.pollsHeader}>Latest Polls</h2>
                <p style={styles.check}>Check out our popular polling averages</p>
                
                <div className="container-fluid mb-5">
                    <div className="row">
                        <div className="col-10 mx-auto">
                            <div className="row gy-4">
                                {polls.slice(0, 3).map((poll) => (
                                    <div key={poll.id} className="col-md-4">
                                        <div className="card mb-4 shadow-sm">
                                            <img src={survey} alt="Poll Icon" className="card-img-top" style={styles.cardImage} />
                                            <div className="card-body">
                                                <h5 style={styles.cardTitle}>{poll.description}</h5>
                                            </div>
                                        </div>
                                    </div>
                                ))}     
                            </div>
                        </div>
                    </div>
                </div>               
            </div> */}

           
        </div>
    );
};

const styles = {
    home: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Ensure the home component takes at least full viewport height
        padding: '20px',
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#007bff',
        padding: '40px 0',
        color: '#fff',
        textAlign: 'center',
    },
    headerImage: {
        width: '100px',
        marginBottom: '10px',
    },
    textSection: {
        textAlign: 'center',
    },
    get: {
        fontWeight: '700',
    },
    line1: {
        fontSize: '1.2rem',
    },
    line2: {
        fontSize: '2rem',
    },
    buttonWrapper: {
        marginTop: '20px',
    },
    button: {
        backgroundColor: '#28a745',
        color: 'white',
        fontSize: '1rem',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
    },
    pollsSection: {
        flex: '1', 
        marginTop: '50px',
        textAlign: 'center',
        overflow: 'hidden', 
    },
    pollsHeader: {
        fontSize: '1.8rem',
        fontWeight: '600',
    },
    check: {
        fontSize: '1rem',
        color: '#6c757d',
    },
    cardImage: {
        width: '100px',
        margin: 'auto',
        paddingTop: '20px',
    },
    cardTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
    },
};

export default Home;
