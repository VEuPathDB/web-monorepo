import {SnpsAlignmentTable} from '../common/Snps';

export function RecordTable(props) {
  return props.table.name === 'HTSStrains' ? <SnpsAlignmentTable {...props} strainAttributeName="strain" startAttributeName="start" endAttributeName="end"/>
                                           : <props.DefaultComponent {...props}/>;
}
