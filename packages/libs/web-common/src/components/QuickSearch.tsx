import { find, get, map } from 'lodash';
import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Mesa, Link } from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as persistence from '../util/persistence';

interface Param {
  initialDisplayValue?: string;
  help: string;
  name: string;
  alternate?: string;
  type?: string;
}

interface Reference {
  name: string;
  recordClassName: string;
  paramName: string;
  displayName: string;
  alternate?: string;
  linkTemplate?: string;
  isDisabled?: boolean;
  help: string;
}

interface Question {
  name?: string;
  fullName?: string;
  parameters?: Param[];
}

interface QuickSearchItemState {
  value: string;
}

/**
 * Quick search boxes that appear in header
 */
class _QuickSearchItem extends Component<
  RouteComponentProps & {
    webAppUrl: string;
    question?: Question;
    reference: Reference;
  },
  QuickSearchItemState
> {
  inputElement?: HTMLInputElement | null;

  constructor(
    props: RouteComponentProps & {
      webAppUrl: string;
      question?: Question;
      reference: Reference;
    }
  ) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.state = { value: '' };
  }

  componentDidMount() {
    this.setStateFromProps(this.props);
  }

  componentWillUnmount() {}

  componentWillReceiveProps(
    props: RouteComponentProps & {
      webAppUrl: string;
      question?: Question;
      reference: Reference;
    }
  ) {
    this.setStateFromProps(props);
  }

  getStorageKey(
    props: RouteComponentProps & {
      webAppUrl: string;
      question?: Question;
      reference: Reference;
    }
  ) {
    return 'ebrc::quicksearch::' + props.reference.name;
  }

  getSearchParam(
    props: RouteComponentProps & {
      webAppUrl: string;
      question?: Question;
      reference: Reference;
    }
  ) {
    return find(
      get(props, 'question.parameters'),
      ({ name }) => name === props.reference.paramName
    );
  }

  setStateFromProps(
    props: RouteComponentProps & {
      webAppUrl: string;
      question?: Question;
      reference: Reference;
    }
  ) {
    let value = persistence.get(
      this.getStorageKey(props),
      get(this.getSearchParam(props), 'initialDisplayValue', '')
    );
    this.setState({ value });
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ value: event.target.value });
  }

  // Save value on submit
  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const { linkTemplate } = this.props.reference;
    persistence.set(this.getStorageKey(this.props), this.state.value);
    if (linkTemplate != null) {
      event.preventDefault();
      this.props.history.push(
        linkTemplate.replace('{value}', this.state.value)
      );
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
      <div
        className="quick-search-item"
        style={{ margin: '0 .4em' }}
        key={reference.name}
      >
        <form
          name="questionForm"
          method="post"
          action={webAppUrl + '/processQuestionSetsFlat.do'}
          onSubmit={this.handleSubmit}
        >
          <Mesa.AnchoredTooltip
            style={{ maxWidth: '275px', boxSizing: 'border-box' }}
            renderHtml={true}
            content={reference.help}
          >
            {question == null ? (
              <fieldset>
                <b key="name">
                  <Link to={`/search/${recordClassName}/${linkName}`}>
                    {displayName}:{' '}
                  </Link>
                </b>
                <input
                  type="text"
                  key="input"
                  className="search-box"
                  value={this.state.value}
                  onChange={this.handleChange}
                  ref={(el) => (this.inputElement = el)}
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
                <input
                  type="hidden"
                  name="questionFullName"
                  value={question.fullName}
                />
                <input type="hidden" name="questionSubmit" value="Get Answer" />
                {question.parameters!.map((parameter) => {
                  if (parameter === searchParam) return null;
                  let { initialDisplayValue = '', type, name } = parameter;
                  let typeTag = isStringParam(type) ? 'value' : 'array';
                  return (
                    <input
                      key={`${typeTag}(${name})`}
                      type="hidden"
                      name={name}
                      value={initialDisplayValue}
                    />
                  );
                })}
                <b>
                  <a
                    href={
                      webAppUrl +
                      '/showQuestion.do?questionFullName=' +
                      linkName
                    }
                  >
                    {displayName}:{' '}
                  </a>
                </b>
                <input
                  type="text"
                  className="search-box"
                  value={this.state.value}
                  onChange={this.handleChange}
                  name={'value(' + searchParam!.name + ')'}
                  ref={(el) => (this.inputElement = el)}
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

const QuickSearchItem = withRouter(_QuickSearchItem);

interface QuickSearchProps {
  webAppUrl: string;
  references?: Reference[];
  questions?: Record<string, Question> | Error;
}

function QuickSearch(props: QuickSearchProps) {
  let { references, questions = {}, webAppUrl } = props;

  return (
    <div
      id="quick-search"
      style={{
        display: 'flex',
        marginBottom: '12px',
        marginTop: '16px',
        height: '26px',
      }}
    >
      {questions instanceof Error ? (
        <div style={{ color: 'darkred', marginLeft: 'auto' }}>
          Error: search temporarily unavailable
        </div>
      ) : (
        map(references, (reference) => (
          <QuickSearchItem
            key={reference.name}
            question={questions[reference.name]}
            reference={reference}
            webAppUrl={webAppUrl}
          />
        ))
      )}
    </div>
  );
}

export default wrappable(QuickSearch);

/**
 * @param {Parameter} parameter
 * @return {boolean}
 */
function isStringParam(parameter?: string) {
  return (
    parameter != null && ['StringParam', 'TimestampParam'].includes(parameter)
  );
}
