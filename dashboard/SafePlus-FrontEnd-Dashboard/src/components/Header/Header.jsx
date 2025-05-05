import { Link } from 'react-router-dom'
import './Header.css'
import logo from '/assets/logo.webp'

const Header = () => {
  return (
    <nav>
    <div className='header'>
      <img src={logo} alt='' className='logo'/>
      <ul>
        <li><Link to='/livedata'>Live Data</Link></li>
        <li><Link to='/workerdetails'>Worker Details</Link></li>
        <li><Link to='/reports'>Reports</Link></li>
        
      </ul>
      <img src='' alt='' className='setting'/>

    </div>
    </nav>
  )
}

export default Header