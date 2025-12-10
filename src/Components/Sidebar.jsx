import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { FaFileAlt, FaExchangeAlt, FaBriefcase, FaChartLine, FaEye } from "react-icons/fa";

export default function Sidebar({ onLogout, currentSection, setCurrentSection }) {
  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col h-screen">
      <div className="p-6 mb-8">
        <div className="text-2xl font-bold text-white mb-1">TradeNest</div>
        <div className="text-xs text-slate-400">Stock Trading Platform</div>
      </div>

      <nav className="flex flex-col gap-2 px-3">
        <button 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
            currentSection === 'market' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => setCurrentSection('market')}
        >
          <FaChartLine className="text-lg" />
          <span className="font-medium">Market</span>
        </button>
        <button 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
            currentSection === 'subscribed' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => setCurrentSection('subscribed')}
        >
          <FaEye className="text-lg" />
          <span className="font-medium">Subscribed</span>
        </button>
        <button 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
            currentSection === 'portfolio' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => setCurrentSection('portfolio')}
        >
          <FaBriefcase className="text-lg" />
          <span className="font-medium">Portfolio</span>
        </button>
        <button 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
            currentSection === 'statements' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => setCurrentSection('statements')}
        >
          <FaFileAlt className="text-lg" />
          <span className="font-medium">Statements</span>
        </button>
        <button 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
            currentSection === 'transactions' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          onClick={() => setCurrentSection('transactions')}
        >
          <FaExchangeAlt className="text-lg" />
          <span className="font-medium">Transactions</span>
        </button>
      </nav>

      <div 
        className="mt-auto mb-6 mx-3 flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg cursor-pointer transition-all duration-200"
        onClick={onLogout}
      >
        <IoLogOutOutline className="text-xl" />
        <span className="font-medium">Logout</span>
      </div>
    </aside>
  );
}
