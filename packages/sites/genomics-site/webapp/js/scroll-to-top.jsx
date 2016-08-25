/**
 * Created by dfalke on 8/24/16.
 */
import { render } from 'react-dom'
import { throttle, memoize } from 'lodash'

const visibleStyle = {
  color: 'white',
  background: 'rgba(0, 0, 0, 0.19)',
  border: 'none',
  outline: 'none',
  padding: '8px',
  position: 'fixed',
  bottom: '85px',
  right: '16px',
  zIndex: 1000,
  opacity: 1,
  visibility: 'visible',
  transition: 'opacity .5s, visibility .5s'
}

const hiddenStyle = Object.assign( {} , visibleStyle , {
  opacity: 0,
  visibility: 'hidden'
} )

const scrollToTop = () => {
  location.hash = ''
  window.scrollTo( window.scrollX , 0 )
}

const ScrollToTop = () =>
  <button style={ window.scrollY > 250 ? visibleStyle : hiddenStyle } onClick={scrollToTop} title="Go back to the top of the page.">
    <i className="fa fa-2x fa-arrow-up"></i>
  </button>

const getDomNode = memoize(() =>
  document.body.appendChild(document.createElement('div')))

const renderScrollToTop = () =>
  render( <ScrollToTop/> , getDomNode() )

window.addEventListener( 'scroll' , throttle( renderScrollToTop , 250 ) )
