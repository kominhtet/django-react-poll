import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Modal } from 'react-bootstrap';
import './Profile.css';
import AuthContext from '../context/AuthContext';
import api from '../api'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';

const Profile = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    image: null,
  });
  const prevUserRef = useRef();

  // Wrap fetchProfile with useCallback
  const fetchProfile = useCallback(async () => {
    if (!user) return;
      try {
        const response = await api.get('profile/');
        const profileData = response.data.find((item) => item.id === user.user_id);
        console.log(profileData)
        console.log(profileData.image)
        if (profileData) {
          setUserProfile(profileData);
          
          setFormData({
            username: profileData.username,
            email: profileData.email,
            phone: profileData.phone || '',
            address: profileData.address || '',
            image: null,
          });
        } else {
          console.log("User profile not found in response.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    
  }, [user]);

  useEffect(() => {
    if (prevUserRef.current !== user) {
      if (user) {
        fetchProfile();
      } else {
        console.log('User is not logged in');
      }
      prevUserRef.current = user;
    }
  }, [user, fetchProfile]);

  const handleBadgeClick = () => {
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('user.username', formData.username);
    formDataToSubmit.append('user.email', formData.email);
    formDataToSubmit.append('phone', formData.phone);
    formDataToSubmit.append('address', formData.address);
    if (formData.image) {
      formDataToSubmit.append('image', formData.image);
    }

    try {
      await api.patch(`profile/${user.user_id}/`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authTokens.access}`
        },
      });
      Swal.fire({
        title: "Profile updated successfully",
        icon: "success",
        toast: true,
        timer: 3000,
        position: 'bottom-right',
        timerProgressBar: true,
        showConfirmButton: false,
    });
      // alert('Profile updated successfully');
      setShowModal(false);
      fetchProfile(); // Refresh profile data after update
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      alert('Error updating profile');
    }
  };

  return (
    <Container className="profile-container my-4">
      <Row className="justify-content-center">
        <Col xs={12} md={4} className="text-center">
          <div className="profile-picture-wrapper">
          <div className="profile-picture mx-auto mb-3">
            {userProfile && userProfile.image ? (
              <img
                src={userProfile.image} // Directly using the complete image URL
                alt="Profile"
                className="rounded-circle"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
            ) : (
              "Image"
            )}
          </div>
            <Badge bg="info" className="edit-badge" onClick={handleBadgeClick} style={{ cursor: 'pointer' }}>
              <i className="bi bi-pencil-square"></i>
            </Badge>
          </div>
          <h5 className="user-name mb-2">{userProfile ? userProfile.username : "Full Name"}</h5>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col xs={12} md={6}>
          <Card className="profile-card mb-3">
            <Card.Body>
              <Card.Title className="text-muted">အီးမေးလ်</Card.Title>
              <Card.Text>{userProfile ? userProfile.email : "Email"}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="profile-card mb-3">
            <Card.Body>
              <Card.Title className="text-muted">ဖုန်းနံပါတ်</Card.Title>
              <Card.Text>{userProfile ? userProfile.phone : "Phone"}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="profile-card mb-3">
            <Card.Body>
              <Card.Title className="text-muted">နေရပ်လိပ်စာ</Card.Title>
              <Card.Text>{userProfile ? userProfile.address : "Address"}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="profile-card mb-3">
            <Card.Body>
              <Card.Title className="text-muted">စာရင်းသွင်းသည့်ရက်</Card.Title>
              <Card.Text>{userProfile ? userProfile.date_joined : "Joined Date"}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col xs={12} md={6}>
          <Card className="profile-stat-card mb-3 d-flex justify-content-between align-items-center p-3">
            <span className="stat-title">ဖြေဆိုပြီး စစ်တမ်းအရေအတွက်</span>
            <span className="stat-value">{userProfile ? userProfile.survey_count : "0"}</span>
          </Card>

          <Card className="profile-stat-card mb-3 d-flex justify-content-between align-items-center p-3">
            <span className="stat-title">စုစုပေါင်းရမှတ်</span>
            <span className="stat-value">{userProfile ? userProfile.total_points : "0"}</span>
          </Card>

          <Card className="profile-stat-card mb-3 d-flex justify-content-between align-items-center p-3">
            <span className="stat-title">ဖြေဆိုမှုရာခိုင်နှုန်း</span>
            <span className="stat-value">{userProfile ? userProfile.completion_rate : "0%"}</span>
          </Card>
        </Col>
      </Row>

      {/* Modal for Editing Profile */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleImageChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;
