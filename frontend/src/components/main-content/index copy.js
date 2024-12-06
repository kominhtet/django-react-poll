import React from 'react';
import api from '../../api'; // Adjust the import path based on your folder structure
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainContent.css'; // Import the CSS file
import AuthContext from '../../context/AuthContext';

class MainContent extends React.Component {
  
  state = {
    pollOptions: [],
    selectedPollDetails: null,
    selectedOption: null, // To hold the selected option (only one)
    voteResults: null, // To hold the vote results
    totalVotes: 0, // To hold the total votes for percentage calculation
    hasVoted: false, // To track if the user has already voted
    userIp: '', // To store the user's IP address if not logged in
  };

  static contextType = AuthContext; // Set the context type

  componentDidUpdate(prevProps) {
    // Fetch poll options when a new poll is selected
    if (this.props.selectedPoll !== prevProps.selectedPoll) {
      this.resetPollState(); // Reset state for a new poll
      this.loadPollData(this.props.selectedPoll);
    }
  }

  resetPollState = () => {
    this.setState({
      pollOptions: [],
      selectedPollDetails: null,
      selectedOption: null,
      voteResults: null,
      totalVotes: 0,
      hasVoted: false,
    });
  };

  loadPollData = async (pollId) => {
    try {
      const detailsResponse = await api.get(`polls/${pollId}/`);
      this.setState({ selectedPollDetails: detailsResponse.data });
      
      const optionsResponse = await api.get(`poll-options/?poll=${pollId}`);
      this.setState({ pollOptions: optionsResponse.data });
    } catch (error) {
      console.error('Error loading poll data', error);
    }
  };

  handleRadioChange = (optionId) => {
    this.setState({ selectedOption: optionId }); // Set only one selected option
  };

  fetchUserIp = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        this.setState({ userIp: data.ip });
        console.log('Fetched IP address:', data.ip); // Log the fetched IP
        return data.ip; // Return the IP address
    } catch (error) {
        console.error('Error fetching IP address', error);
        return null; // Return null if there's an error
    }
};

handleVote = async () => {
  const { selectedOption } = this.state;
  const { user } = this.context; // Get user from AuthContext

  if (selectedOption) {
      try {
          let payload = { optionId: selectedOption };

          // Log user information
          if (user && user.id) {
              console.log('User is logged in:', user);
              payload.userId = user.id; // Include user ID if user is logged in
          } else {
              // If the user is anonymous, ensure the userIp is set
              console.log('Fetching user IP...');
              const fetchedIp = await this.fetchUserIp(); // Fetch user IP

              if (fetchedIp) {
                  console.log('User is anonymous, IP:', fetchedIp);
                  payload.userIp = fetchedIp; // Set the user IP in the payload
              } else {
                  console.error('UserId or UserIp must be provided');
                  alert('Unable to retrieve your IP address. Please try again later.');
                  return; // Stop if neither userId nor userIp is provided
              }
          }

          console.log("Payload before sending vote:", payload);

          // Send vote to API
          await api.post('vote/', payload);
          this.fetchVoteResults();
          this.setState({ hasVoted: true });
      } catch (error) {
        console.error('Error voting', error);
    
        // Log more details from the response if available
        if (error.response) {
            console.error('Response data:', error.response.data);
            alert(`Error: ${error.response.data.message || 'There was an error submitting your vote.'}`);
        } else {
            alert('There was an error submitting your vote. Please try again.');
        }
    }
  } else {
      alert('Please select an option to vote!');
  }
};

  fetchVoteResults = async () => {
    const { selectedPoll } = this.props;

    try {
      const resultsResponse = await api.get(`vote-results/?poll=${selectedPoll}`);
      const results = resultsResponse.data;

      // Calculate total votes
      const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
      this.setState({ voteResults: results, totalVotes });
    } catch (error) {
      console.error('Error fetching vote results', error);
    }
  };

  render() {
    const { selectedPoll } = this.props;
    const { pollOptions, selectedPollDetails, selectedOption, voteResults, totalVotes } = this.state;

    return (
      <div className="container mt-4">
        {selectedPoll ? (
          <div className="card">
            <div className="card-body">
              {selectedPollDetails && (
                <p className="card-text">{selectedPollDetails.description}</p>
              )}
  
              {!voteResults ? (
                <ul className="list-group mt-4">
                  {pollOptions.map((option) => (
                    <li
                      key={option.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <label>
                        <input
                          type="radio"
                          name="pollOption"
                          value={option.id}
                          checked={selectedOption === option.id}
                          onChange={() => this.handleRadioChange(option.id)}
                          className="me-2"
                        />
                        {option.name}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4">
                  {pollOptions.map((option) => {
                    const voteCount = voteResults[option.id] || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

                    return (
                      <div key={option.id} className="mb-3">
                        <span>{option.name}: {voteCount} votes</span>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {Math.round(percentage)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
  
              {!voteResults && (
                <button
                  className="btn btn-primary mt-4"
                  onClick={this.handleVote}
                  disabled={!selectedOption} // Disable if no option is selected
                >
                  Vote
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3>Welcome to our vote page.</h3>
            <p className="mt-2">This is Myanmar Survey Team Center. We are glad to see you again.</p>
          </div>
        )}
      </div>
    );
  }
}

MainContent.contextType = AuthContext; // Use contextType for accessing AuthContext

export default MainContent;
