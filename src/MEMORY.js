import React from 'react';
import './MEMORY.css';

function MEMORYPage({ setCurrentPage }) {
    return (
    <div className="MEMORYPage">
        <div className="HeadText">
            <h1>MEMORY</h1>
        </div>
        <div className="BackButton">
            <button className="BButton" onClick={() => setCurrentPage('second')}>
                Back
            </button>
        </div>
    </div>
    );
}

export default MEMORYPage;