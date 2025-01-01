import {Component} from 'react'
import {
  BarChart,
  LabelList,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts'

import Loader from 'react-loader-spinner'
import Header from '../Header'
import './index.css'
import Footer from '../Footer'

class StateSpecific extends Component {
  state = {
    specificStateDetails: {},
    districtsList: [],
    selectedCaseDetailsCard: 'confirmed',
    barChartTimelinesDataList: [],
    timelinesDataList: [],
    isStateDetailsLoading: true,
    isTimeLinesDataLoading: true,
  }

  componentDidMount() {
    this.getSpecificStateDetails()
    this.getTimelinesData()
  }

  districtsConvertObjectsDataIntoListItemsUsingForInMethod = districts => {
    const resultList = []
    const keyNames = Object.keys(districts)

    keyNames.forEach(keyName => {
      if (districts[keyName]) {
        const {total} = districts[keyName]
        const confirmed = total.confirmed ? total.confirmed : 0
        const deceased = total.deceased ? total.deceased : 0
        const recovered = total.recovered ? total.recovered : 0

        resultList.push({
          districtName: keyName,
          confirmed,
          deceased,
          recovered,
          active: confirmed - (deceased + recovered),
        })
      }
    })
    return resultList
  }

  getSpecificStateDetails = async () => {
    const {match} = this.props
    const {params} = match
    const {stateCode} = params
    const options = {
      method: 'GET',
    }
    const response = await fetch(
      'https://apis.ccbp.in/covid19-state-wise-data',
      options,
    )
    const data = await response.json()
    const {total, meta, districts} = data[stateCode]
    const districtsList = this.districtsConvertObjectsDataIntoListItemsUsingForInMethod(
      districts,
    )
    const confirmed = total.confirmed ? total.confirmed : 0
    const deceased = total.deceased ? total.deceased : 0
    const recovered = total.recovered ? total.recovered : 0
    const active = confirmed - (recovered + deceased)
    const specificStateDetails = {
      lastUpdatedDate: meta.last_updated,
      confirmed,
      recovered,
      deceased,
      tested: data[stateCode].total.tested,
      active,
    }
    this.setState({
      specificStateDetails,
      districtsList,
      isStateDetailsLoading: false,
    })
  }

  getDaySuffix = day => {
    if (day >= 11 && day <= 13) return 'th'

    switch (day % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }

  timelinesDataConvertObjectsDataIntoListItemsUsingForInMethod = timelinesData => {
    const resultList = []

    const {match} = this.props
    const {params} = match
    const {stateCode} = params

    const keyNames = Object.keys(timelinesData[stateCode].dates)

    keyNames.forEach(eachKey => {
      if (timelinesData[stateCode].dates[eachKey]) {
        const {total} = timelinesData[stateCode].dates[eachKey]
        const confirmed = total.confirmed ? total.confirmed : 0
        const deceased = total.deceased ? total.deceased : 0
        const recovered = total.recovered ? total.recovered : 0
        const active = confirmed - (recovered + deceased)
        const tested = total.tested ? total.tested : 0

        resultList.push({
          date: eachKey,
          confirmed,
          recovered,
          deceased,
          active,
          tested,
        })
      }
    })

    return resultList
  }

  getDateForBarChart = barDate => {
    const date = new Date(barDate)
    const day = date.getDate()
    const options = {month: 'short'}
    const month = date.toLocaleDateString('en-uk', options)
    return `${day} ${month}`
  }

  getTimelinesData = async () => {
    const {match} = this.props
    const {params} = match
    const {stateCode} = params

    const options = {
      method: 'GET',
    }
    const response = await fetch(
      `https://apis.ccbp.in/covid19-timelines-data/${stateCode}`,
      options,
    )
    const timelinesData = await response.json()

    const timelinesDataList = this.timelinesDataConvertObjectsDataIntoListItemsUsingForInMethod(
      timelinesData,
    )
    const barChartTimelinesDataList = timelinesDataList.map(forEachDate => ({
      date: this.getDateForBarChart(forEachDate.date),
      confirmed: forEachDate.confirmed,
      active: forEachDate.active,
      recovered: forEachDate.recovered,
      deceased: forEachDate.deceased,
    }))

    this.setState({
      timelinesDataList,
      barChartTimelinesDataList: barChartTimelinesDataList.slice(-10),
      isTimeLinesDataLoading: false,
    })
  }

  onClickConfirmedCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'confirmed'})
  }

  onClickActiveCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'active'})
  }

  onClickRecoveredCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'recovered'})
  }

  onClickDeceasedCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'deceased'})
  }

  topDistrictsColor = () => {
    const {selectedCaseDetailsCard} = this.state

    switch (selectedCaseDetailsCard) {
      case 'confirmed':
        return '#FF073A'
      case 'active':
        return '#007BFF'
      case 'recovered':
        return '#28A745'
      case 'deceased':
        return '#6C757D'
      default:
        return null
    }
  }

  formattingBarChartCases = value => {
    if (value >= 1000) {
      if (value < 100000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return `${(value / 100000).toFixed(1)}L`
    }
    return value
  }

  render() {
    const {
      specificStateDetails,
      selectedCaseDetailsCard,
      districtsList,
      barChartTimelinesDataList,
      timelinesDataList,
      isStateDetailsLoading,
      isTimeLinesDataLoading,
    } = this.state

    const {
      lastUpdatedDate,
      tested,
      confirmed,
      active,
      deceased,
      recovered,
    } = specificStateDetails

    const {statesList, match} = this.props
    const {params} = match
    const {stateCode} = params
    const {stateName} = statesList.find(
      eachState => eachState.stateCode === stateCode,
    )

    const date = new Date(lastUpdatedDate)
    const day = date.getDate()
    const dayWithSuffix = day + this.getDaySuffix(day)
    const options = {year: 'numeric', month: 'long'}
    const monthYear = date.toLocaleDateString('en-us', options)
    const monthYearList = monthYear.split(' ')
    const finalString = `Last update on ${monthYearList[0]} ${dayWithSuffix} ${monthYearList[1]}.`

    const confirmedCardBackgroundColor =
      selectedCaseDetailsCard === 'confirmed' ? '#331427' : 'transparent'
    const activeCardBackgroundColor =
      selectedCaseDetailsCard === 'active' ? '#132240' : 'transparent'
    const recoveredCardBackgroundColor =
      selectedCaseDetailsCard === 'recovered' ? '#182829' : 'transparent'
    const deceasedCardBackgroundColor =
      selectedCaseDetailsCard === 'deceased' ? '#212230' : 'transparent'

    const topDistricts = districtsList.sort(
      (a, b) => b[selectedCaseDetailsCard] - a[selectedCaseDetailsCard],
    )

    return (
      <div className="state-specific-container">
        <Header />
        <div className="state-specific-content-container">
          {isStateDetailsLoading ? (
            <div
              testid="stateDetailsLoader"
              className="state-details-loader-container"
            >
              <Loader type="Oval" color="#007bff" height={80} width={80} />
            </div>
          ) : (
            <>
              <div className="state-name-tested-count-container">
                <div>
                  <h1 className="state-name-heading">{stateName}</h1>
                  <p className="last-updated-date-text">{finalString}</p>
                </div>
                <div>
                  <h1 className="tested-heading">Tested</h1>
                  <p className="tested-cases-count">{tested}</p>
                </div>
              </div>
              <div className="state-specific-cases-details-container cases-details-container">
                <button
                  type="button"
                  onClick={this.onClickConfirmedCasesCard}
                  className="cases-details-card-button"
                  style={{
                    backgroundColor: confirmedCardBackgroundColor,
                  }}
                >
                  <div
                    testid="stateSpecificConfirmedCasesContainer"
                    className=" country-wide-confirmed-cases-card"
                  >
                    <h1 className="confirmed-heading">Confirmed</h1>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725803960/c9xvg4hse2d7uirrzrg1.png"
                      alt="state specific confirmed cases pic"
                      className="country-wide-confirmed-cases-pic"
                    />
                    <p className="confirmed-cases-count">{confirmed}</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="cases-details-card-button"
                  onClick={this.onClickActiveCasesCard}
                  style={{
                    backgroundColor: activeCardBackgroundColor,
                  }}
                >
                  <div
                    testid="stateSpecificActiveCasesContainer"
                    className=" country-wide-active-cases-card"
                  >
                    <h1 className="active-heading">Active</h1>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725808445/difw8wxlzelmwt5dhmko.png"
                      alt="state specific active cases pic"
                      className="country-wide-active-cases-pic"
                    />
                    <p className="active-cases-count">{active}</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="cases-details-card-button"
                  onClick={this.onClickRecoveredCasesCard}
                  style={{
                    backgroundColor: recoveredCardBackgroundColor,
                  }}
                >
                  <div
                    testid="stateSpecificRecoveredCasesContainer"
                    className=" country-wide-recovered-cases-card"
                  >
                    <h1 className="recovered-heading">Recovered</h1>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725808928/nmzagyzvvgndlz36arjm.png"
                      alt="state specific recovered cases pic"
                      className="country-wide-recovered-cases-pic"
                    />
                    <p className="recovered-cases-count">{recovered}</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="cases-details-card-button"
                  onClick={this.onClickDeceasedCasesCard}
                  style={{
                    backgroundColor: deceasedCardBackgroundColor,
                  }}
                >
                  <div
                    testid="stateSpecificDeceasedCasesContainer"
                    className=" country-wide-deceased-cases-card"
                  >
                    <h1 className="deceased-heading">Deceased</h1>
                    <img
                      src="https://res.cloudinary.com/dio3xtbss/image/upload/v1725809559/otktge0gfjukkhro65ip.png"
                      alt="state specific deceased cases pic"
                      className="country-wide-deceased-cases-pic"
                    />
                    <p className="deceased-cases-count">{deceased}</p>
                  </div>
                </button>
              </div>
              <h1
                className="top-districts-heading"
                style={{color: this.topDistrictsColor()}}
              >
                Top Districts
              </h1>
              <ul
                testid="topDistrictsUnorderedList"
                className="top-districts-unordered-list-container"
              >
                {topDistricts.map(district => (
                  <li
                    className="each-district-list-item"
                    key={district.districtName}
                  >
                    <p className="district-cases-count">
                      {district[selectedCaseDetailsCard]}
                    </p>
                    <p className="district-name">{district.districtName}</p>
                  </li>
                ))}
              </ul>
              <div className="bar-chart-container">
                <BarChart
                  width={1000}
                  height={400}
                  data={barChartTimelinesDataList}
                  margin={{top: 10, right: 30, left: 20, bottom: 25}}
                  barCategoryGap="20%"
                  barGap={100}
                >
                  <Bar
                    dataKey={selectedCaseDetailsCard}
                    fill={this.topDistrictsColor()}
                    barSize={60}
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList
                      dataKey="date"
                      position="bottom"
                      style={{
                        fill: this.topDistrictsColor(),
                        fontWeight: '400',
                        fontFamily: 'Roboto',
                        fontSize: '14px',
                      }}
                      offset={10}
                      formatter={value => value.toUpperCase()}
                    />
                    <LabelList
                      dataKey={selectedCaseDetailsCard}
                      position="top"
                      style={{
                        fill: this.topDistrictsColor(),
                        fontWeight: '400',
                        fontFamily: 'Roboto',
                        fontSize: '14px',
                      }}
                      offset={10}
                      formatter={value => this.formattingBarChartCases(value)}
                    />
                  </Bar>
                </BarChart>
              </div>
            </>
          )}

          <div className="daily-spread-trends-line-charts-container">
            <h1 className="daily-spread-trends-heading">Daily Spread Trends</h1>
            {isTimeLinesDataLoading ? (
              <div
                testid="timelinesDataLoader"
                className="time-lines-loader-container"
              >
                <Loader type="Oval" color="#007bff" height={80} width={80} />
              </div>
            ) : (
              <div testid="lineChartContainer">
                <div className="confirmed-cases-line-chart-container">
                  <h1 className="line-chart-confirmed-heading">Confirmed</h1>
                  <LineChart
                    width={1200}
                    height={290}
                    data={timelinesDataList}
                    margin={{top: 1, right: 20, left: 20, bottom: 15}}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#FF073A',
                      }}
                      tickLine={{stroke: '#FF073A', strokeWidth: 1}}
                      axisLine={{stroke: '#FF073A', strokeWidth: 1}}
                      tickMargin={10}
                      tickSize={8}
                      ticks={['2021-07-19', '2021-08-05', '2021-08-28']}
                    />
                    <YAxis
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#FF073A',
                      }}
                      tickLine={{stroke: '#FF073A', strokeWidth: 1}}
                      axisLine={{stroke: '#FF073A', strokeWidth: 1}}
                      tickMargin={8}
                      tickSize={8}
                      tickFormatter={value =>
                        value > 0 ? `${value / 1000}K` : 0
                      }
                    />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="confirmed"
                      stroke="#FF073A"
                      strokeWidth="2"
                      dot={{
                        stroke: ' #FF073A',
                        strokeWidth: 1,
                        fill: '#FF073A',
                      }}
                    />
                  </LineChart>
                </div>
                <div
                  className="confirmed-cases-line-chart-container"
                  style={{backgroundColor: '#132240', marginTop: '28px'}}
                >
                  <h1
                    className="line-chart-confirmed-heading"
                    style={{color: '#007BFF'}}
                  >
                    Total Active
                  </h1>
                  <LineChart
                    width={1200}
                    height={290}
                    data={timelinesDataList}
                    margin={{top: 1, right: 20, left: 20, bottom: 15}}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#007BFF',
                      }}
                      tickLine={{stroke: '#007BFF', strokeWidth: 1}}
                      axisLine={{stroke: '#007BFF', strokeWidth: 1}}
                      tickMargin={10}
                      tickSize={8}
                      ticks={['2021-07-19', '2021-08-05', '2021-08-28']}
                    />
                    <YAxis
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#007BFF',
                      }}
                      tickLine={{stroke: '#007BFF', strokeWidth: 1}}
                      axisLine={{stroke: '#007BFF', strokeWidth: 1}}
                      tickMargin={8}
                      tickSize={8}
                    />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#007BFF"
                      strokeWidth="2"
                      dot={{
                        stroke: ' #007BFF',
                        strokeWidth: 1,
                        fill: '#007BFF',
                      }}
                    />
                  </LineChart>
                </div>
                <div
                  className="confirmed-cases-line-chart-container"
                  style={{backgroundColor: '#182829', marginTop: '28px'}}
                >
                  <h1
                    className="line-chart-confirmed-heading"
                    style={{color: '#27A243'}}
                  >
                    Recovered
                  </h1>
                  <LineChart
                    width={1200}
                    height={290}
                    data={timelinesDataList}
                    margin={{top: 1, right: 20, left: 20, bottom: 15}}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#27A243',
                      }}
                      tickLine={{stroke: '#27A243', strokeWidth: 1}}
                      axisLine={{stroke: '#27A243', strokeWidth: 1}}
                      tickMargin={10}
                      tickSize={8}
                      ticks={['2021-07-19', '2021-08-05', '2021-08-28']}
                    />
                    <YAxis
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#27A243',
                      }}
                      tickLine={{stroke: '#27A243', strokeWidth: 1}}
                      axisLine={{stroke: '#27A243', strokeWidth: 1}}
                      tickMargin={8}
                      tickSize={8}
                      tickFormatter={value =>
                        value > 0 ? `${value / 1000}K` : 0
                      }
                    />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="recovered"
                      stroke="#27A243"
                      strokeWidth="2"
                      dot={{
                        stroke: ' #27A243',
                        strokeWidth: 1,
                        fill: '#27A243',
                      }}
                    />
                  </LineChart>
                </div>
                <div
                  className="confirmed-cases-line-chart-container"
                  style={{backgroundColor: '#1C1C2B', marginTop: '28px'}}
                >
                  <h1
                    className="line-chart-confirmed-heading"
                    style={{color: '#6C757D'}}
                  >
                    Deceased
                  </h1>
                  <LineChart
                    width={1200}
                    height={290}
                    data={timelinesDataList}
                    margin={{top: 1, right: 20, left: 20, bottom: 15}}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#6C757D',
                      }}
                      tickLine={{stroke: '#6C757D', strokeWidth: 1}}
                      axisLine={{stroke: '#6C757D', strokeWidth: 1}}
                      tickMargin={10}
                      tickSize={8}
                      ticks={['2021-07-19', '2021-08-05', '2021-08-28']}
                    />
                    <YAxis
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#6C757D',
                      }}
                      tickLine={{stroke: '#6C757D', strokeWidth: 1}}
                      axisLine={{stroke: '#6C757D', strokeWidth: 1}}
                      tickMargin={8}
                      tickSize={8}
                    />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="deceased"
                      stroke="#6C757D"
                      strokeWidth="2"
                      dot={{
                        stroke: ' #6C757D',
                        strokeWidth: 1,
                        fill: '#6C757D',
                      }}
                    />
                  </LineChart>
                </div>
                <div
                  className="confirmed-cases-line-chart-container"
                  style={{backgroundColor: '#230F41', marginTop: '28px'}}
                >
                  <h1
                    className="line-chart-confirmed-heading"
                    style={{color: '#9673B9'}}
                  >
                    Tested
                  </h1>
                  <LineChart
                    width={1200}
                    height={290}
                    data={timelinesDataList}
                    margin={{top: 1, right: 20, left: 20, bottom: 15}}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#9673B9',
                      }}
                      tickLine={{stroke: '#9673B9', strokeWidth: 1}}
                      axisLine={{stroke: '#9673B9', strokeWidth: 1}}
                      tickMargin={10}
                      tickSize={8}
                      ticks={['2021-07-19', '2021-08-05', '2021-08-28']}
                    />
                    <YAxis
                      tick={{
                        fontFamily: 'Roboto',
                        fontSize: '13px',
                        fontWeight: '450',
                        lineHeight: '24px',
                        fill: '#9673B9',
                      }}
                      tickLine={{stroke: '#9673B9', strokeWidth: 1}}
                      axisLine={{stroke: '#9673B9', strokeWidth: 1}}
                      tickMargin={8}
                      tickSize={8}
                      tickFormatter={value =>
                        value > 0 ? `${value / 100000}L` : 0
                      }
                    />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="tested"
                      stroke="#9673B9"
                      strokeWidth="2"
                      dot={{
                        stroke: ' #9673B9',
                        strokeWidth: 1,
                        fill: '#9673B9',
                      }}
                    />
                  </LineChart>
                </div>
              </div>
            )}
          </div>
          <div
            style={{width: '90%', display: 'flex', justifyContent: 'center'}}
          >
            <Footer />
          </div>
        </div>
      </div>
    )
  }
}

export default StateSpecific