import React, { useEffect, useState, useRef, useContext } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from './sidebar/index';
import MainContent from './main-content/index';
import AuthContext from '../context/AuthContext';
import api from '../api'; 
import { Link } from 'react-router-dom';

const PollList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const { user } = useContext(AuthContext);
  const prevUserRef = useRef();

  useEffect(() => {
    if (prevUserRef.current !== user) {
      if (user) {
        // console.log('Logged-in user object:', user);
      } else {
        console.log('User is not logged in');
      }
      prevUserRef.current = user;
    }
  }, [user]);

  const handleSearch = (term) => {
    console.log("Search term updated:", term); // Debug log
    setSearchTerm(term);
  };

  const selectPoll = (id) => {
    setSelectedPoll(id);
    console.log('Selected Poll ID:', id); // Debug log
  };

  const updateUserPoints = async () => {
    if (user) {
      try {
        const response = await api.get('profile/');
        const userPointData = response.data.find((item) => item.id === user.user_id);
        console.log("Fetched updated points:", userPointData ? userPointData.total_points : 0); // Debug log
        return userPointData ? userPointData.total_points : 0;
      } catch (error) {
        console.error("Error fetching user points:", error);
        return 0;
      }
    }
    return 0;
  };

  return (
    <Container className='my-5'>
      <Row>
        <Col md={6}>
          <Sidebar
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            selectPoll={selectPoll}
          />
        </Col>
        <Col md={6}>
          <MainContent 
            selectedPoll={selectedPoll} 
            user={user} 
            onUpdatePoints={updateUserPoints}
            onUpdateUserPoints={updateUserPoints}
          />
        </Col>
      </Row>
      
      <div className='text-end mt-3'>
        <Link to="/pointredemption">
          <button className="btn btn-primary rounded-pill px-4 py-2">
            ပွိုင့်လဲလှယ်ရန်
          </button>
        </Link>
      </div>
    </Container>
  );
};

export default PollList;
