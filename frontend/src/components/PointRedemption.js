import React, { useEffect, useState, useRef, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthContext from '../context/AuthContext';
import api from '../api'; 
import { updateUserPointsExternally } from './Navbar';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const PointRedemption = ({ userPoints }) => {
  const [selectedOperator, setSelectedOperator] = useState('Ooredoo');
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isFormValidated, setIsFormValidated] = useState(false);

  const { user, authTokens  } = useContext(AuthContext);
  const [fetchedPoints, setFetchedPoints] = useState(userPoints);
  const prevUserRef = useRef();

  // Fetch and update user points on mount
  useEffect(() => {
    const updateUserPoints = async () => {
      if (user) {
        try {
          const response = await api.get('profile/');
          const userPointData = response.data.find((item) => item.id === user.user_id);
          const updatedPoints = userPointData ? userPointData.total_points : 0;
          setFetchedPoints(updatedPoints);
        } catch (error) {
          console.error("Error fetching user points:", error);
          setFetchedPoints(0);
        }
      }
    };

    if (prevUserRef.current !== user) {
      if (user) {
        updateUserPoints();
      } else {
        console.log('User is not logged in');
      }
      prevUserRef.current = user;
    }
  }, [user]);

  const operatorOptions = ['MPT', 'Ooredoo', 'ATOM'];
  const amountOptions = [
    { amount: 10, points: 10 },
    { amount: 30, points: 30 },
    { amount: 50, points: 50 },
    { amount: 100, points: 100 },
    { amount: 150, points: 150 },
    { amount: 200, points: 200 }
  ];

  const selectedPoints = amountOptions.find(option => option.amount === selectedAmount)?.points || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setIsFormValidated(true);
      return;
    }
    setIsFormValidated(false);

    if (fetchedPoints < selectedPoints) {
      alert('Not enough points for this redemption');
      return;
    }

    setShowModal(true);
  };

  // Function to handle confirmation of redemption
  const handleConfirmRedemption = async () => {
    if (!authTokens || !authTokens.access) {
        console.error('No token available');
        alert('Please log in to redeem points.');
        return;
    }

    // console.log(`Using token: Bearer ${authTokens.access}`);  
    // console.log(`User information: ID=${user.user_id}, Username=${user.username}`);
    try {
        const response = await api.post(
            'redeem-points/',
            {
                user_id: user.user_id,
                points_used: selectedPoints,
                point_exchange_type: 1,  // Correct data format
            },
            {
                headers: {
                    Authorization: `Bearer ${authTokens.access}`, // Double-check the token format
                },
            }
        );

        if (response.status === 201) {
          Swal.fire({
            title: "Redemption successful!",
            icon: "success",
            toast: true,
            timer: 3000,
            position: 'bottom-right',
            timerProgressBar: true,
            showConfirmButton: false,
        });  
          // alert('Redemption successful!');
            const newRemainingPoints = response.data.remaining_points;
            setFetchedPoints(response.data.remaining_points);
            updateUserPointsExternally(newRemainingPoints);
        } else {
            alert('Redemption failed');
        }
    } catch (error) {
        console.error('Error redeeming points:', error);
        alert('Error processing redemption');
    }
    setShowModal(false);
};

  return (
    <form
      noValidate
      className={isFormValidated ? 'was-validated' : ''}
      onSubmit={handleSubmit}
    >
      <div className="container" style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h4 style={{ color: '#0063b4', fontWeight: 'bold'}}>Exchange with Phone Bill</h4>
        <h3 style={{ fontSize: '10px', fontWeight: 'bold' }}><Link to="/pointhistory">Point History</Link></h3>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Your Points : {fetchedPoints}</h3>

        {/* Operator Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label>Operator:</label>

          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '10px 0' }}>
            {operatorOptions.map((operator) => (
              <button
                type="button"
                key={operator}
                style={{
                  backgroundColor: selectedOperator === operator ? '#0063b4' : '#f0f0f0',
                  color: selectedOperator === operator ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedOperator(operator)}
              >
                {operator}
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number Input */}
        <div style={{ marginBottom: '20px' }}>
          <label>Confirm Phone Number</label>
          <input
            type="text"
            value={confirmPhoneNumber}
            onChange={(e) => setConfirmPhoneNumber(e.target.value)}
            placeholder="09 123 456 789"
            required 
            className="form-control"
            style={{
              padding: '10px',
              fontSize: '16px',
              margin: '10px 0',
            }}
          />
          <div className="invalid-feedback">Please enter your phone number.</div>
        </div>

        {/* Amount Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label>Amount</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {amountOptions.map(({ amount, points }) => (
              <button
                type="button"
                key={amount}
                style={{
                  backgroundColor: selectedAmount === amount ? '#0063b4' : '#f0f0f0',
                  color: selectedAmount === amount ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  padding: '10px',
                  margin: '5px',
                  cursor: 'pointer',
                  flex: '1 1 30%',
                  maxWidth: '120px',
                }}
                onClick={() => setSelectedAmount(amount)}
              >
                {amount} Ks - {points} Pts
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p>Use Points:</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedAmount} Ks - {selectedPoints} Pts</p>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#0063b4',
            color: '#fff',
            padding: '10px',
            fontSize: '18px',
            width: '100%',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          လဲလှယ်ရန်
        </button>

        {/* Main Confirmation Modal */}
        {showModal && (
          <div
            className="modal-overlay"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050,
            }}
          >
            <div
              className="modal-dialog"
              style={{
                maxWidth: '300px',
                width: '90%',
                position: 'relative',
                margin: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div className="modal-content" style={{ borderRadius: '10px', padding: '5px' }}>
                <div className="modal-header" style={{ borderBottom: 'none', padding: '5px 15px', justifyContent: 'center' }}>
                  <h5 className="modal-title text-center" style={{ fontWeight: 'bold', fontSize: '16px', margin: '0' }}>Confirm</h5>
                </div>
                
                <div className="modal-body" style={{ padding: '10px 15px', textAlign: 'center', fontSize: '14px' }}>
                  <p style={{ marginBottom: '10px' }}>
                    Get <strong>{selectedAmount} Ks</strong> for <strong>{selectedPoints} points.</strong>
                  </p>
                  <p style={{ marginBottom: '5px' }}>
                    The exchange gift will be added to number <strong>{confirmPhoneNumber}</strong>.
                  </p>
                </div>
                
                <div className="modal-footer" style={{ borderTop: 'none', justifyContent: 'space-between', padding: '10px 20px' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)} style={{ width: '100px', padding: '5px' }}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleConfirmRedemption} style={{ width: '100px', padding: '5px' }}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PointRedemption;
