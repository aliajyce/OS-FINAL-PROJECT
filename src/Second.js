import React from 'react';
import './Second.css';
import logo from './Logo_Aliah.png';

function SecondPage({ setCurrentPage }) {
    return (
    <div className="SecondPage">
        <div className="Slogo">
            <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="HeadText">
            <h1>What Would You Like to Work Today?</h1>
        </div>
        <div className="Buttons">
            <button className="Button1" onClick={() => setCurrentPage('CPU')}>
                <p>CPU</p>
            </button>
            <button className="Button2" onClick={() => setCurrentPage('MEMORY')}>
                <p>MEMORY</p>
            </button>
            <button className="Button3" onClick={() => setCurrentPage('VIRTUALM')}>
                <p>VIRTUAL MEMORY</p>
            </button>
            <button className="Button4" onClick={() => setCurrentPage('DISK')}>
                <p>DISK</p>
            </button>
        </div>
        <div className="BackButton">
            <button className="BButton" onClick={() => setCurrentPage('first')}>
                Back to Home
            </button>
        </div>
    </div>
    );
}

export default SecondPage;