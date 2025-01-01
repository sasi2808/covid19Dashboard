import {NavLink} from 'react-router-dom'

import './index.css'

const Header = () => (
  <nav className="nav-container">
    <ul className="unordered-list-header-container">
      <li className="covid19India-heading-list-item">
        <h1 className="covid19-heading-element">
          COVID19<span className="india-span-element">INDIA</span>
        </h1>
      </li>
      <NavLink
        exact
        to="/"
        className="home-list-item"
        activeClassName="active-link"
      >
        <li>Home</li>
      </NavLink>
      <NavLink
        exact
        to="/about"
        className="about-list-item"
        activeClassName="active-link"
      >
        <li>About</li>
      </NavLink>
    </ul>
  </nav>
)

export default Header
