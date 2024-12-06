import React from 'react';
import survey from '../assets/survey.png';

const About = () => {
  return (
    <section id="header" className="d-flex align-items-center" style={{ padding: '2rem 0' }}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-10 mx-auto">
            <div className="row d-flex align-items-center">
              <div className="col-md-6 order-2 order-lg-1 d-flex justify-content-center flex-column">
                <h1 className="text-3xl font-bold mb-4">About Myanmar Survey Team Center</h1>
                <p className="text-lg text-gray-600 mb-3">
                  Myanmar Survey Team Center is a modern, interactive platform for gathering insights on popular opinions across a range of topics, from programming languages to food preferences.
                </p>
                <p className="text-lg text-gray-600">
                  Our goal is to help you quickly set up polls and collect data from your audience in a fast and user-friendly manner. Stay tuned for more exciting features!
                </p>
              </div>
              <div className="col-lg-6 order-1 order-lg-2 d-flex justify-content-center">
                <img src={survey} alt="Survey Icon" className="img-fluid animated" style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
