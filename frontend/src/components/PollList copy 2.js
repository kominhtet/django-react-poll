import React, { useEffect, useState, useRef, useContext } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from './sidebar/index';
import MainContent from './main-content/index';
import AuthContext from '../context/AuthContext'; // Import AuthContext

const PollList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const { user } = useContext(AuthContext); // Access user from context
  const prevUserRef = useRef();

  useEffect(() => {
    if (prevUserRef.current !== user) {
      if (user) {
        console.log('Logged-in user object:', user);
        console.log('User object keys:', Object.keys(user));
        console.log('Logged-in user ID:', user.user_id || user.id);
      } else {
        console.log('User is not logged in');
      }
      prevUserRef.current = user;
    }
  }, [user]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const selectPoll = (id) => {
    setSelectedPoll(id);
    console.log('Selected Poll ID:', id);
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
          <MainContent selectedPoll={selectedPoll} user={user} />
        </Col>
      </Row>

      {user && (
        <div className="user-info mt-4">
          <h5>User Information</h5>
          <p>Email: {user.email}</p>
          <p>Username: {user.username}</p>
          <p>User ID: {user.user_id || user.id}</p>
        </div>
      )}
    </Container>
  );
};

export default PollList;
