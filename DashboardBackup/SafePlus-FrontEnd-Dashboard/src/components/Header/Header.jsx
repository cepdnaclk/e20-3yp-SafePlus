import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';
import logo from '/assets/logo.webp';

const Header = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const time = date.toLocaleTimeString(); // e.g., 10:32:15 AM
    const dateString = date.toLocaleDateString(); // e.g., 5/9/2025
    return { time, date: dateString };

  };

  const { time, date } = formatTime(currentTime);

  return (
    <nav>
      <div className='header'>
        <img src={logo || null} alt='Logo' className='logo' />
        <div className='dashboard'>Supervisor Dashboard</div>
        

        <div className='time-display'>
          {time} <span className='live-date'>({date})</span>
        </div>
        <ul>
          <li>
            <Link to='/livedata' className={location.pathname === '/livedata' ? 'active' : ''}>Live Data</Link>
          </li>
          <li>
            <Link to='/workerdetails' className={location.pathname === '/workerdetails' ? 'active' : ''}>Worker Details</Link>
          </li>
          <li>
            <Link to='/reports' className={location.pathname === '/reports' ? 'active' : ''}>Reports</Link>
          </li>
          <li>
            <Link to='/settings' className={location.pathname === '/settings' ? 'active' : ''}>Settings</Link>
          </li>
        </ul>
        
      </div>
    </nav>
  );
};

export default Header;
