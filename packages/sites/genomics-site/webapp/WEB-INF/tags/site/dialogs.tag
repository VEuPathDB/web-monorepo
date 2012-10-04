<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<!-- Inherit dialogs from WDK -->
<wdk:dialogs/>

<%-- ========dialogs that need to appear in various pages========= --%>
<%-- dialogs instantiated in wdkCommon.js --%>

<div style="display:none;" class="ui-dialog-fixed-width" id="wdk-dialog-IE-warning" title="<imp:verbiage key='dialog.IE-warning.title'/>"><imp:verbiage key='dialog.IE-warning.content'/></div>

<%-- create the dialog HTML --%>
<div style="display:none;" class="ui-dialog-fixed-width" id="wdk-dialog-revise-search" title="<imp:verbiage key='dialog.revise-search.title'/>"><imp:verbiage key='dialog.revise-search.content'/></div>

<div style="display:none;" class="ui-dialog-fixed-width" id="wdk-dialog-annot-change" title="<imp:verbiage key='dialog.annot-change.title'/>"><imp:verbiage key='dialog.annot-change.content'/></div>

<div style="display:none;" id="wdk-dialog-strat-desc">
  <div class="description"></div>
  <div class="edit"><a href="#">Edit</a></div>
</div>

<div style="display:none;" id="wdk-dialog-update-strat" title="<imp:verbiage key='dialog.update-strat.title'/>">
    <div class="save_as_msg"><imp:verbiage key="dialog.update-strat.content"/></div>
    <form id="wdk-update-strat">
        <input type="hidden" name="strategy" value="">
        <dl>
            <dt class="name_label">Name:</dt>
            <dd class="name_input"><input type="text" name="name"></dd>
            <dt class="desc_label">Description (optional):</dt>
            <dd class="desc_input">
                <textarea name="description" rows="10"></textarea>
                <div class="char_note"><em>Note: There is a 4,000 character limit.</em></div>
            </dd>
        </dl>
        <div style="text-align: right"><input name="submit" type="submit" value="Save strategy"></div>
    </form>
</div>

<div style="display:none;" id="wdk-dialog-share-strat" title="<imp:verbiage key='dialog.share-strat.title'/>">
    <div class="share_msg"><imp:verbiage key="dialog.share-strat.content"/></div>
    <div class="share_url"></div>
</div>

<%-- ======== END OF   dialogs that need to appear in various pages========= --%>
