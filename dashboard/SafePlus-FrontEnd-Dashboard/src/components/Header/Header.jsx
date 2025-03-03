import './Header.css'
import logo from '/assets/logo.webp'

const Header = () => {
  return (
    <div className='header'>
      <img src={logo} alt='' className='logo'/>
      <ul>
        <li>Live Data</li>
        <li>Worker Details</li>
        <li>Reports</li>
      </ul>
      <img src='' alt='' className='setting'/>

    </div>
  )
}

export default Header