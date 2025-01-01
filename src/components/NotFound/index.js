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
        alt="notFoundImg"
        className="not-found-img"
      />
      <p className="page-not-found-text">PAGE NOT FOUND</p>
      <p className="not-found-description">
        we’re sorry, the page you requested could not be found Please go back to
        the homepage
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
