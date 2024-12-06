import React, { useState, useContext, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthContext from '../context/AuthContext';
import api from '../api';

const PointSummary = ({ userPoints }) => {
  const { user } = useContext(AuthContext);
  const [isReceivedPage, setIsReceivedPage] = useState(true);
  const [fetchedPoints, setFetchedPoints] = useState(userPoints);
  const [usedPointsTotal, setUsedPointsTotal] = useState(0); // Total used points
  const [usedPointsData, setUsedPointsData] = useState([]); // Used points transactions
  const [totalPoints, setTotalPoints] = useState(userPoints);
  const [receivedPoints, setReceivedPoints] = useState([]);

  // Fetch received points (votes) from the API
  const fetchReceivedPoints = async () => {
    if (user) {
      try {
        const response = await api.get('votes/');
        const userVotes = response.data
          .filter(vote => vote.user === user.user_id)
          .map(vote => ({
            id: vote.id,
            name: vote.poll_option.name,
            date: new Date(vote.voted_at).toLocaleDateString(),
            points: vote.poll_option.point,
          }))
          .sort((a, b) => b.id - a.id); // Sort by descending order of `id`
  
        setReceivedPoints(userVotes); // Set sorted data
      } catch (error) {
        console.error("Error fetching received points:", error);
        setReceivedPoints([]);
      }
    }
  };

  // Fetch individual used points transactions
  const fetchUsedPointsData = async () => {
    if (user) {
      try {
        const response = await api.get('change-points/');
        const userChanges = response.data.filter(change => change.user.id === user.user_id);
        const usedPointsTransactions = userChanges.map(change => ({
          id: change.id,
          name: change.point_exchange_type.name,
          date: new Date(change.created_at).toLocaleDateString(),
          points: -change.points_used,
        }));
        setUsedPointsData(usedPointsTransactions);
      } catch (error) {
        console.error("Error fetching used points transactions:", error);
        setUsedPointsData([]);
      }
    }
  };

  // Fetch total used points from the custom API endpoint
  useEffect(() => {
    const fetchUsedPointsTotal = async () => {
      if (user) {
        try {
          const response = await api.get('change-points/total-points-used/');
          const usedPoint = response.data.find(item => item.user__id === user.user_id);
          setUsedPointsTotal(usedPoint ? usedPoint.total_points_used : 0);
        } catch (error) {
          console.error("Error fetching total used points:", error);
          setUsedPointsTotal(0);
        }
      }
    };
    fetchUsedPointsTotal();
  }, [user]);

  // Fetch received points on initial render
  useEffect(() => {
    fetchReceivedPoints();
  }, [user,]);

  // Fetch user profile points
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user) {
        try {
          const response = await api.get('profile/');
          const userProfile = response.data.find(item => item.id === user.user_id);
          setFetchedPoints(userProfile ? userProfile.total_points : 0);
        } catch (error) {
          console.error("Error fetching user points:", error);
          setFetchedPoints(0);
        }
      }
    };
    fetchUserPoints();
  }, [user]);

  // Fetch total points from custom endpoint
  useEffect(() => {
    const fetchTotalUserPoints = async () => {
      if (user) {
        try {
          const response = await api.get('apiuser-points/');
          const totalPoint = response.data.find(item => item.user__id === user.user_id);
          setTotalPoints(totalPoint ? totalPoint.total_points : 0);
        } catch (error) {
          console.error("Error fetching total points:", error);
          setTotalPoints(0);
        }
      }
    };
    fetchTotalUserPoints();
  }, [user]);

  // Toggle view between received and used points
  const handleTogglePage = (isReceived) => {
    setIsReceivedPage(isReceived);
    if (isReceived) {
      setUsedPointsData([]); // Reset used points transactions data
      fetchReceivedPoints();
    } else {
      setReceivedPoints([]); // Reset received points data
      fetchUsedPointsData();
    }
  };

  // Data to display based on selected page
  const dataToDisplay = isReceivedPage ? receivedPoints : usedPointsData;

  return (
    <div className="container my-4" style={{ maxWidth: '600px' }}>
      {/* Summary Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ fontWeight: 'bold' }}>ပွိုင့်မှတ်တမ်း</h4>
        <div className="d-flex gap-2">
          <span style={{ color: 'green' }}>ရရှိ: {totalPoints}</span>
          <span style={{ color: 'red' }}>သုံးစွဲ: {usedPointsTotal}</span>
          <span style={{ color: 'blue' }}>လက်ကျန်: {fetchedPoints}</span>
        </div>
      </div>
      <hr />

      {/* Toggle Buttons */}
      <div className="d-flex justify-content-center mb-3">
        <button
          onClick={() => handleTogglePage(true)}
          className={`btn btn-sm d-flex align-items-center ${isReceivedPage ? 'btn-primary' : 'btn-light'}`}
          style={{ borderRadius: '30px', padding: '5px 20px', fontSize: '14px', marginRight: '10px' }}
        >
          ရရှိသောပွိုင့်များ
        </button>
        <button
          onClick={() => handleTogglePage(false)}
          className={`btn btn-sm d-flex align-items-center ${!isReceivedPage ? 'btn-primary' : 'btn-light'}`}
          style={{ borderRadius: '30px', padding: '5px 20px', fontSize: '14px' }}
        >
          သုံးစွဲပွိုင့်များ
        </button>
      </div>

      {/* List of Points */}
      <div className="list-group">
        {dataToDisplay.map(item => (
          <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Circle with + or - sign */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isReceivedPage ? '#28a745' : '#dc3545',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  lineHeight: '24px',
                  textAlign: 'center',
                  marginRight: '10px',
                }}
              >
                {isReceivedPage ? '+' : '-'}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Voted for {item.name}</span>
                <br />
                <small className="text-muted">{item.date}</small>
              </div>
            </div>
            <span style={{ color: isReceivedPage ? 'green' : 'red', fontWeight: 'bold' }}>
              {item.points > 0 ? `+${item.points}` : item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointSummary;
