import logo from './Logo_Aliah.png';
import './App.css';
import SecondPage from './Second';
import React, { useState } from 'react';
import CPUPage from './CPU';
import MEMORYPage from './MEMORY';
import VIRTUALPage from './VIRTUALM';
import DISKPage from './DISK';

function App() {
  const [currentPage, setCurrentPage] = useState('first');

  if (currentPage === 'second') {
    return <SecondPage setCurrentPage={setCurrentPage} />;
  }
  if (currentPage === 'CPU') {
    return <CPUPage setCurrentPage={setCurrentPage} />;
  }
  if (currentPage === 'MEMORY') {
    return <MEMORYPage setCurrentPage={setCurrentPage} />;
  }
  if (currentPage === 'VIRTUALM') {
    return <VIRTUALPage setCurrentPage={setCurrentPage} />;
  }
  if (currentPage === 'DISK') {
    return <DISKPage setCurrentPage={setCurrentPage} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="StartButton">
          <button className="SButton" onClick={() => setCurrentPage('second')}>
            Start
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;