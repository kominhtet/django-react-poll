import React from 'react';
import api from '../../api'; // Adjust the import path based on your folder structure
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainContent.css'; // Import the CSS file
import { updateUserPointsExternally } from '../Navbar';
import Swal from 'sweetalert2';

class MainContent extends React.Component {
  state = {
    pollOptions: [],
    selectedPollDetails: null,
    selectedOption: null,
    voteResults: null,
    totalVotes: 0,
    hasVoted: false,
    userIp: '',
  };

  componentDidUpdate(prevProps) {
    if (this.props.selectedPoll !== prevProps.selectedPoll) {
      this.resetPollState();
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
    console.log("Loading poll data for ID:", pollId); // Debug log
    try {
      const detailsResponse = await api.get(`polls/${pollId}/`);
      this.setState({ selectedPollDetails: detailsResponse.data });
      
      const optionsResponse = await api.get(`poll-options/?poll=${pollId}`);
      this.setState({ pollOptions: optionsResponse.data });
      
      // Check if the user has already voted
      await this.checkIfVoted(pollId);

    } catch (error) {
      console.error('Error loading poll data', error);
    }
  };

  checkIfVoted = async (pollId) => {
    const { user } = this.props;
    let hasVoted = false;

    try {
        // Fetch IP if user is not available
        if (!user) {
            await this.fetchUserIp();
        }
        const identifier = user ? user.user_id : this.state.userIp;

        // Check voting status by user ID or IP
        const voteCheckResponse = await api.get(`vote/?poll=${pollId}&${user ? `userId=${identifier}` : `userIp=${identifier}`}`);
        hasVoted = voteCheckResponse.data.hasVoted;

        this.setState({ hasVoted }, () => {
            // Call fetchVoteResults if hasVoted is true after setting the state
            if (hasVoted) {
                this.fetchVoteResults();
            }
        });

    } catch (error) {
        console.error('Error checking voting status', error);
    }
};

  handleRadioChange = (optionId) => {
    this.setState({ selectedOption: optionId });
    console.log("Selected option ID:", optionId); // Debug log
  };

  fetchUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.setState({ userIp: data.ip });
      console.log("Fetched user IP:", data.ip); // Debug log
    } catch (error) {
      console.error('Error fetching IP address', error);
      alert('Unable to fetch IP address. Voting may not work for anonymous users.');
    }
  };

  handleVote = async () => {
    const { selectedOption, userIp } = this.state;
    const { user, selectedPoll, onUpdatePoints } = this.props;

    if (selectedOption) {
      try {
        let payload = { optionId: selectedOption, pollId: selectedPoll };

        if (user && user.user_id) {
          payload.userId = user.user_id;
        } else {
          if (!userIp) await this.fetchUserIp();
          if (!this.state.userIp) {
            alert('Error: Could not determine your IP address.');
            return;
          }
          payload.userIp = this.state.userIp;
        }

        await api.post('vote/', payload);
        Swal.fire({
          title: "Successfully polled!",
          icon: "success",
          toast: true,
          timer: 3000,
          position: 'bottom-right',
          timerProgressBar: true,
          showConfirmButton: false,
      });
        console.log("Vote submitted for option ID:", selectedOption);
        this.fetchVoteResults();

        const updatedPoints = await onUpdatePoints();
        console.log("Points updated in Navbar:", updatedPoints);
        updateUserPointsExternally(updatedPoints);
      } catch (error) {
        console.error('Error submitting vote:', error);
      }
    } else {
      alert('Please select an option before voting.');
    }
  };

  fetchVoteResults = async () => {
    const { selectedPoll } = this.props;

    try {
      const resultsResponse = await api.get(`vote-results/?poll=${selectedPoll}`);
      const results = resultsResponse.data;

      const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
      this.setState({ voteResults: results, totalVotes });
    } catch (error) {
      console.error('Error fetching vote results', error);
    }
  };

  render() {
    const { selectedPoll } = this.props;
    const { pollOptions, selectedPollDetails, selectedOption, voteResults, totalVotes, hasVoted } = this.state;
  
    return (
      <div className="container mt-4">
        {selectedPoll ? (
          <div className="card">
            <div className="card-body">
              {selectedPollDetails && (
                <p className="card-text">{selectedPollDetails.description}</p>
              )}
  
              {!voteResults && !hasVoted ? (
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
                    // Ensure voteResults and option.id are defined before accessing
                    const voteCount = voteResults && option.id in voteResults ? voteResults[option.id] : 0;
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
                  <h3 className='text-center'>You got 10 points. Thanks for your polling. </h3>
                </div>
              )}
  
              {!voteResults && !hasVoted && (
                <button
                  className="btn btn-primary mt-4"
                  onClick={this.handleVote}
                  disabled={!selectedOption}
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

export default MainContent;
