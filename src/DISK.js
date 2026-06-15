import React from 'react';
import './DISK.css';

function DISKPage({ setCurrentPage }) {
    return (
    <div className="DISKPage">
        <div className="HeadText">
            <h1>DISK</h1>
        </div>
        <div className="BackButton">
            <button className="BButton" onClick={() => setCurrentPage('second')}>
                Back
            </button>
        </div>
    </div>
    );
}

export default DISKPage;