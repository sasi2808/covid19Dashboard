import {Component} from 'react'

import Loader from 'react-loader-spinner'
import Header from '../Header'
import Footer from '../Footer'

import './index.css'

class About extends Component {
  state = {
    faqsList: [],
    isLoading: true,
  }

  componentDidMount() {
    this.getFaqs()
  }

  getFaqs = async () => {
    const response = await fetch('https://apis.ccbp.in/covid19-faqs')
    const aboutRouteApiCallData = await response.json()

    this.setState({faqsList: aboutRouteApiCallData.faq, isLoading: false})
  }

  render() {
    const {faqsList, isLoading} = this.state

    return (
      <div className="about-container">
        <Header />
        {isLoading ? (
          <div
            testid="aboutRouteLoader"
            className="about-route-loader-container"
          >
            <Loader type="Oval" color="#007bff" height={80} width={80} />
          </div>
        ) : (
          <div className="about-content-container">
            <h1 className="about-route-heading">About</h1>
            <p className="about-route-last-update-date">
              Last update on September 7th 2021.
            </p>
            <p className="about-route-description">
              COVID-19 vaccines be ready for distribution
            </p>
            <ul testid="faqsUnorderedList" className="faqs-unordered-list">
              {faqsList.map(eachFaq => (
                <li key={eachFaq.qno} style={{padding: '0px'}}>
                  <p className="question">{eachFaq.question}</p>
                  <p className="answer">{eachFaq.answer}</p>
                </li>
              ))}
            </ul>
            <div
              style={{width: '90%', display: 'flex', justifyContent: 'center'}}
            >
              <Footer />
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default About
