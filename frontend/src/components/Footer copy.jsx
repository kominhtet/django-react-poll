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
    backgroundColor: '#ffffff',
    color: '#343a40',
    padding: '20px 0',
    marginTop: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px', // Added padding for better spacing
  },
  logos: {
    display: 'flex',
    gap: '15px',
  },
  logoImage: {
    borderRadius: '50%',
    width: '40px',
    height: '40px',
  },
  textSection: {
    textAlign: 'right',
  },
  text: {
    marginBottom: '5px',
    fontFamily: '"Inter", Helvetica',
    fontWeight: 700,
    color: '#2980b9',
    fontSize: '15px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default Footer;
