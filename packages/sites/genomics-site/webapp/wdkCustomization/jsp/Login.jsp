<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<imp:pageFrame title="EuPathDB Account Login" refer="login">

<h1 align="center">EuPathDB Account Login</h1>
<div align="center">
	<p>
	  <b>Login</b> so you can:
	  <table><tr><td>
	    <div id="cirbulletlist">
	      <ul>
	        <li>keep your strategies (unsaved and saved) from session to session</li>
	        <li>comment on genes and sequences</li>
	        <li>set site preferences</li>
	      </ul>
	    </div>
	  </td></tr></table>
	  <imp:loginForm showError="true" showCancel="false"/>
	</p>
</div>

</imp:pageFrame>

