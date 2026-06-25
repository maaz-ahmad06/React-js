

const NewsItem = ({title, description, src, url}) => {
  return (
    <div className="card bg-dark text-light mb-3 d-inline-block my-3 mx-3 py-2 px-2" style={{maxWidth:"305px"}}>
  <img src={src} style={{height:"200px", width:"288px"}} className="card-img-top" alt="..." />
  <div className="card-body">
    <h5 className="card-title">{title.slice(0,50)}</h5>
    <p className="card-text">{description?description.slice(0,90):"News of the current event. It is information about something that just happened."}</p>
    <a href={url} className="btn btn-primary">Read More</a>    
  </div>
</div>
  )
}

export default NewsItem
