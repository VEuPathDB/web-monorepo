// import HelpIcon from 'wdk-client/Components/Icon/HelpIcon';
import { debounce } from 'lodash';
import React, { Component } from 'react';
// use safeHtml for enabling html (e.g., italic) at helpText
import { safeHtml } from '../SelectTree/Utils';

type Props = {

  /** Set the autofocus property of the underlying HTMLTextInputElement */
  autoFocus?: boolean;

  /** Initial search text; defaults to ''.  After mounting, search text is maintained by the component */
  searchTerm?: string;

  /** Called when user alters text in the search box  */
  onSearchTermChange?: (searchTerm: string) => void;

  /** The placeholder string if no search text is present; defaults to ''. */
  placeholderText?: string;

  /** Icon name to show in input box. Defaults to "search". */
  iconName?: string;

  /** Text to appear as tooltip of help icon, should describe how the search is performed. Defaults to empty (no icon) */
  helpText?: string;

  /** Delay in milliseconds after last character typed until onSearchTermChange is called.  Defaults to 250. */
  delayMs?: number;

}

type State = {

  /** local reference to search term for rendering */
  searchTerm: string;
}

/**
 * A 'real time' search box.  Changes are throttled by 'debounce' so text
 * change events are delayed to prevent repetitive costly searching.  Useful
 * when expensive operations are performed (e.g. search) in real time as the
 * user types in the box.  Also provides reset button to clear the box.
 */
export default class RealTimeSearchBox extends Component<Props, State> {


  static defaultProps = {
    autoFocus: false,
    searchTerm: '',
    onSearchTermChange: () => {},
    placeholderText: '',
    helpText: '',
    delayMs: 250,
    iconName: 'search'
  };

  emitSearchTermChange = debounce((searchTerm: string) => this.props.onSearchTermChange!(searchTerm));

  input: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.state = { searchTerm: this.props.searchTerm! };
  }

  componentDidMount() {
    if (this.props.autoFocus && this.input != null) this.input.autofocus = true;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.searchTerm !== this.state.searchTerm) {
      this.setState({ searchTerm: nextProps.searchTerm! },
        () => this.emitSearchTermChange(nextProps.searchTerm!));
    }
  }

  componentWillUnmount() {
    this.emitSearchTermChange.cancel();
  }

  /**
   * Update the state of this Component, and call debounced onSearchTermSet
   * callback.
   */
  handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    let searchTerm = e.currentTarget.value;
    this.setState({ searchTerm });
    this.emitSearchTermChange(searchTerm);
  }

  /**
   * Reset input if Escape is pressed.
   */
  handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      this.setState({ searchTerm: '' });
      this.props.onSearchTermChange!('');
      e.stopPropagation();
    }
  }

  /**
   * Update the state of this Component, and call onSearchTermSet callback
   * immediately.
   */
  handleResetClick() {
    this.setState({ searchTerm: '' });
    this.props.onSearchTermChange!('');
  }

  render() {
    let { helpText, placeholderText, autoFocus, iconName } = this.props;
    let searchTerm = this.state.searchTerm;
    let isActiveSearch = searchTerm.length > 0;
    let activeModifier = isActiveSearch ? 'active' : 'inactive';
    let helpModifier = helpText ? 'withHelp' : '';
    return (
      <div>
        <label>
          <input type="search"
            autoFocus={autoFocus}
            ref={node => this.input = node}
            onChange={this.handleSearchTermChange}
            onKeyDown={this.handleKeyDown}
            placeholder={placeholderText}
            value={searchTerm}
          />
          {/* <i className={`fa fa-${iconName} ${searchIconClassName}`}/> */}
          <button
            type="button" onClick={this.handleResetClick}>
            {/* <i className={"fa fa-close " + cancelIconClassName}/> */}
          </button>
        </label>
        {/* use safeHtml for helpText to allow italic */}
        {/* {!helpText ? null : <HelpIcon>{safeHtml(helpText)}</HelpIcon>} */}
      </div>
    );
  }
}
