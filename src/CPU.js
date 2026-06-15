import logo from './CPU.png';
import './CPU.css';
import React from 'react';

function CPUPage({ setCurrentPage }) {
    return (
    <div className="CPUPage">
        <div className="Clogo">
            <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="HeadText">
            <h1>CPU</h1>
        </div>
        <div className="BackButton">
            <button className="BButton" onClick={() => setCurrentPage('second')}>
                Back to Home
            </button>
        </div>
    </div>
    );
}

export default CPUPage;
