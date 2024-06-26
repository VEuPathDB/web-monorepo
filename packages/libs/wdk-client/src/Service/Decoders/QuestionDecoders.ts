import {
  Question,
  QuestionWithParameters,
  TreeBoxVocabNode,
  Parameter,
  ParameterGroup,
  SummaryViewPluginField,
  DatasetParam,
  TimestampParam,
  StringParam,
  FilterParamNew,
  NumberParam,
  NumberRangeParam,
  DateParam,
  DateRangeParam,
  AnswerParam,
  EnumParam,
  CheckBoxEnumParam,
  SinglePickCheckBoxEnumParam,
  MultiPickCheckBoxEnumParam,
  SinglePickSelectEnumParam,
  MultiPickSelectEnumParam,
  SelectEnumParam,
  SinglePickTypeAheadEnumParam,
  MultiPickTypeAheadEnumParam,
  TypeAheadEnumParam,
  SinglePickTreeBoxEnumParam,
  MultiPickTreeBoxEnumParam,
  TreeBoxEnumParam,
} from '../../Utils/WdkModel';
import * as Decode from '../../Utils/Json';
import { attributeFieldDecoder } from '../Decoders/RecordClassDecoders';

const summaryViewPluginFieldDecoder: Decode.Decoder<SummaryViewPluginField> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('description', Decode.string)
  );

const questionFilterDecoder = Decode.combine(
  Decode.field('name', Decode.string),
  Decode.field('displayName', Decode.optional(Decode.string)),
  Decode.field('description', Decode.optional(Decode.string)),
  Decode.field('isViewOnly', Decode.boolean)
);

const paramSharedDecoder =
  /* Common properties */
  Decode.combine(
    Decode.combine(
      Decode.field('name', Decode.string),
      Decode.field('displayName', Decode.string),
      Decode.field(
        'properties',
        Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))
      ),
      Decode.field('help', Decode.string),
      Decode.field('isVisible', Decode.boolean),
      Decode.field('group', Decode.string),
      Decode.field('isReadOnly', Decode.boolean),
      Decode.field('initialDisplayValue', Decode.optional(Decode.string)),
      Decode.field('dependentParams', Decode.arrayOf(Decode.string))
    ),
    Decode.combine(
      Decode.field('allowEmptyValue', Decode.boolean),
      Decode.field('visibleHelp', Decode.optional(Decode.string)),
      Decode.field('visibleHelpPosition', Decode.optional(Decode.string))
    )
  );

/* DatasetParam */
const datasetParamDecoder: Decode.Decoder<DatasetParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('input-dataset')),
  Decode.field('defaultIdList', Decode.optional(Decode.string)),
  Decode.field(
    'parsers',
    Decode.arrayOf(
      Decode.combine(
        Decode.field('name', Decode.string),
        Decode.field('displayName', Decode.string),
        Decode.field('description', Decode.string)
      )
    )
  )
);

/* TimestampParam */
const timestampParamDecoder: Decode.Decoder<TimestampParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('timestamp'))
);

/* StringParam  */
const stringParamDecoder: Decode.Decoder<StringParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('string')),
  Decode.field('length', Decode.number),
  Decode.field('isMultiLine', Decode.boolean),
  Decode.field('isNumber', Decode.boolean)
);

/* FilterParamNew */
const filterParamDecoder: Decode.Decoder<FilterParamNew> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('filter')),
  Decode.field('filterDataTypeDisplayName', Decode.optional(Decode.string)),
  Decode.field('minSelectedCount', Decode.number),
  Decode.field('hideEmptyOntologyNodes', Decode.optional(Decode.boolean)),
  Decode.field('values', Decode.objectOf(Decode.arrayOf(Decode.string))),
  Decode.field(
    'ontology',
    Decode.arrayOf(
      Decode.combine(
        Decode.field('term', Decode.string),
        Decode.field('parent', Decode.optional(Decode.string)),
        Decode.field('display', Decode.string),
        Decode.field('description', Decode.optional(Decode.string)),
        Decode.field(
          'type',
          Decode.optional(
            Decode.oneOf(
              Decode.constant('date'),
              Decode.constant('string'),
              Decode.constant('number'),
              Decode.constant('multiFilter')
            )
          )
        ),
        // Decode.field('units', Decode.string),
        Decode.field('precision', Decode.number),
        Decode.field('isRange', Decode.boolean)
      )
    )
  )
);

/* NumberParam */
const numberParamDecoder: Decode.Decoder<NumberParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('number')),
  Decode.field('min', Decode.number),
  Decode.field('max', Decode.number),
  Decode.field('increment', Decode.number)
);

/* NumberRangeParam */
const numberRangeParamDecoder: Decode.Decoder<NumberRangeParam> =
  Decode.combine(
    paramSharedDecoder,
    Decode.field('type', Decode.constant('number-range')),
    Decode.field('min', Decode.number),
    Decode.field('max', Decode.number),
    Decode.field('increment', Decode.number)
  );

/* DateParam */
const dateParamDecoder: Decode.Decoder<DateParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('date')),
  Decode.field('minDate', Decode.string),
  Decode.field('maxDate', Decode.string)
);

/* DateRangeParam */
const dateRangeParamDecoder: Decode.Decoder<DateRangeParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('date-range')),
  Decode.field('minDate', Decode.string),
  Decode.field('maxDate', Decode.string)
);

/* AnswerParam */
const answerParamDecoder: Decode.Decoder<AnswerParam> = Decode.combine(
  paramSharedDecoder,
  Decode.field('type', Decode.constant('input-step'))
);

/* Base decoders for enum types */
const enumParamSharedDecoder = Decode.combine(
  paramSharedDecoder,
  Decode.field('maxSelectedCount', Decode.number),
  Decode.field('minSelectedCount', Decode.number)
);

const singlePickEnumParamDecoder = Decode.field(
  'type',
  Decode.constant('single-pick-vocabulary')
);
const multiPickEnumParamDecoder = Decode.field(
  'type',
  Decode.constant('multi-pick-vocabulary')
);

const standardVocabularyEnumParamDecoder = Decode.combine(
  enumParamSharedDecoder,
  Decode.field(
    'vocabulary',
    Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue))
  )
);

/* CheckBoxEnumParam */
const checkBoxEnumParamBaseDecoder = Decode.combine(
  standardVocabularyEnumParamDecoder,
  Decode.field('displayType', Decode.constant('checkBox'))
);
export const singlePickCheckBoxEnumParamDecoder: Decode.Decoder<SinglePickCheckBoxEnumParam> =
  Decode.combine(checkBoxEnumParamBaseDecoder, singlePickEnumParamDecoder);
export const multiPickCheckBoxEnumParamDecoder: Decode.Decoder<MultiPickCheckBoxEnumParam> =
  Decode.combine(checkBoxEnumParamBaseDecoder, multiPickEnumParamDecoder);
export const checkBoxEnumParamDecoder: Decode.Decoder<CheckBoxEnumParam> =
  Decode.oneOf(
    singlePickCheckBoxEnumParamDecoder,
    multiPickCheckBoxEnumParamDecoder
  );

/* SelectEnumParam */
const selectEnumParamBaseDecoder = Decode.combine(
  standardVocabularyEnumParamDecoder,
  Decode.field('displayType', Decode.constant('select'))
);
export const singlePickSelectEnumParamDecoder: Decode.Decoder<SinglePickSelectEnumParam> =
  Decode.combine(selectEnumParamBaseDecoder, singlePickEnumParamDecoder);
export const multiPickSelectEnumParamDecoder: Decode.Decoder<MultiPickSelectEnumParam> =
  Decode.combine(selectEnumParamBaseDecoder, multiPickEnumParamDecoder);
export const selectEnumParamDecoder: Decode.Decoder<SelectEnumParam> =
  Decode.oneOf(
    singlePickSelectEnumParamDecoder,
    multiPickSelectEnumParamDecoder
  );

/* TypeAheadEnumParam */
const typeAheadEnumParamBaseDecoder = Decode.combine(
  standardVocabularyEnumParamDecoder,
  Decode.field('displayType', Decode.constant('typeAhead'))
);
export const singlePickTypeAheadEnumParamDecoder: Decode.Decoder<SinglePickTypeAheadEnumParam> =
  Decode.combine(typeAheadEnumParamBaseDecoder, singlePickEnumParamDecoder);
export const multiPickTypeAheadEnumParamDecoder: Decode.Decoder<MultiPickTypeAheadEnumParam> =
  Decode.combine(typeAheadEnumParamBaseDecoder, multiPickEnumParamDecoder);
export const typeAheadEnumParamDecoder: Decode.Decoder<TypeAheadEnumParam> =
  Decode.oneOf(
    singlePickTypeAheadEnumParamDecoder,
    multiPickTypeAheadEnumParamDecoder
  );

/* TreeboxEnumParam */
const treeBoxVocabDecoder: Decode.Decoder<TreeBoxVocabNode> = Decode.combine(
  Decode.field(
    'data',
    Decode.combine(
      Decode.field('term', Decode.string),
      Decode.field('display', Decode.string)
    )
  ),
  Decode.field(
    'children',
    Decode.lazy(() => Decode.arrayOf(treeBoxVocabDecoder))
  )
);
const treeBoxEnumParamBaseDecoder = Decode.combine(
  enumParamSharedDecoder,
  Decode.field('displayType', Decode.constant('treeBox')),
  Decode.field('countOnlyLeaves', Decode.boolean),
  Decode.field('depthExpanded', Decode.number),
  Decode.field('vocabulary', treeBoxVocabDecoder)
);
export const singlePickTreeBoxEnumParamDecoder: Decode.Decoder<SinglePickTreeBoxEnumParam> =
  Decode.combine(treeBoxEnumParamBaseDecoder, singlePickEnumParamDecoder);
export const multiPickTreeBoxEnumParamDecoder: Decode.Decoder<MultiPickTreeBoxEnumParam> =
  Decode.combine(treeBoxEnumParamBaseDecoder, multiPickEnumParamDecoder);
export const treeBoxEnumParamDecoder: Decode.Decoder<TreeBoxEnumParam> =
  Decode.oneOf(
    singlePickTreeBoxEnumParamDecoder,
    multiPickTreeBoxEnumParamDecoder
  );

/* EnumParam */
const enumParamDecoder: Decode.Decoder<EnumParam> = Decode.oneOf(
  checkBoxEnumParamDecoder,
  selectEnumParamDecoder,
  typeAheadEnumParamDecoder,
  treeBoxEnumParamDecoder
);

const parameterDecoder: Decode.Decoder<Parameter> = Decode.oneOf(
  datasetParamDecoder,
  timestampParamDecoder,
  stringParamDecoder,
  filterParamDecoder,
  enumParamDecoder,
  numberParamDecoder,
  numberRangeParamDecoder,
  dateParamDecoder,
  dateRangeParamDecoder,
  answerParamDecoder
);

export const parametersDecoder: Decode.Decoder<Parameter[]> =
  Decode.arrayOf(parameterDecoder);

export const paramGroupDecoder: Decode.Decoder<ParameterGroup> = Decode.combine(
  Decode.field('description', Decode.string),
  Decode.field('displayName', Decode.string),
  Decode.field('displayType', Decode.string),
  Decode.field('isVisible', Decode.boolean),
  Decode.field('name', Decode.string),
  Decode.field('parameters', Decode.arrayOf(Decode.string))
);

const questionSharedDecoder = Decode.combine(
  Decode.combine(
    Decode.field('fullName', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field(
      'properties',
      Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))
    ),
    Decode.field('summary', Decode.optional(Decode.string)),
    Decode.field('description', Decode.optional(Decode.string)),
    Decode.field('shortDisplayName', Decode.string),
    Decode.field('outputRecordClassName', Decode.string),
    Decode.field('help', Decode.optional(Decode.string)),
    Decode.field('newBuild', Decode.optional(Decode.string)),
    Decode.field('reviseBuild', Decode.optional(Decode.string))
  ),
  Decode.combine(
    Decode.field('searchVisibleHelp', Decode.optional(Decode.string)),
    Decode.field('urlSegment', Decode.string),
    Decode.field('groups', Decode.arrayOf(paramGroupDecoder)),
    Decode.field('defaultAttributes', Decode.arrayOf(Decode.string)),
    Decode.field('paramNames', Decode.arrayOf(Decode.string))
  ),
  Decode.field(
    'defaultSorting',
    Decode.arrayOf(
      Decode.combine(
        Decode.field('attributeName', Decode.string),
        Decode.field(
          'direction',
          Decode.oneOf(Decode.constant('ASC'), Decode.constant('DESC'))
        )
      )
    )
  ),
  Decode.field('dynamicAttributes', Decode.arrayOf(attributeFieldDecoder)),
  Decode.combine(
    Decode.field('defaultSummaryView', Decode.string),
    Decode.field('noSummaryOnSingleRecord', Decode.boolean),
    Decode.field(
      'summaryViewPlugins',
      Decode.arrayOf(summaryViewPluginFieldDecoder)
    )
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
  Decode.field('isAnalyzable', Decode.boolean),
  Decode.field('isCacheable', Decode.boolean)
);

export type QuestionWithValidatedParameters = {
  searchData: QuestionWithParameters;
  validation: any; // FIXME: use actual type here
};

export const questionWithParametersDecoder: Decode.Decoder<QuestionWithValidatedParameters> =
  Decode.combine(
    Decode.field(
      'searchData',
      Decode.combine(
        questionSharedDecoder,
        Decode.field('parameters', parametersDecoder)
      )
    ),
    Decode.field('validation', Decode.ok)
  );

const questionDecoder: Decode.Decoder<Question> = Decode.combine(
  questionSharedDecoder,
  Decode.field('parameters', Decode.arrayOf(Decode.string))
);

const questionsDecoder: Decode.Decoder<Question[]> =
  Decode.arrayOf(questionDecoder);
