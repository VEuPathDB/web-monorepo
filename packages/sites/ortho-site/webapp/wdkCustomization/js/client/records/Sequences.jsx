import lodash from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

class SortKeyTable extends React.Component {

      constructor(props) {
          super(props);
	  // Memoize the sorting. Without this, the DataTable widget will think is
  	  // is a new table and reset the sorting. This is bad if a user has already
  	  // sorted the table.
	  this.sortValue = lodash.memoize(value => lodash.sortBy(value, 'sort_key'));
      }

      render() {
      	return <this.props.DefaultComponent {...this.props} value={this.sortValue(this.props.value)}/>
      }
}


export class RecordTable_Sequences extends SortKeyTable {

       toggleAll(checked) {
               const node = ReactDOM.findDOMNode(this);
	       for (const input of node.querySelectorAll('input[name="msa_full_ids"]')) {
		    input.checked = checked;
	        }
       }

       render () {
       	      return (
       	      	     <form action="/cgi-bin/msaOrthoMCL" target="_blank" method="post">

			   <this.props.DefaultComponent {...this.props} value={this.sortValue(this.props.value)}/>
			   <input type="button" name="CheckAll" value="Check All" onClick={() => this.toggleAll(true)}/> 
			   <input type="button" name="UnCheckAll" value="Uncheck All" onClick={() => this.toggleAll(false)}/>
			   <br/>
			   <p>Please note: selecting a large number of proteins will take several minutes to align.</p>
			   <div id="userOptions" >
			   	<p>Output format: &nbsp;
				<select name='clustalOutFormat'>
					<option value="clu">Mismatches highlighted</option>
					<option value="fasta">FASTA</option>
					<option value="phy">PHYLIP</option>
					<option value="st">STOCKHOLM</option>
					<option value="vie">VIENNA</option>
				</select></p>
				<input type="submit" value="Run Clustal Omega for selected proteins"/>
			   </div>
		    </form>
	      );
       }
}
