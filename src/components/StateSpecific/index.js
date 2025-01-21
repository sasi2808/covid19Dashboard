import {Component} from 'react';
import {
  BarChart,
  LabelList,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ResponsiveContainer,
} from 'recharts';

import Loader from 'react-loader-spinner';
import Header from '../Header';
import './index.css';
import Footer from '../Footer';

class StateSpecific extends Component {
  static districtsConvertObjectsDataIntoListItemsUsingForInMethod = districts => {
    const resultList = [];
    const keyNames = Object.keys(districts);

    keyNames.forEach(keyName => {
      if (districts[keyName]) {
        const {total} = districts[keyName];
        const confirmed = total.confirmed ? total.confirmed : 0;
        const deceased = total.deceased ? total.deceased : 0;
        const recovered = total.recovered ? total.recovered : 0;

        resultList.push({
          districtName: keyName,
          confirmed,
          deceased,
          recovered,
          active: confirmed - (deceased + recovered),
        });
      }
    });
    return resultList;
  };

  static formattingBarChartCases = value => {
    if (value >= 1000) {
      if (value < 100000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return `${(value / 100000).toFixed(1)}L`;
    }
    return value;
  };

  state = {
    specificStateDetails: {},
    districtsList: [],
    selectedCaseDetailsCard: 'confirmed',
    barChartTimelinesDataList: [],
    timelinesDataList: [],
    isStateDetailsLoading: true,
    isTimeLinesDataLoading: true,
    isHamburgerIconSelected: false,
  };

  componentDidMount() {
    this.getSpecificStateDetails();
    this.getTimelinesData();
  }

  getSpecificStateDetails = async () => {
    const {match} = this.props;
    const {params} = match;
    const {stateCode} = params;
    const options = {
      method: 'GET',
    };
    const response = await fetch(
      'https://apis.ccbp.in/covid19-state-wise-data',
      options,
    );
    const data = await response.json();
    const {total, meta, districts} = data[stateCode];
    const districtsList = StateSpecific.districtsConvertObjectsDataIntoListItemsUsingForInMethod(
      districts,
    );
    const confirmed = total.confirmed ? total.confirmed : 0;
    const deceased = total.deceased ? total.deceased : 0;
    const recovered = total.recovered ? total.recovered : 0;
    const active = confirmed - (recovered + deceased);
    const specificStateDetails = {
      lastUpdatedDate: meta.last_updated,
      confirmed,
      recovered,
      deceased,
      tested: data[stateCode].total.tested,
      active,
    };
    this.setState({
      specificStateDetails,
      districtsList,
      isStateDetailsLoading: false,
    });
  };

  static getDaySuffix = day => {
    if (day >= 11 && day <= 13) return 'th';

    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  static getDateForBarChart = barDate => {
    const date = new Date(barDate);
    const day = date.getDate();
    const options = {month: 'short'};
    const month = date.toLocaleDateString('en-uk', options);
    return `${day} ${month}`;
  };

  timelinesDataConvertObjectsDataIntoListItemsUsingForInMethod = timelinesData => {
    const resultList = [];

    const {match} = this.props;
    const {params} = match;
    const {stateCode} = params;

    const keyNames = Object.keys(timelinesData[stateCode].dates);

    keyNames.forEach(eachKey => {
      if (timelinesData[stateCode].dates[eachKey]) {
        const {total} = timelinesData[stateCode].dates[eachKey];
        const confirmed = total.confirmed ? total.confirmed : 0;
        const deceased = total.deceased ? total.deceased : 0;
        const recovered = total.recovered ? total.recovered : 0;
        const active = confirmed - (recovered + deceased);
        const tested = total.tested ? total.tested : 0;

        resultList.push({
          date: eachKey,
          confirmed,
          recovered,
          deceased,
          active,
          tested,
        });
      }
    });

    return resultList;
  };

  getTimelinesData = async () => {
    const {match} = this.props;
    const {params} = match;
    const {stateCode} = params;

    const options = {
      method: 'GET',
    };
    const response = await fetch(
      `https://apis.ccbp.in/covid19-timelines-data/${stateCode}`,
      options,
    );
    const timelinesData = await response.json();

    const timelinesDataList = this.timelinesDataConvertObjectsDataIntoListItemsUsingForInMethod(
      timelinesData,
    );
    const barChartTimelinesDataList = timelinesDataList.map(forEachDate => ({
      date: StateSpecific.getDateForBarChart(forEachDate.date),
      confirmed: forEachDate.confirmed,
      active: forEachDate.active,
      recovered: forEachDate.recovered,
      deceased: forEachDate.deceased,
    }));

    this.setState({
      timelinesDataList,
      barChartTimelinesDataList: barChartTimelinesDataList.slice(-10),
      isTimeLinesDataLoading: false,
    });
  };

  onClickConfirmedCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'confirmed'});
  };

  onClickActiveCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'active'});
  };

  onClickRecoveredCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'recovered'});
  };

  onClickDeceasedCasesCard = () => {
    this.setState({selectedCaseDetailsCard: 'deceased'});
  };

  topDistrictsColor = () => {
    const {selectedCaseDetailsCard} = this.state;

    switch (selectedCaseDetailsCard) {
      case 'confirmed':
        return '#FF073A';
      case 'active':
        return '#007BFF';
      case 'recovered':
        return '#28A745';
      case 'deceased':
        return '#6C757D';
      default:
        return null;
    }
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
    const {
      specificStateDetails,
      selectedCaseDetailsCard,
      districtsList,
      barChartTimelinesDataList,
      timelinesDataList,
      isStateDetailsLoading,
      isTimeLinesDataLoading,
      isHamburgerIconSelected,
    } = this.state;

    const {
      lastUpdatedDate,
      tested,
      confirmed,
      active,
      deceased,
      recovered,
    } = specificStateDetails;

    const {statesList, match} = this.props;
    const {params} = match;
    const {stateCode} = params;
    const {stateName} = statesList.find(
      eachState => eachState.stateCode === stateCode,
    );

    const date = new Date(lastUpdatedDate);
    const day = date.getDate();
    const dayWithSuffix = day + StateSpecific.getDaySuffix(day);
    const options = {year: 'numeric', month: 'long'};
    const monthYear = date.toLocaleDateString('en-us', options);
    const monthYearList = monthYear.split(' ');
    const finalString = `Last update on ${monthYearList[0]} ${dayWithSuffix} ${monthYearList[1]}.`;

    const confirmedCardBackgroundColor =
      selectedCaseDetailsCard === 'confirmed' ? '#331427' : 'transparent';
    const activeCardBackgroundColor =
      selectedCaseDetailsCard === 'active' ? '#132240' : 'transparent';
    const recoveredCardBackgroundColor =
      selectedCaseDetailsCard === 'recovered' ? '#182829' : 'transparent';
    const deceasedCardBackgroundColor =
      selectedCaseDetailsCard === 'deceased' ? '#212230' : 'transparent';

    const topDistricts = districtsList.sort(
      (a, b) => b[selectedCaseDetailsCard] - a[selectedCaseDetailsCard],
    );

    return (
      <div className="state-specific-container">
        <Header onClickingHamburgerIcon={this.onClickingHamburgerIcon} />
        <div className="main-mobile-system-content-container">
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
            <div className="state-specific-content-container">
              {isStateDetailsLoading ? (
                <div
                  data-testid="stateDetailsLoader"
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
                      <p className="tested-heading">Tested</p>
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
                        data-testid="stateSpecificConfirmedCasesContainer"
                        className=" country-wide-confirmed-cases-card"
                      >
                        <p className="confirmed-heading">Confirmed</p>
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
                        data-testid="stateSpecificActiveCasesContainer"
                        className=" country-wide-active-cases-card"
                      >
                        <p className="active-heading">Active</p>
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
                        data-testid="stateSpecificRecoveredCasesContainer"
                        className=" country-wide-recovered-cases-card"
                      >
                        <p className="recovered-heading">Recovered</p>
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
                        data-testid="stateSpecificDeceasedCasesContainer"
                        className=" country-wide-deceased-cases-card"
                      >
                        <p className="deceased-heading">Deceased</p>
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
                    data-testid="topDistrictsUnorderedList"
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
                  <ResponsiveContainer
                    className="bar-chart-container"
                    width="90%"
                    height={400}
                  >
                    <BarChart
                      data={barChartTimelinesDataList}
                      margin={{top: 10, right: 30, left: 20, bottom: 25}}
                      barGap={50}
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
                          formatter={value =>
                            StateSpecific.formattingBarChartCases(value)
                          }
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer
                    className="mini-bar-chart-container"
                    width="90%"
                    height={350}
                  >
                    <BarChart
                      data={barChartTimelinesDataList}
                      margin={{top: 10, right: 30, left: 20, bottom: 25}}
                      barGap={13}
                    >
                      <Bar
                        dataKey={selectedCaseDetailsCard}
                        fill={this.topDistrictsColor()}
                        barSize={30}
                        radius={[8, 8, 0, 0]}
                      >
                        <LabelList
                          dataKey="date"
                          position="bottom"
                          style={{
                            fill: this.topDistrictsColor(),
                            fontWeight: '500',
                            fontFamily: 'Roboto',
                            fontSize: '4px',
                          }}
                          offset={10}
                          formatter={value => value.toUpperCase()}
                        />
                        <LabelList
                          dataKey={selectedCaseDetailsCard}
                          position="top"
                          style={{
                            fill: this.topDistrictsColor(),
                            fontWeight: '500',
                            fontFamily: 'Roboto',
                            fontSize: '4px',
                          }}
                          offset={10}
                          formatter={value =>
                            StateSpecific.formattingBarChartCases(value)
                          }
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
              <div className="daily-spread-trends-line-charts-container">
                <h1 className="daily-spread-trends-heading">
                  Daily Spread Trends
                </h1>
                {isTimeLinesDataLoading ? (
                  <div
                    data-testid="timelinesDataLoader"
                    className="time-lines-loader-container"
                  >
                    <Loader
                      type="Oval"
                      color="#007bff"
                      height={80}
                      width={80}
                    />
                  </div>
                ) : (
                  <div data-testid="lineChartsContainer">
                    <div
                      className="confirmed-cases-line-chart-container"
                      style={{backgroundColor: '#331427', marginTop: '28px'}}
                    >
                      <h1 className="line-chart-confirmed-heading">
                        Confirmed
                      </h1>
                      <ResponsiveContainer width="90%" height={290}>
                        <LineChart
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
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="mini-confirmed-cases-line-chart-container"
                      style={{backgroundColor: '#331427', marginTop: '28px'}}
                    >
                      <h1 className="line-chart-confirmed-heading">
                        Confirmed
                      </h1>
                      <ResponsiveContainer width="90%" height={250}>
                        <LineChart
                          data={timelinesDataList}
                          margin={{top: 1, right: 20, left: 20, bottom: 15}}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{
                              fontFamily: 'Roboto',
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
                              fill: '#FF073A',
                            }}
                            tickLine={{stroke: '#FF073A', strokeWidth: 1}}
                            axisLine={{stroke: '#FF073A', strokeWidth: 1}}
                            tickMargin={8}
                            tickSize={6}
                            ticks={['2021-07-19', '2021-08-05', '2021-08-28']}
                          />
                          <YAxis
                            tick={{
                              fontFamily: 'Roboto',
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                            strokeWidth="1"
                            dot={{
                              stroke: ' #FF073A',
                              strokeWidth: 0,
                              fill: '#FF073A',
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                      <ResponsiveContainer width="90%" height={290}>
                        <LineChart
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
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="mini-confirmed-cases-line-chart-container"
                      style={{backgroundColor: '#132240', marginTop: '28px'}}
                    >
                      <h1
                        className="line-chart-confirmed-heading"
                        style={{color: '#007BFF'}}
                      >
                        Total Active
                      </h1>
                      <ResponsiveContainer width="90%" height={250}>
                        <LineChart
                          data={timelinesDataList}
                          margin={{top: 1, right: 20, left: 20, bottom: 15}}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{
                              fontFamily: 'Roboto',
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                            strokeWidth="1"
                            dot={{
                              stroke: ' #007BFF',
                              strokeWidth: 0,
                              fill: '#007BFF',
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                      <ResponsiveContainer width="90%" height={290}>
                        <LineChart
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
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="mini-confirmed-cases-line-chart-container"
                      style={{backgroundColor: '#182829', marginTop: '28px'}}
                    >
                      <h1
                        className="line-chart-confirmed-heading"
                        style={{color: '#27A243'}}
                      >
                        Recovered
                      </h1>
                      <ResponsiveContainer width="90%" height={250}>
                        <LineChart
                          data={timelinesDataList}
                          margin={{top: 1, right: 20, left: 20, bottom: 15}}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{
                              fontFamily: 'Roboto',
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                            strokeWidth="1"
                            dot={{
                              stroke: ' #27A243',
                              strokeWidth: 0,
                              fill: '#27A243',
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                      <ResponsiveContainer width="90%" height={290}>
                        <LineChart
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
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="mini-confirmed-cases-line-chart-container"
                      style={{backgroundColor: '#1C1C2B', marginTop: '28px'}}
                    >
                      <h1
                        className="line-chart-confirmed-heading"
                        style={{color: '#6C757D'}}
                      >
                        Deceased
                      </h1>
                      <ResponsiveContainer width="90%" height={250}>
                        <LineChart
                          data={timelinesDataList}
                          margin={{top: 1, right: 20, left: 20, bottom: 15}}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{
                              fontFamily: 'Roboto',
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                            strokeWidth="1"
                            dot={{
                              stroke: ' #6C757D',
                              strokeWidth: 0,
                              fill: '#6C757D',
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                      <ResponsiveContainer width="90%" height={290}>
                        <LineChart
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
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="mini-confirmed-cases-line-chart-container"
                      style={{backgroundColor: '#230F41', marginTop: '28px'}}
                    >
                      <h1
                        className="line-chart-confirmed-heading"
                        style={{color: '#9673B9'}}
                      >
                        Tested
                      </h1>
                      <ResponsiveContainer width="90%" height={250}>
                        <LineChart
                          data={timelinesDataList}
                          margin={{top: 1, right: 20, left: 20, bottom: 15}}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{
                              fontFamily: 'Roboto',
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                              fontSize: '8px',
                              fontWeight: '450',
                              lineHeight: '12px',
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
                            strokeWidth="1"
                            dot={{
                              stroke: ' #9673B9',
                              strokeWidth: 0,
                              fill: '#9673B9',
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Footer />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default StateSpecific;
