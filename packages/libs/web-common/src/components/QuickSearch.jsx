import { find, get, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Mesa, Link } from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as persistence from 'ebrc-client/util/persistence';

let ParamPropType = PropTypes.shape({
  initialDisplayValue: PropTypes.string,
  help: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  alternate: PropTypes.string
});

let ReferencePropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  recordClassName: PropTypes.string.isRequired,
  paramName: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  alternate: PropTypes.string,
  linkTemplate: PropTypes.string,
  isDisabled: PropTypes.bool
});

let QuestionPropType = PropTypes.shape({
  name: PropTypes.string,
  parameters: PropTypes.arrayOf(ParamPropType)
});

/**
 * Quick search boxes that appear in header
 */
class _QuickSearchItem extends Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.state = { value: '' };
  }

  componentDidMount () {
    this.setStateFromProps(this.props);
  }

  componentWillUnmount () {

  }

  componentWillReceiveProps(props) {
    this.setStateFromProps(props);
  }

  getStorageKey(props) {
    return 'ebrc::quicksearch::' + props.reference.name;
  }

  getSearchParam(props) {
    return find(get(props, 'question.parameters'), ({ name }) => name === props.reference.paramName);
  }

  setStateFromProps(props) {
    let value = persistence.get(this.getStorageKey(props), get(this.getSearchParam(props), 'initialDisplayValue', ''));
    this.setState({ value });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  // Save value on submit
  handleSubmit(event) {
    const { linkTemplate } = this.props.reference;
    persistence.set(this.getStorageKey(this.props), this.state.value);
    if (linkTemplate != null) {
      event.preventDefault();
      this.props.history.push(linkTemplate.replace('{value}', this.state.value));
    }
  }

  render() {
    const { question, reference, webAppUrl } = this.props;
    const { displayName, recordClassName } = reference;
    const linkName = reference.alternate || reference.name;
    const searchParam = this.getSearchParam(this.props);

    // if searchParam is null, assume not loaded and render non-functioning
    // placeholder search box, otherwise render functioning search box
    return (
      <div className="quick-search-item" style={{ margin: '0 .4em' }} key={reference.name}>
        <form
          name="questionForm"
          method="post"
          action={webAppUrl + '/processQuestionSetsFlat.do'}
          onSubmit={this.handleSubmit}
        >
          <Mesa.AnchoredTooltip
            style={{ maxWidth: '275px', boxSizing: 'border-box' }}
            renderHtml={true}
            content={reference.help}>
            {question == null ? (
              <fieldset>
                <b key="name">
                  <Link to={`/search/${recordClassName}/${linkName}`}>{displayName}: </Link>
                </b>
                <input
                  type="text"
                  key="input"
                  className="search-box"
                  value={this.state.value}
                  onChange={this.handleChange}
                  ref={(el) => this.inputElement = el}
                  name=""
                  disabled
                />
                <input
                  name="go"
                  value="go"
                  type="image"
                  key="submit"
                  src={webAppUrl + '/images/mag_glass.png'}
                  alt="Click to search"
                  width="23"
                  height="23"
                  className="img_align_middle"
                  disabled
                />
              </fieldset>
            ) : (
              <fieldset>
                <input type="hidden" name="questionFullName" value={question.fullName}/>
                <input type="hidden" name="questionSubmit" value="Get Answer"/>
                {question.parameters.map(parameter => {
                  if (parameter === searchParam) return null;
                  let { initialDisplayValue = '', type, name } = parameter;
                  let typeTag = isStringParam(type) ? 'value' : 'array';
                  return (
                    <input key={`${typeTag}(${name})`} type="hidden" name={name} value={initialDisplayValue}/>
                  );
                })}
                <b><a href={webAppUrl + '/showQuestion.do?questionFullName=' + linkName}>{displayName}: </a></b>
                <input
                  type="text"
                  className="search-box"
                  value={this.state.value}
                  onChange={this.handleChange}
                  name={'value(' + searchParam.name + ')'}
                  ref={(el) => this.inputElement = el}
                />
                <input
                  name="go"
                  value="go"
                  type="image"
                  src={webAppUrl + '/images/mag_glass.png'}
                  alt="Click to search"
                  width="23"
                  height="23"
                  className="img_align_middle"
                />
              </fieldset>
            )}
          </Mesa.AnchoredTooltip>
        </form>
      </div>
    );
  }
}

_QuickSearchItem.propTypes = {
  history: PropTypes.object.isRequired,
  webAppUrl: PropTypes.string.isRequired,
  question: QuestionPropType,
  reference: ReferencePropType.isRequired,
};

const QuickSearchItem = withRouter(_QuickSearchItem);

function QuickSearch (props) {
  let { references, questions = {}, webAppUrl } = props;

  return (
    <div id="quick-search" style={{display: 'flex', marginBottom: '12px', marginTop: '16px', height: '26px'}}>
      {questions instanceof Error ? (
        <div style={{ color: 'darkred', marginLeft: 'auto' }}>Error: search temporarily unavailable</div>
      ) : map(references, reference => (
        <QuickSearchItem
          key={reference.name}
          question={questions[reference.name]}
          reference={reference}
          webAppUrl={webAppUrl}
        />
      ))}
    </div>
  )
}

QuickSearch.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  references: PropTypes.arrayOf(ReferencePropType),
  questions: PropTypes.oneOfType([
    PropTypes.objectOf(QuestionPropType),
    PropTypes.instanceOf(Error)
  ]),
};

export default wrappable(QuickSearch);

/**
 * @param {Parameter} parameter
 * @return {boolean}
 */
function isStringParam(parameter) {
  return [ 'StringParam', 'TimestampParam' ].includes(parameter.type);
}
