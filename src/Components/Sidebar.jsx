import React from "react";
import logo from '../assets/logo.png';
import { IoLogOutOutline } from "react-icons/io5";
import { FaDownload, FaFileAlt, FaExchangeAlt } from "react-icons/fa";

export default function Sidebar({ onLogout, currentSection, setCurrentSection }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <img className="logoPng" src={logo} alt="Logo" />
      </div>

      <nav className="nav">
        <button 
          className={`nav-item ${currentSection === 'loads' ? 'load' : ''}`}
          onClick={() => setCurrentSection('loads')}
        >
          <FaDownload className="icon" />
          Loads 
        </button>
        <button 
          className={`nav-item ${currentSection === 'statements' ? 'load' : ''}`}
          onClick={() => setCurrentSection('statements')}
        >
          <FaFileAlt className="icon" />
          Statements
        </button>
        <button 
          className={`nav-item ${currentSection === 'transactions' ? 'load' : ''}`}
          onClick={() => setCurrentSection('transactions')}
        >
          <FaExchangeAlt className="icon" />
          Transactions
        </button>
      </nav>

      <div className="logout" onClick={onLogout}>
        <IoLogOutOutline />
        <p>Logout</p>
      </div>
    </aside>
  );
}
