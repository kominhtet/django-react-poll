import React, { useEffect, useState, useRef, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api'; 
const Exchange = ({ userPoints }) => {
  const { user } = useContext(AuthContext);
  const [fetchedPoints, setFetchedPoints] = useState(userPoints);
  const prevUserRef = useRef();

  useEffect(() => {
    const updateUserPoints = async () => {
      if (user) {
        try {
          const response = await api.get('user-points/');
          const userPointData = response.data.find((item) => item.user__id === user.user_id);
          const updatedPoints = userPointData ? userPointData.total_points : 0;
          // console.log("Fetched updated points:", updatedPoints);
          setFetchedPoints(updatedPoints);
        } catch (error) {
          console.error("Error fetching user points:", error);
          setFetchedPoints(0);
        }
      }
    };

    if (prevUserRef.current !== user) {
      if (user) {
        // console.log('Logged-in user object:', user);
        updateUserPoints();
      } else {
        console.log('User is not logged in');
      }
      prevUserRef.current = user;
    }
  }, [user]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center gap-3">
        {/* Gold Exchange Card */}
        <div className="card shadow-sm" style={{ width: '20rem', padding: '1rem', backgroundColor: '#3498db', color: 'white', borderRadius: '10px' }}>
          <div className="card-body text-center">
            <h5 className="card-title" style={{ color: 'white' }}>Gold Membership</h5>
            <p className="card-text">
              <span className="badge bg-warning" style={{ fontSize: '1rem', padding: '0.5rem' }}>{fetchedPoints} Pts</span>
            </p>
            <button className="btn btn-light mt-2" style={{ fontWeight: 'bold' }}>to Exchange</button>
          </div>
        </div>

        {/* Phone Bill Exchange Options */}
        <div className="card shadow-sm" style={{ width: '30rem', padding: '1rem', borderRadius: '10px' }}>
          <div className="card-body d-flex justify-content-between align-items-center">
            <h5 className="card-title">Phone Bill - 1000</h5>
            <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem' }}>3000 Pts</span>
          </div>
          <div className="card-body d-flex justify-content-between align-items-center">
            <h5 className="card-title">Phone Bill - 3000</h5>
            <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem' }}>6000 Pts</span>
          </div>
        </div>
      </div>
      <div className="container justify-content-center text-center mt-3">
        <h3 className="text-gray-600 mb-3">Point Exchange System</h3>
        <p className="text-gray-200 mb-3">ရရှိလာသည့်အမှတ်များကိုလဲလှယ်နိုင်ပါသည်။</p>
        
      </div>
    </div>
  );
};

export default Exchange;
