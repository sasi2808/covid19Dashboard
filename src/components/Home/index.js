import {Component} from 'react'
import {Link} from 'react-router-dom'
import {BsSearch} from 'react-icons/bs'
import {FcGenericSortingAsc, FcGenericSortingDesc} from 'react-icons/fc'
import {BiChevronRightSquare} from 'react-icons/bi'

import Loader from 'react-loader-spinner'

import Header from '../Header'
import Footer from '../Footer'

import './index.css'

class Home extends Component {
  state = {
    stateWiseCasesDetailsList: [],
    searchInput: '',
    sortOrder: 'asc',
    isLoading: true,
    isHamburgerIconSelected: false,
  }

  componentDidMount() {
    this.getStateWiseData()
  }

  convertObjectsDataIntoListItemsUsingForInMethod = data => {
    const resultList = []
    const {statesList} = this.props
    const keyNames = Object.keys(data)

    keyNames.forEach(keyName => {
      if (data[keyName]) {
        const {total} = data[keyName]
        const confirmed = total.confirmed ? total.confirmed : 0
        const deceased = total.deceased ? total.deceased : 0
        const recovered = total.recovered ? total.recovered : 0
        const population = data[keyName].meta.population
          ? data[keyName].meta.population
          : 0
        const state = statesList.find(
          eachState => eachState.stateCode === keyName,
        )

        const name = state ? state.stateName : ''
        resultList.push({
          stateCode: keyName,
          name,
          confirmed,
          deceased,
          recovered,
          population,
          active: confirmed - (deceased + recovered),
        })
      }
    })
    return resultList
  }

  getStateWiseData = async () => {
    const url = 'https://apis.ccbp.in/covid19-state-wise-data'
    const response = await fetch(url)
    const data = await response.json()
    const listFormattedDataUsingForInMethod = this.convertObjectsDataIntoListItemsUsingForInMethod(
      data,
    )

    const filteredListFormattedDataUsingForInMethod = listFormattedDataUsingForInMethod.filter(
      eachState => eachState.name !== '',
    )

    this.setState({
      stateWiseCasesDetailsList: filteredListFormattedDataUsingForInMethod,
      isLoading: false,
    })
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  getFilteredStates = () => {
    const {stateWiseCasesDetailsList, searchInput} = this.state
    if (searchInput === '') {
      return []
    }
    return stateWiseCasesDetailsList.filter(state =>
      state.name.toLowerCase().includes(searchInput.toLowerCase()),
    )
  }

  totalCases = () => {
    const {stateWiseCasesDetailsList} = this.state
    let totalCases = 0

    stateWiseCasesDetailsList.forEach(state => {
      totalCases += state.confirmed
    })
    return totalCases
  }

  totalActiveCases = () => {
    const {stateWiseCasesDetailsList} = this.state
    let totalActiveCases = 0

    stateWiseCasesDetailsList.forEach(state => {
      totalActiveCases += state.active
    })
    return totalActiveCases
  }

  totalRecoveredCases = () => {
    const {stateWiseCasesDetailsList} = this.state
    let totalRecoveredCases = 0

    stateWiseCasesDetailsList.forEach(state => {
      totalRecoveredCases += state.recovered
    })
    return totalRecoveredCases
  }

  totalDeceasedCases = () => {
    const {stateWiseCasesDetailsList} = this.state
    let totalDeceasedCases = 0

    stateWiseCasesDetailsList.forEach(state => {
      totalDeceasedCases += state.deceased
    })
    return totalDeceasedCases
  }

  changeSortOrder = order => {
    this.setState({sortOrder: order})
  }

  onClickingHamburgerIcon = () => {
    this.setState(prevState => ({
      isHamburgerIconSelected: !prevState.isHamburgerIconSelected,
    }))
  }

  onClickHomeHeaderButton = () => {
    const {history} = this.props
    history.push('/')

    this.setState({isHamburgerIconSelected: false})
  }

  onClickAboutHeaderButton = () => {
    const {history} = this.props
    history.push('/about')

    this.setState({isHamburgerIconSelected: false})
  }

  onClickWrongIcon = () => {
    this.setState({isHamburgerIconSelected: false})
  }

  render() {
    const {
      stateWiseCasesDetailsList,
      searchInput,
      sortOrder,
      isLoading,
      isHamburgerIconSelected,
    } = this.state

    const filteredStates = this.getFilteredStates()

    const sortedStates = [...stateWiseCasesDetailsList].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name)
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return (
      <div className="app-container">
        <Header onClickingHamburgerIcon={this.onClickingHamburgerIcon} />

        {isLoading ? (
          <div
            data-testid="homeRouteLoader"
            className="home-route-loader-container"
          >
            <Loader type="Oval" color="#007bff" height={80} width={80} />
          </div>
        ) : (
          <div className="content-container">
            {isHamburgerIconSelected ? (
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
            ) : (
              <>
                <div className="search-container">
                  <BsSearch className="search-icon" />
                  <input
                    type="search"
                    placeholder="Enter the State"
                    className="search-input"
                    onChange={this.onChangeSearchInput}
                    value={searchInput}
                  />
                </div>
                {filteredStates.length > 0 && (
                  <ul
                    data-testid="searchResultsUnorderedList"
                    className="search-results-unordered-list"
                  >
                    {filteredStates.map(state => (
                      <Link
                        to={`/state/${state.stateCode}`}
                        style={{textDecoration: 'none'}}
                        key={state.stateCode}
                      >
                        <li className="suggestion-item">
                          <p className="state-name">{state.name}</p>
                          <div className="redirect-icon-container">
                            <p className="state-code">{state.stateCode}</p>
                            <BiChevronRightSquare color="#FACC15" size={20} />
                          </div>
                        </li>
                      </Link>
                    ))}
                  </ul>
                )}
                <div className="cases-details-container">
                  <div
                    data-testid="countryWideConfirmedCases"
                    className="country-wide-confirmed-cases-card"
                  >
                    <p className="confirmed-heading">Confirmed</p>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725803960/c9xvg4hse2d7uirrzrg1.png"
                      alt="country wide confirmed cases pic"
                      className="country-wide-confirmed-cases-pic"
                    />
                    <p className="confirmed-cases-count">{this.totalCases()}</p>
                  </div>
                  <div
                    data-testid="countryWideActiveCases"
                    className="country-wide-active-cases-card"
                  >
                    <p className="active-heading">Active</p>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725808445/difw8wxlzelmwt5dhmko.png"
                      alt="country wide active cases pic"
                      className="country-wide-active-cases-pic"
                    />
                    <p className="active-cases-count">
                      {this.totalActiveCases()}
                    </p>
                  </div>
                  <div
                    data-testid="countryWideRecoveredCases"
                    className="country-wide-recovered-cases-card"
                  >
                    <p className="recovered-heading">Recovered</p>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725808928/nmzagyzvvgndlz36arjm.png"
                      alt="country wide recovered cases pic"
                      className="country-wide-recovered-cases-pic"
                    />
                    <p className="recovered-cases-count">
                      {this.totalRecoveredCases()}
                    </p>
                  </div>
                  <div
                    data-testid="countryWideDeceasedCases"
                    className="country-wide-deceased-cases-card"
                  >
                    <p className="deceased-heading">Deceased</p>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725809559/otktge0gfjukkhro65ip.png"
                      alt="country wide deceased cases pic"
                      className="country-wide-deceased-cases-pic"
                    />
                    <p className="deceased-cases-count">
                      {this.totalDeceasedCases()}
                    </p>
                  </div>
                </div>
                <div className="scrollable-container">
                  <div
                    className="state-wise-covid-data-table"
                    data-testid="stateWiseCovidDataTable"
                  >
                    <ul className="headings-unordered-list">
                      <li className="states-ut-list-item">
                        States/UT
                        <button
                          type="button"
                          data-testid="ascendingSort"
                          className="ascending-sort-button"
                          onClick={() => this.changeSortOrder('asc')} // Toggle sort order
                        >
                          <FcGenericSortingAsc
                            style={{
                              color: '#94A3B8',
                              width: '18px',
                              height: '18px',
                              marginBottom: '-4px',
                            }}
                          />
                        </button>
                        <button
                          type="button"
                          data-testid="descendingSor"
                          className="descending-sort-button"
                          onClick={() => this.changeSortOrder('desc')} // Toggle sort order
                        >
                          <FcGenericSortingDesc
                            style={{
                              color: '#94A3B8',
                              width: '18px',
                              height: '18px',
                              marginBottom: '-4px',
                            }}
                          />
                        </button>
                      </li>
                      <li
                        className="confirmed-list-item"
                        style={{width: '76px', marginLeft: '50px'}}
                      >
                        <p>Confirmed</p>
                      </li>
                      <li
                        className="confirmed-list-item"
                        style={{width: '46px', marginLeft: '24px'}}
                      >
                        <p> Active</p>
                      </li>
                      <li
                        className="confirmed-list-item"
                        style={{width: '77px'}}
                      >
                        <p>Recovered</p>
                      </li>
                      <li
                        className="confirmed-list-item"
                        style={{width: '71px'}}
                      >
                        <p>Deceased</p>
                      </li>
                      <li
                        className="confirmed-list-item"
                        style={{width: '78px'}}
                      >
                        <p>Population</p>
                      </li>
                    </ul>
                    <hr className="header-line" />
                    {sortedStates.map(eachState => (
                      <ul
                        className="state-wise-cases-details-unordered-list"
                        key={eachState.stateCode}
                      >
                        <li>
                          <p className="state-name">{eachState.name}</p>
                        </li>
                        <li>
                          <p className="confirmed-cases">
                            {eachState.confirmed}
                          </p>
                        </li>
                        <li>
                          <p className="active-cases">{eachState.active}</p>
                        </li>
                        <li>
                          <p className="recovered-cases">
                            {eachState.recovered}
                          </p>
                        </li>
                        <li>
                          <p className="deceased-cases">{eachState.deceased}</p>
                        </li>
                        <li>
                          <p className="population">{eachState.population}</p>
                        </li>
                      </ul>
                    ))}
                  </div>
                </div>

                <Footer />
              </>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default Home
