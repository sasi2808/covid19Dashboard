import React from 'react'

const lastUpdatedDateContext = React.createContext({
  lastUpdatedDate: '',
  getLastUpdatedDateString: () => {},
})

export default lastUpdatedDateContext
