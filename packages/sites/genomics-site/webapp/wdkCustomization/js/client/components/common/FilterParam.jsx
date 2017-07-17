import $ from 'jquery';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { mapValues } from 'lodash';
import { AttributeFilter } from 'wdk-client/Components';
import LazyFilterService from 'wdk-client/LazyFilterService';

export class FilterParam extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { isVocabLoading: true };
    this.handleServiceChange = () => {
      let serviceState = this.filterService.getState();
      this.setState(serviceState)
      this.props.onChange(serviceState);
    };
  }

  componentDidMount() {
    let { questionName, dependedValue } = this.props;
    let { webAppUrl } = this.context.store.getState().globalData.config;
    this.xhr = $.getJSON(webAppUrl + '/getVocab.do?' +
      'questionFullName=' + questionName +
      '&name=ngsSnp_strain_meta' +
      '&dependedValue=' + JSON.stringify(dependedValue) +
      '&json=true');

    this.xhr.then(filterData => {
      this.filterService = new LazyFilterService({
        name: 'ngsSnp_strain_meta',
        fields: mapValues(filterData.metadataSpec, (field, key) => Object.assign({
          term: key,
          display: key
        }, field)),
        data: filterData.values,
        questionName: 'GeneQuestions.GenesByNgsSnps',
        dependedValue,
        metadataUrl: webAppUrl + '/getMetadata.do'
      });
      this.handleServiceChange();
      this.setState({ isVocabLoading: false });
      this.subscription = this.filterService.addListener(this.handleServiceChange);
    });
  }

  componentWillUnmount() {
    this.xhr.abort();
    this.subscription && this.subscription.remove();
  }

  render() {
    let {
      isVocabLoading,
      fields,
      filters,
      data,
      filteredData,
      ignoredData,
      columns,
      selectedField,
      distributionMap,
      fieldMetadataMap,
      isLoading,
      invalidFilters
    } = this.state;

    return isVocabLoading ? <div>Loading...</div> : (
      <div className="filter-param">
        <AttributeFilter
          displayName={this.props.displayName}
          collapsible={false}
          fields={fields}
          filters={filters}
          dataCount={data.length}
          filteredData={filteredData}
          ignoredData={ignoredData}
          columns={columns}
          activeField={selectedField}
          activeFieldSummary={distributionMap[selectedField]}
          fieldMetadataMap={fieldMetadataMap}

          isLoading={isLoading}
          invalidFilters={invalidFilters}

          onActiveFieldChange={this.filterService.selectField}
          onFiltersChange={this.filterService.updateFilters}
          onColumnsChange={this.filterService.updateColumns}
          onIgnoredDataChange={this.filterService.updateIgnoredData}
        />
      </div>
    )
  }
}

FilterParam.contextTypes = {
  store: PropTypes.object.isRequired
};

FilterParam.propTypes = {
  displayName: PropTypes.string.isRequired,
  questionName: PropTypes.string.isRequired,
  dependedValue: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  onChange: PropTypes.func.isRequired
};
