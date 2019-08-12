import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import {
    ParameterValue,
    ParameterValues,
    Question,
    QuestionWithParameters,
    TreeBoxVocabNode,
    Parameter,
    ParameterGroup,
    AttributeField,
    Reporter,
    SummaryViewPluginField,
  } from 'wdk-client/Utils/WdkModel';
import { OntologyTermSummary } from 'wdk-client/Components/AttributeFilter/Types';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import * as Decode from 'wdk-client/Utils/Json';

const reporterDecoder: Decode.Decoder<Reporter> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('type', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('description', Decode.string),
    Decode.field('isInReport', Decode.boolean),
    // TODO Replace with list of known scopes
    Decode.field('scopes', Decode.arrayOf(Decode.string)),
  )

const attributeFieldDecoder: Decode.Decoder<AttributeField> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('formats', Decode.arrayOf(reporterDecoder)),
    Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))),
    Decode.field('help', Decode.optional(Decode.string)),
    Decode.field('align', Decode.optional(Decode.string)),
    Decode.field('type', Decode.optional(Decode.string)),
    Decode.field('truncateTo', Decode.number),
    Decode.combine(
      Decode.field('isSortable', Decode.boolean),
      Decode.field('isRemovable', Decode.boolean),
      Decode.field('isDisplayable', Decode.boolean),
    )
  )

const summaryViewPluginFieldDecoder: Decode.Decoder<SummaryViewPluginField> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('description', Decode.string)
  );

const questionFilterDecoder =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.optional(Decode.string)),
    Decode.field('description', Decode.optional(Decode.string)),
    Decode.field('isViewOnly', Decode.boolean),
  )

const treeBoxVocabDecoder: Decode.Decoder<TreeBoxVocabNode> =
  Decode.combine(
    Decode.field('data', Decode.combine(
      Decode.field('term', Decode.string),
      Decode.field('display', Decode.string)
    )),
    Decode.field('children', Decode.lazy(() => Decode.arrayOf(treeBoxVocabDecoder)))
  )

const parameterDecoder: Decode.Decoder<Parameter> =
  Decode.combine(
    /* Common properties */
    Decode.combine(
      Decode.field('name', Decode.string),
      Decode.field('displayName', Decode.string),
      Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))),
      Decode.field('help', Decode.string),
      Decode.field('isVisible', Decode.boolean),
      Decode.field('group', Decode.string),
      Decode.field('isReadOnly', Decode.boolean),
      Decode.field('initialDisplayValue', Decode.optional(Decode.string)),
      Decode.field('dependentParams', Decode.arrayOf(Decode.string))
    ),
    Decode.oneOf(
      /* DatasetParam */
      Decode.combine(
        Decode.field('type', Decode.constant('input-dataset')),
        Decode.field('defaultIdList', Decode.optional(Decode.string)),
        Decode.field('parsers', Decode.arrayOf(
          Decode.combine(
            Decode.field('name', Decode.string),
            Decode.field('displayName', Decode.string),
            Decode.field('description', Decode.string),
          )
        ))
      ),
      /* TimestampParam */
      Decode.field('type', Decode.constant('timestamp')),
      /* StringParam  */
      Decode.combine(
        Decode.field('type', Decode.constant('string')),
        Decode.field('length', Decode.number)
      ),
      /* FilterParamNew */
      Decode.combine(
        Decode.field('type', Decode.constant('filter')),
        Decode.field('filterDataTypeDisplayName', Decode.optional(Decode.string)),
        Decode.field('minSelectedCount', Decode.number),
        Decode.field('hideEmptyOntologyNodes', Decode.optional(Decode.boolean)),
        Decode.field('values', Decode.objectOf(Decode.arrayOf(Decode.string))),
        Decode.field('ontology', Decode.arrayOf(
          Decode.combine(
            Decode.field('term', Decode.string),
            Decode.field('parent', Decode.optional(Decode.string)),
            Decode.field('display', Decode.string),
            Decode.field('description', Decode.optional(Decode.string)),
            Decode.field('type', Decode.optional(Decode.oneOf(
              Decode.constant('date'), Decode.constant('string'), Decode.constant('number'), Decode.constant('multiFilter')
            ))),
            // Decode.field('units', Decode.string),
            Decode.field('precision', Decode.number),
            Decode.field('isRange', Decode.boolean),
          )
        ))
      ),
      /* EnumParam */
      Decode.combine(
        Decode.field('type', Decode.constant('vocabulary')),
        Decode.field('countOnlyLeaves', Decode.boolean),
        Decode.field('maxSelectedCount', Decode.number),
        Decode.field('minSelectedCount', Decode.number),
        Decode.field('multiPick', Decode.boolean),
        Decode.field('depthExpanded', Decode.number),
        Decode.oneOf(
          /* Checkbox */
          Decode.combine(
            Decode.field('displayType', Decode.constant('checkBox')),
            Decode.field('vocabulary', Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue)))
          ),
          /* Select */
          Decode.combine(
            Decode.field('displayType', Decode.constant('select')),
            Decode.field('vocabulary', Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue)))
          ),
          /* TypeAhead */
          Decode.combine(
            Decode.field('displayType', Decode.constant('typeAhead')),
            Decode.field('vocabulary', Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue)))
          ),
          /* Treebox */
          Decode.combine(
            Decode.field('displayType', Decode.constant('treeBox')),
            Decode.field('vocabulary', treeBoxVocabDecoder)
          ),
        )
      ),
      /* NumberParam */
      Decode.combine(
        Decode.field('type', Decode.constant('number')),
        Decode.field('min', Decode.number),
        Decode.field('max', Decode.number),
        Decode.field('increment', Decode.number),
      ),
      /* NumberRangeParam */
      Decode.combine(
        Decode.field('type', Decode.constant('number-range')),
        Decode.field('min', Decode.number),
        Decode.field('max', Decode.number),
        Decode.field('increment', Decode.number),
      ),
      /* DateParam */
      Decode.combine(
        Decode.field('type', Decode.constant('date')),
        Decode.field('minDate', Decode.string),
        Decode.field('maxDate', Decode.string),
      ),
      /* DateRangeParam */
      Decode.combine(
        Decode.field('type', Decode.constant('date-range')),
        Decode.field('minDate', Decode.string),
        Decode.field('maxDate', Decode.string),
      ),
      /* AnswerParam */
      Decode.field('type', Decode.constant('input-step'))
    )
  )

export const parametersDecoder: Decode.Decoder<Parameter[]> =
  Decode.arrayOf(parameterDecoder)

export const paramGroupDecoder: Decode.Decoder<ParameterGroup> =
  Decode.combine(
    Decode.field('description', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('displayType', Decode.string),
    Decode.field('isVisible', Decode.boolean),
    Decode.field('name', Decode.string),
    Decode.field('parameters', Decode.arrayOf(Decode.string))
  )

const questionSharedDecoder =
  Decode.combine(
    Decode.combine(
      Decode.field('fullName', Decode.string),
      Decode.field('displayName', Decode.string),
      Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))),
      Decode.field('summary', Decode.optional(Decode.string)),
      Decode.field('description', Decode.optional(Decode.string)),
      Decode.field('shortDisplayName', Decode.string),
      Decode.field('outputRecordClassName', Decode.string),
      Decode.field('help', Decode.optional(Decode.string)),
      Decode.field('newBuild', Decode.optional(Decode.string)),
      Decode.field('reviseBuild', Decode.optional(Decode.string)),
    ),
    Decode.combine(
      Decode.field('urlSegment', Decode.string),
      Decode.field('groups', Decode.arrayOf(paramGroupDecoder)),
      Decode.field('defaultAttributes', Decode.arrayOf(Decode.string)),
      Decode.field('paramNames', Decode.arrayOf(Decode.string))
    ),
    Decode.field('defaultSorting', Decode.arrayOf(
      Decode.combine(
        Decode.field('attributeName', Decode.string),
        Decode.field('direction', Decode.oneOf(Decode.constant('ASC'), Decode.constant('DESC')))
      )
    )),
    Decode.field('dynamicAttributes', Decode.arrayOf(attributeFieldDecoder)),
    Decode.combine(
      Decode.field('defaultSummaryView', Decode.string),
      Decode.field('summaryViewPlugins', Decode.arrayOf(summaryViewPluginFieldDecoder))
    ),
    Decode.field('filters', Decode.arrayOf(questionFilterDecoder)),
    Decode.field(
      'allowedPrimaryInputRecordClassNames',
      Decode.optional(Decode.arrayOf(Decode.string))
    ),
    Decode.field(
      'allowedSecondaryInputRecordClassNames',
      Decode.optional(Decode.arrayOf(Decode.string))
    ),
  )

export type QuestionWithValidatedParameters = {
  searchData: QuestionWithParameters;
  validation: any; // FIXME: use actual type here
}

const questionWithParametersDecoder: Decode.Decoder<QuestionWithValidatedParameters> =
  Decode.combine(
    Decode.field('searchData', Decode.combine(
      questionSharedDecoder,
      Decode.field('parameters', parametersDecoder)
    )),
    Decode.field('validation', Decode.ok)
  )

const questionDecoder: Decode.Decoder<Question> =
  Decode.combine(
    questionSharedDecoder,
    Decode.field('parameters', Decode.arrayOf(Decode.string))
  )

const questionsDecoder: Decode.Decoder<Question[]> =
  Decode.arrayOf(questionDecoder)

export default (base: ServiceBase) => {

  /**
   * Get all Questions defined in WDK Model.
   *
   * @return {Promise<Array<Object>>}
   */
  function getQuestions() : Promise<Array<Question>> {
    return base.getRecordClasses().then(result => {
      return result.reduce((arr, rc) => arr.concat(rc.searches), [] as Array<Question>);
    });
  }

  /**
   * Get the first Question that matches `test`.
   *
   * @param {Function} test Predicate function the Question must satisfy
   * @return {Promise<Object?>}
   */
  function findQuestion(test: (question: Question) => boolean) {
    return base.getQuestions().then(qs => {
      let question = qs.find(test)
      if (question == null) {
        throw new ServiceError("Could not find question.", "Not found", 404);
      }
      return question;
    });
  }

  async function getQuestionAndParameters(questionUrlSegment: string): Promise<QuestionWithParameters> {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base.sendRequest(questionWithParametersDecoder, {
      method: 'get',
      path: searchPath,
      params: {
        expandParams: 'true',
      },
      useCache: true
    }).then(response => response.searchData);
  }

  /**
   * Fetch question information (e.g. vocabularies) given the passed param values; never cached
   */
  async function getQuestionGivenParameters(questionUrlSegment: string, paramValues: ParameterValues): Promise<QuestionWithParameters> {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base.sendRequest(questionWithParametersDecoder, {
      method: 'post',
      path: searchPath,
      body: JSON.stringify({ contextParamValues: paramValues })
    }).then(response => response.searchData);
  }

  async function getQuestionParamValues(questionUrlSegment: string, paramName: string, paramValue: ParameterValue, paramValues: ParameterValues) {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base.sendRequest(parametersDecoder, {
      method: 'post',
      path: `${searchPath}/refreshed-dependent-params`,
      body: JSON.stringify({
        changedParam: { name: paramName, value: paramValue },
        contextParamValues: paramValues
      })
    })
  }

  async function getSearchPathFromUrlSegment(questionUrlSegment: string) : Promise<string> {
    const question = await base.findQuestion(question => question.urlSegment === questionUrlSegment );
    const recordClass = await base.findRecordClass(recordClass => recordClass.urlSegment === question.outputRecordClassName);
    return base.getSearchPath(recordClass.urlSegment, questionUrlSegment);
  }

  async function getOntologyTermSummary(questionUrlSegment: string, paramName: string, filters: any, ontologyId: string, paramValues: ParameterValues) {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base._fetchJson<OntologyTermSummary>(
      'post',
      `${searchPath}/${paramName}/ontology-term-summary`,
      JSON.stringify({
        ontologyId,
        filters,
        contextParamValues: paramValues
      })
    );
  }

  async function getFilterParamSummaryCounts(questionUrlSegment: string, paramName: string, filters: any, paramValues: ParameterValues) {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base._fetchJson<{filtered: number, unfiltered: number, nativeFiltered: number, nativeUnfiltered: number}>(
      'post',
      `${searchPath}/${paramName}/summary-counts`,
      JSON.stringify({
        filters,
        contextParamValues: paramValues
      })
    );
  }

  return {
    getQuestions,
    findQuestion,
    getQuestionAndParameters,
    getQuestionGivenParameters,
    getQuestionParamValues,
    getOntologyTermSummary,
    getFilterParamSummaryCounts
  }

}
