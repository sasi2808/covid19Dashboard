import {Component} from 'react';

import parse from 'html-react-parser';

import Loader from 'react-loader-spinner';
import Header from '../Header';
import Footer from '../Footer';

import './index.css';

class About extends Component {
  state = {
    faqsList: [],
    isLoading: true,
    isHamburgerIconSelected: false,
  };

  componentDidMount() {
    this.getFaqs();
  }

  getFaqs = async () => {
    const response = await fetch('https://apis.ccbp.in/covid19-faqs');
    const aboutRouteApiCallData = await response.json();

    this.setState({faqsList: aboutRouteApiCallData.faq, isLoading: false});
  };

  onClickingHamburgerIcon = () => {
    this.setState(prevState => ({
      isHamburgerIconSelected: !prevState.isHamburgerIconSelected,
    }));
  };

  onClickHomeHeaderButton = () => {
    const {history} = this.props;
    history.push('/');

    this.setState({isHamburgerIconSelected: false});
  };

  onClickAboutHeaderButton = () => {
    const {history} = this.props;
    history.push('/about');

    this.setState({isHamburgerIconSelected: false});
  };

  onClickWrongIcon = () => {
    this.setState({isHamburgerIconSelected: false});
  };

  render() {
    const {faqsList, isLoading, isHamburgerIconSelected} = this.state;

    let content;

    if (isLoading) {
      content = (
        <div
          data-testid="aboutRouteLoader"
          className="about-route-loader-container"
        >
          <Loader type="Oval" color="#007bff" height={80} width={80} />
        </div>
      );
    } else if (isHamburgerIconSelected) {
      content = (
        <div className="mobile-view-header-drop-down">
          <ul className="home-about-header-mobile-view-unordered-list">
            <button
              type="button"
              style={{backgroundColor: 'transparent', borderWidth: '0px'}}
              onClick={this.onClickHomeHeaderButton}
            >
              <li className="home-mobile-view-list-item">Home</li>
            </button>
            <button
              type="button"
              style={{backgroundColor: 'transparent', borderWidth: '0px'}}
              onClick={this.onClickAboutHeaderButton}
            >
              <li className="about-mobile-view-list-item">About</li>
            </button>
          </ul>
          <button
            type="button"
            className="wrong-button"
            onClick={this.onClickWrongIcon}
          >
            <img
              src="https://res.cloudinary.com/dio3xtbss/image/upload/v1736094569/wrong_icon_pfar5z.png"
              alt="wrong icon"
            />
          </button>
        </div>
      );
    } else {
      content = (
        <div className="about-content-container">
          <h1 className="about-route-heading">About</h1>
          <p className="about-route-last-update-date">
            Last update on September 7th 2021.
          </p>
          <p className="about-route-description">
            COVID-19 vaccines be ready for distribution
          </p>
          <ul data-testid="faqsUnorderedList" className="faqs-unordered-list">
            {faqsList.map(eachFaq => (
              <li key={eachFaq.qno} style={{padding: '0px'}}>
                <p className="question">{eachFaq.question}</p>
                <p className="answer">{parse(eachFaq.answer)}</p>
              </li>
            ))}
          </ul>
          <div
            style={{
              width: '90%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Footer />
          </div>
        </div>
      );
    }

    return (
      <div className="about-container">
        <Header onClickingHamburgerIcon={this.onClickingHamburgerIcon} />
        {content}
      </div>
    );
  }
}

export default About;
