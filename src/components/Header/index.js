import {NavLink, withRouter} from 'react-router-dom'

import './index.css'

const Header = props => {
  const {onClickingHamburgerIcon} = props

  const toggleHamburgerIcon = () => {
    onClickingHamburgerIcon()
  }

  return (
    <nav className="nav-container">
      <ul className="unordered-list-header-container">
        <li className="covid19India-heading-list-item">
          <h1 className="covid19-heading-element">
            COVID19<span className="india-span-element">INDIA</span>
          </h1>
        </li>
        <li className="hamburger-icon-mobile-view">
          <button
            type="button"
            className="hamburger-icon-button"
            onClick={toggleHamburgerIcon}
          >
            <img
              src="https://res.cloudinary.com/dio3xtbss/image/upload/v1736070639/hamburger_icon_v0pfy4.png"
              alt="hamburger icon mobile view"
            />
          </button>
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
}

export default withRouter(Header)
