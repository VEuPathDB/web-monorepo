import * as t from 'wdk-client/Utils/Json';
import { SUMMARY_ATTRIBUTES } from './Utils';

// TODO Confirm if these attributes are required. If so, remove t.nullValue.
const summaryAttributeDecoders =
  t.combine(...SUMMARY_ATTRIBUTES.map(name => t.field(name, t.oneOf(t.string, t.nullValue))));

export const PrimaryKey = t.arrayOf(t.record({
  name: t.string,
  value: t.string
}));

export type StudyRecord = t.Unpack<typeof StudyRecord>;
export const StudyRecord = t.record({
  displayName: t.string,
  id: PrimaryKey,
  recordClassName: t.string,
  attributes: t.combine(
    summaryAttributeDecoders,
    t.field('summary', t.string)
  ),
  tables: t.record({
  })
})
