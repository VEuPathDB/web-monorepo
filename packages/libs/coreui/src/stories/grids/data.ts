export const COLUMNS = [
  {
    Header: 'Participant Stable super long Identifier',
    accessor: 'Participant_stable_id',
  },
  {
    Header: 'Household_stable_id',
    accessor: 'Household_stable_id',
  },
  {
    Header: 'EUPATH_0000120',
    accessor: 'EUPATH_0000120',
  },
  {
    Header: 'EUPATH_0000151',
    accessor: 'EUPATH_0000151',
  },
];

export const ROWS = [
  {
    Participant_stable_id: '1010001',
    Household_stable_id: 'hh_1010001',
    EUPATH_0000120: '38.0',
    EUPATH_0000151: '2012-04-21T00:00:00',
  },
  {
    Participant_stable_id: '1010002',
    Household_stable_id: 'hh_1010002',
    EUPATH_0000120: '26.0',
    EUPATH_0000151: '2012-05-02T00:00:00',
  },
  {
    Participant_stable_id: '1010003',
    Household_stable_id: 'hh_1010003',
    EUPATH_0000120: '19.0',
    EUPATH_0000151: '2012-06-12T00:00:00',
  },
  {
    Participant_stable_id: '1010004',
    Household_stable_id: 'hh_1010004',
    EUPATH_0000120: '57.0',
    EUPATH_0000151: '2012-07-29T00:00:00',
  },
  {
    Participant_stable_id: '1010005',
    Household_stable_id: 'hh_1010005',
    EUPATH_0000120: '30.0',
    EUPATH_0000151: '2012-08-04T00:00:00',
  },
  {
    Participant_stable_id: '1010009',
    Household_stable_id: 'hh_1010009',
    EUPATH_0000120: '50.0',
    EUPATH_0000151: '',
  },
  {
    Participant_stable_id: '1010015',
    Household_stable_id: 'hh_1010015',
    EUPATH_0000120: '22.0',
    EUPATH_0000151: '2012-08-14T00:00:00',
  },
  {
    Participant_stable_id: '1010016',
    Household_stable_id: 'hh_1010016',
    EUPATH_0000120: '40.0',
    EUPATH_0000151: '2012-08-12T00:00:00',
  },
  {
    Participant_stable_id: '1010021',
    Household_stable_id: 'hh_1010021',
    EUPATH_0000120: '54.0',
    EUPATH_0000151: '2012-08-16T00:00:00',
  },
  {
    Participant_stable_id: '1010022',
    Household_stable_id: 'hh_1010022',
    EUPATH_0000120: '38.0',
    EUPATH_0000151: '2012-08-21T00:00:00',
  },
  {
    Participant_stable_id: '1010023',
    Household_stable_id: 'hh_1010023',
    EUPATH_0000120: '60.0',
    EUPATH_0000151: '2012-08-17T00:00:00',
  },
  {
    Participant_stable_id: '1010024',
    Household_stable_id: 'hh_1010024',
    EUPATH_0000120: '37.0',
    EUPATH_0000151: '2012-08-17T00:00:00',
  },
  {
    Participant_stable_id: '1010025',
    Household_stable_id: 'hh_1010025',
    EUPATH_0000120: '60.0',
    EUPATH_0000151: '2012-08-24T00:00:00',
  },
  {
    Participant_stable_id: '1010030',
    Household_stable_id: 'hh_1010030',
    EUPATH_0000120: '27.0',
    EUPATH_0000151: '2012-08-18T00:00:00',
  },
  {
    Participant_stable_id: '1010031',
    Household_stable_id: 'hh_1010031',
    EUPATH_0000120: '17.0',
    EUPATH_0000151: '2012-08-20T00:00:00',
  },
  {
    Participant_stable_id: '1010032',
    Household_stable_id: 'hh_1010032',
    EUPATH_0000120: '50.0',
    EUPATH_0000151: '2012-08-20T00:00:00',
  },
  {
    Participant_stable_id: '1010037',
    Household_stable_id: 'hh_1010037',
    EUPATH_0000120: '60.0',
    EUPATH_0000151: '2012-08-26T00:00:00',
  },
  {
    Participant_stable_id: '1010041',
    Household_stable_id: 'hh_1010041',
    EUPATH_0000120: '40.0',
    EUPATH_0000151: '2012-08-26T00:00:00',
  },
  {
    Participant_stable_id: '1010042',
    Household_stable_id: 'hh_1010042',
    EUPATH_0000120: '50.0',
    EUPATH_0000151: '2012-08-28T00:00:00',
  },
  {
    Participant_stable_id: '1010044',
    Household_stable_id: 'hh_1010044',
    EUPATH_0000120: '40.0',
    EUPATH_0000151: '2012-08-31T00:00:00',
  },
];

export function fetchGridData({
  pageSize,
  pageIndex,
}: {
  pageSize: number;
  pageIndex: number;
}) {
  const startRow = pageSize * pageIndex;
  const endRow = startRow + pageSize;

  return ROWS.slice(startRow, endRow);
}
