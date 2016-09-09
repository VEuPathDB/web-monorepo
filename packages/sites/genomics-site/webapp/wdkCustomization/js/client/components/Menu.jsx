import { Component, PropTypes } from 'react';
import { Link } from 'wdk-client/Components';
import { isEmpty } from 'lodash';

/**
 * Site menu
 */
export default class Menu extends Component {

  constructor(props) {
    super(props);
    this.trackingNode = null;
    this.setPosition = this.setPosition.bind(this);
    this.state = { position: '', top: 0 };
  }

  setPosition() {
    let shouldFix = this.trackingNode.getBoundingClientRect().top < 0;
    if (shouldFix && this.state.position !== 'fixed') {
      this.setState({ position: 'fixed'});
    }
    else if (!shouldFix && this.state.position === 'fixed') {
      this.setState({ position: ''});
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.setPosition, { passive: true });
    this.setPosition();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setPosition);
  }

  render() {
    let { position, top } = this.state;
    return (
      <div ref={node => this.trackingNode = node} style={{ overflow: 'visible'}}>
        <ul className="eupathdb-Menu" style={{ position, top }}>
          {this.props.entries.map((entry) => (
            <MenuEntry
              key={entry.id}
              entry={entry}
              webAppUrl={this.props.webAppUrl}
              isGuest={this.props.isGuest}
              showLoginWarning={this.props.showLoginWarning}
            />
          ))}
        </ul>
      </div>
    );
  }
}

Menu.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  showLoginWarning: PropTypes.func.isRequired,
  entries: PropTypes.array.isRequired,
  isGuest: PropTypes.bool.isRequired
};

/**
 * Site menu entry.
 */
function MenuEntry(props) {
  let { entry, webAppUrl, showLoginWarning, isGuest } = props;
  let handleClick = (e) => {
    if (entry.loginRequired && isGuest) {
      e.preventDefault();
      showLoginWarning('use this feature', e.currentTarget.href);
    }
  }
  let className = 'eupathdb-MenuItemText';
  if (entry.beta) className += ' ' + className + '__beta';
  if (entry.new) className += ' ' + className + '__new';
  if (!isEmpty(entry.children)) className += ' ' + className + '__parent';

  return (
    <li className="eupathdb-MenuItem">

      { entry.url ? <a className={className} title={entry.tooltip} href={entry.url} target={entry.target}>{entry.text}</a>
      : entry.webAppUrl ? <a onClick={handleClick} className={className} title={entry.tooltip} href={webAppUrl + entry.webAppUrl}>{entry.text}</a>
      : entry.route ? <Link onClick={handleClick} className={className} title={entry.tooltip} to={entry.route}>{entry.text}</Link>
      : <div className={className} title={entry.tooltip}>{entry.text}</div> }

      { !isEmpty(entry.children) &&
        <ul className="eupathdb-Submenu">
          {entry.children.map(childEntry => {
            return <MenuEntry key={childEntry.id} entry={childEntry} webAppUrl={webAppUrl}/>
          })}
        </ul> }

    </li>
  );
}

MenuEntry.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  showLoginWarning: PropTypes.func.isRequired,
  entry: PropTypes.object.isRequired,
  isGuest: PropTypes.bool.isRequired
};
