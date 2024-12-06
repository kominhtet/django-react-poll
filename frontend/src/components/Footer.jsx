import React from 'react';
import logo from '../assets/8days.png';
import ymg from '../assets/ymg.png';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Logos section */}
        <div style={styles.logos}>
          <a href="https://8daystv.com/" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="Company Logo" style={styles.logoImage} />
          </a>
          <a href="https://yangonmediagroup.com/" target="_blank" rel="noopener noreferrer">
            <img src={ymg} alt="YMG Logo" style={styles.logoImage} />
          </a>
        </div>

        {/* Text section */}
        <div style={styles.textSection}>
          <p style={styles.text}>&copy; {new Date().getFullYear()} Myanmar Survey Team Center. All rights reserved.</p>
          <p style={styles.text}>
            Powered by{' '}
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" style={styles.link}>
              MSTC
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

// Styles for the footer component
const styles = {
  footer: {
    backgroundColor: '#222831', // Dark background for a modern look
    color: '#EEEEEE',            // Light text color for contrast
    padding: '20px 0',
    marginTop: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    borderTop: '3px solid #00ADB5', // Accent border color
    fontFamily: '"Inter", sans-serif',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    flexWrap: 'wrap', // Allow wrap for responsive layout
  },
  logos: {
    display: 'flex',
    gap: '20px',
  },
  logoImage: {
    borderRadius: '8px', // Slightly rounded edges for a modern look
    width: '50px',
    height: '50px',
    transition: 'transform 0.3s ease', // Smooth hover effect
  },
  textSection: {
    textAlign: 'right',
    minWidth: '250px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  text: {
    fontWeight: 500,
    color: '#EEEEEE',
    fontSize: '14px',
    margin: '0',
  },
  link: {
    color: '#00ADB5',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.3s ease', // Smooth color change on hover
  },
};

// Hover effects for logos and links
styles.logoImage[':hover'] = { transform: 'scale(1.1)' };
styles.link[':hover'] = { color: '#EEEEEE' };

export default Footer;
