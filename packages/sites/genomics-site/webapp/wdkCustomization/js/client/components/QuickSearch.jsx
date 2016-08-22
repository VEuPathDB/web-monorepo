import { PropTypes } from 'react';
import {Tooltip} from 'wdk-client/Components';

/**
 * Quick search boxes that appear in header
 */
export default function QuickSearch(props) {
  let { webAppUrl } = props;

  return (
    <div id="quick-search" style={{display: 'flex', marginBottom: '16px', marginTop: '16px'}}>
      {props.searches.map(search => (
        <div className="quick-search-item" style={{margin: '0 .4em'}} key={search.name}>
          <Tooltip content={search.help}>
            <form name="questionForm" method="post" action={webAppUrl + '/processQuestionSetsFlat.do'}>
              <input type="hidden" name="questionFullName" value={search.name}/>
              <input type="hidden" name="questionSubmit" value="Get Answer"/>
              <b><a href={'/a/showQuestion.do?questionFullName=' + search.name}>{search.displayName}: </a></b>
              <input type="text" defaultValue={search.textParamDefaultValue} name={search.textParamName}/>
              <input name="go" value="go" type="image" src="/a/images/mag_glass.png" alt="Click to search" width="23" height="23" className="img_align_middle"/>
            </form>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}

QuickSearch.propTypes = {
  webAppUrl: PropTypes.string.isRequired,
  searches: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    help: PropTypes.string.isRequired,
    textParamName: PropTypes.string.isRequired,
    textParamDefaultValue: PropTypes.string.isRequired
  })).isRequired
}
