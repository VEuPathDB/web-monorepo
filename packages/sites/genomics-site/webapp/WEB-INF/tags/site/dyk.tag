<div id="dyk-box">

<%--
	<div class="dragHandle">
		<h3>Did You Know...</h3>
		<span id="dyk-count">1 of 7</span>
	</div>
--%>

	<div class="dragHandle">
		<div style="margin:0;padding:0;position:absolute;top:0">
			<span class="h3left">Did You Know...</span>
		</div>
		<span id="dyk-count">1 of 7</span>
	</div>

	<div id="dyk-text">
	</div>

	<ul class="tip-box">
			<li><input type="button" id="previous" value="<< Previous" /></li>
			<li><input type="button" id="next" value="Next >>" /></li>
	</ul>
		
		<div id="closing-items">
			<input style="vertical-align:bottom" id="stay-closed-check" type="checkbox" name="stayClosed" />
			<span style="font-size:90%">Never show me this again</span>
			<input id="close" type="button" value="Close" />
		</div>
		<div id="content" style="display:none">
			<span id="tip_1">
				<div style="margin:15px;margin-top:10px;">
				<p><b>...you can click Add Step to add a query to your strategy to refine or expand you result set.</b></p><br>
				<p>Searching EuPathDB sites places you in the <i>Search Strategy</i> system.  You search is the first "step" of a strategy.  To refine or expand your result set, add steps to the strategy as needed.</p><br>
				<p>Click the Add Step button to add a step.  You will be prompted to choose a search.  Next you will be prompted to combine the new search with the previous results (using intersect, union, or minus).  The new Results reflect this combination.</p>
				</div>
			</span>
			<span id="tip_2">
				<div style="margin:15px;margin-top:10px;">
				<p><b>...you can see results of a previous step by clicking on the number in its box.</b></p><br>
				<p>To view the results of a prior search or combination, click on a result count in a step box.</p><br>
				<p>We hope strategies help you get the most from the EuPathDB site's data!</p>
				</div>
			</span>
			<span id="tip_3">
				<div style="margin:15px;margin-top:10px;">
				<p><b>...you can get a menu of step actions by clicking on the step name or the Venn diagram.</b></p><br>
				<p>For a menu of actions/properties for a step's search click on the search name in the step box.</p> <br>
				<p>For a menu of actions/properties for how it is combined with the prior step, click on the Venn diagram.</p>
				</div>
			</span>
			<span id="tip_4">
				<div style="margin:15px;margin-top:10px;">
				<p><b>...you can branch a strategy.  Choose Make Nested Strategy in the step actions menu.</b></p><br>
				<p>Simple strategies are linear.  More advanced strategies include branches.  (For example one step may need to union two searches.)  The trick is to "nest" a strategy within a step.</p>

				<p>Click the step name to get a menu.  Choose "Make Nested Strategy."  Now that step appears expanded in a panel below.  All steps added to that panel will be nested into the step in the panel above.  The whole nested strategy acts as a single step in the parent strategy.</p>
				</div>
			</span>
		</div>
</div>
<div id="dyk-shadow"></div>
