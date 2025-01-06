import './index.css'

const NotFound = props => {
  const {history} = props
  const onClickingHomeButton = () => {
    history.push('/')
  }

  return (
    <div className="not-found-container">
      <img
        src="https://res.cloudinary.com/dio3xtbss/image/upload/v1735739238/notfound_qvgedk.png"
        alt="not-found-pic"
        className="not-found-img"
      />
      <h1 className="page-not-found-text">PAGE NOT FOUND</h1>
      <p className="not-found-description">
        we are sorry, the page you requested could not be found
      </p>
      <button
        type="button"
        className="home-button"
        onClick={onClickingHomeButton}
      >
        Home
      </button>
    </div>
  )
}
export default NotFound
