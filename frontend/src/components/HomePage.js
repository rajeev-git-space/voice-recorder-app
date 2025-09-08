import React from 'react';//, { useState, useEffect, useRef }
import './HomePage.css';

const HomePage = () => {

    return (
        <div className="home-container">
            <h1 className="welcome-heading">Welcome to Voice Recorder App</h1>
            <div className="card-container">
                <div className="card">
                    <h2>Technical Expertise</h2>
                    <ul>
                        <li>Node.js</li>
                        <li>JavaScript</li>
                        <li>Backend</li>
                        <li>AWS Serverless</li>
                        <li>Lambda</li>
                        <li>DynamoDB</li>
                        <li>S3</li>
                        <li>Cloudwatch</li>
                        <li>API Gateway</li>
                        <li>SQS</li>
                        <li>SES</li>
                        <li>Cognito</li>
                        <li>Express.js</li>
                        <li>Swagger</li>
                        <li>React.js (Basics)</li>
                    </ul>
                </div>
                <div className="card">
                    <h2>Projects Experience</h2>
                    <ul>
                        <li>CFPP (recent module)</li>
                        <li>Accounting (module)</li>
                        <li>PharmaWRK</li>
                        <li>ServiceWRK</li>
                        <li>ScanTags</li>
                        <li>Goodwill Donation App</li>
                        <li>WorkTop (maintenance)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
