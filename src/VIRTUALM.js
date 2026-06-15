import React from 'react';
import './VIRTUALM.css';

function VIRTUALPage({ setCurrentPage }) {
    return (
    <div className="VIRTUALPage">
        <div className="HeadText">
            <h1>VIRTUAL MEMORY</h1>
        </div>
        <div className="BackButton">
            <button className="BButton" onClick={() => setCurrentPage('second')}>
                Back
            </button>
        </div>
    </div>
    );
}

export default VIRTUALPage;