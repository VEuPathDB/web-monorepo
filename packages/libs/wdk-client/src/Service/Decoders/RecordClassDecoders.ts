import * as Decode from '../../Utils/Json';
import {
  AttributeField,
  RecordClass,
  Reporter,
  TableField,
  Question,
  ParameterGroup,
  SummaryViewPluginField,
  QuestionFilter,
  AttributeSortingSpec,
} from '../../Utils/WdkModel';
import {
  namedModelEntityDecoder,
  urlModelEntityDecoder,
} from '../../Service/Decoders/CommonDecoders';
import { Omit } from '../../Core/CommonTypes';

// We add attributesMap and tablesMap after we get the data from the server
type RecordClassResponse = Omit<RecordClass, 'attributesMap' | 'tablesMap'>;

export const reporterDecoder: Decode.Decoder<Reporter> = Decode.combine(
  Decode.field('name', Decode.string),
  Decode.field('type', Decode.string),
  Decode.field('displayName', Decode.string),
  Decode.field('description', Decode.optional(Decode.string)),
  Decode.field('isInReport', Decode.boolean),
  Decode.field('scopes', Decode.arrayOf(Decode.string))
);

export const attributeFieldDecoder: Decode.Decoder<AttributeField> =
  Decode.combine(
    namedModelEntityDecoder,
    Decode.field('help', Decode.optional(Decode.string)),
    Decode.field('align', Decode.optional(Decode.string)),
    Decode.field('isSortable', Decode.boolean),
    Decode.field('isRemovable', Decode.boolean),
    Decode.field('isDisplayable', Decode.boolean),
    Decode.field('type', Decode.optional(Decode.string)),
    Decode.field('truncateTo', Decode.number),
    Decode.field('formats', Decode.arrayOf(reporterDecoder))
  );

export const tableFieldDecoder: Decode.Decoder<TableField> = Decode.combine(
  namedModelEntityDecoder,
  Decode.field('help', Decode.optional(Decode.string)),
  Decode.field('type', Decode.optional(Decode.string)),
  Decode.field('description', Decode.optional(Decode.string)),
  Decode.field('attributes', Decode.arrayOf(attributeFieldDecoder))
);

export const parameterGroupDecoder: Decode.Decoder<ParameterGroup> =
  Decode.combine(
    Decode.field('description', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('displayType', Decode.string),
    Decode.field('isVisible', Decode.boolean),
    Decode.field('name', Decode.string),
    Decode.field('parameters', Decode.arrayOf(Decode.string))
  );

export const summaryViewPluginDecoder: Decode.Decoder<SummaryViewPluginField> =
  Decode.combine(
    namedModelEntityDecoder,
    Decode.field('description', Decode.string)
  );

export const questionFilterDecoder: Decode.Decoder<QuestionFilter> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.optional(Decode.string)),
    Decode.field('description', Decode.optional(Decode.string)),
    Decode.field('isViewOnly', Decode.boolean)
  );

export const attributeSortingDecoder: Decode.Decoder<AttributeSortingSpec> =
  Decode.combine(
    Decode.field('attributeName', Decode.string),
    Decode.field(
      'direction',
      Decode.oneOf(Decode.constant('ASC'), Decode.constant('DESC'))
    )
  );

export const questionDecoder: Decode.Decoder<Question> = Decode.combine(
  urlModelEntityDecoder,
  Decode.combine(
    Decode.field('summary', Decode.optional(Decode.string)),
    Decode.field('description', Decode.optional(Decode.string)),
    Decode.field('iconName', Decode.optional(Decode.string)),
    Decode.field('shortDisplayName', Decode.string),
    Decode.field('outputRecordClassName', Decode.string),
    Decode.field('help', Decode.optional(Decode.string)),
    Decode.field('newBuild', Decode.optional(Decode.string)),
    Decode.field('reviseBuild', Decode.optional(Decode.string)),
    Decode.field('paramNames', Decode.arrayOf(Decode.string)),
    Decode.field('isAnalyzable', Decode.boolean)
  ),
  Decode.combine(
    Decode.field('groups', Decode.arrayOf(parameterGroupDecoder)),
    Decode.field('defaultAttributes', Decode.arrayOf(Decode.string)),
    Decode.field('defaultSorting', Decode.arrayOf(attributeSortingDecoder)),
    Decode.field('dynamicAttributes', Decode.arrayOf(attributeFieldDecoder)),
    Decode.field('defaultSummaryView', Decode.string),
    Decode.field('noSummaryOnSingleRecord', Decode.boolean),
    Decode.field(
      'summaryViewPlugins',
      Decode.arrayOf(summaryViewPluginDecoder)
    ),
    Decode.field('filters', Decode.arrayOf(questionFilterDecoder)),
    Decode.field(
      'allowedPrimaryInputRecordClassNames',
      Decode.optional(Decode.arrayOf(Decode.string))
    ),
    Decode.field(
      'allowedSecondaryInputRecordClassNames',
      Decode.optional(Decode.arrayOf(Decode.string))
    )
  ),
  Decode.combine(Decode.field('queryName', Decode.optional(Decode.string))),
  Decode.field('isCacheable', Decode.boolean)
);

export const expandedRecordClassDecoder: Decode.Decoder<RecordClassResponse> =
  // Decode.combine can only take up to 10 arguments, but we can nest
  // calls to Decode.combine for larger objects.
  Decode.combine(
    urlModelEntityDecoder,
    Decode.combine(
      Decode.field('displayNamePlural', Decode.string),
      Decode.field('shortDisplayName', Decode.string),
      Decode.field('shortDisplayNamePlural', Decode.string),
      Decode.field('iconName', Decode.optional(Decode.string)),
      Decode.field('recordIdAttributeName', Decode.string),
      Decode.field('primaryKeyColumnRefs', Decode.arrayOf(Decode.string)),
      Decode.field('description', Decode.string)
    ),
    Decode.combine(
      Decode.field('attributes', Decode.arrayOf(attributeFieldDecoder)),
      Decode.field('tables', Decode.arrayOf(tableFieldDecoder)),
      Decode.field('formats', Decode.arrayOf(reporterDecoder)),
      Decode.field('useBasket', Decode.boolean),
      Decode.field('searches', Decode.arrayOf(questionDecoder))
    )
  );
