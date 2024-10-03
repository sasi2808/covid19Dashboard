import {VscGithubAlt} from 'react-icons/vsc'
import {FiInstagram} from 'react-icons/fi'
import {FaTwitter} from 'react-icons/fa'

import './index.css'

const Footer = () => (
  <div className="footer-container">
    <h1 className="footer-covid19-heading">
      COVID19<span className="footer-india-span">INDIA</span>
    </h1>
    <p className="footer-description">
      we stand with everyone fighting on the front lines
    </p>
    <div className="footer-icons-container">
      <VscGithubAlt className="footer-icon" />
      <FiInstagram className="footer-icon" />
      <FaTwitter className="footer-icon" />
    </div>
  </div>
)
export default Footer
