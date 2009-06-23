<!-- ATV applet (phylogenetic tree viewer) launchpad -->
function openATVWin( dataurl ) {
  var atv_window = open("", "atv_window", 
    "width=300,height=250,status=no,toolbar=no,menubar=no,resizable=no");
  window.focus();

  var fullurl = /^http/;
  var datasource;
  
  if (dataurl.match(fullurl)) {
    datasource = dataurl;
  } else {
    datasource = "http://" + location.host + "/" + dataurl;
  }
  
  var w = atv_window.document;
  w.open("text/html", "replace");
  w.writeln( "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>" );
  w.writeln( "<html>" );
  w.writeln( "<head>" );
  w.writeln( "<title>ATV Launchpad</title>" );
  w.writeln( "</HEAD>" );
  w.writeln( "<body text='#000000' bgcolor='#DDDDDD'>" );
  w.writeln( "<center>" );
  w.writeln( "<font face='helvetica,arial'>" );
  w.writeln( "<b>Control window for ATV tree viewer.</b><br><br>" );
  w.writeln( "<b>Please do not close this window as long as you want to use ATV.</b>" );
  w.writeln( "</font>" );
  w.writeln( "<hr>" );
  w.writeln( "<font face='helvetica,arial'>" );
  w.writeln( "<font size='-1'>ApiDB Bioinformatics Resource Center for Biodefense and Emerging/Re-emerging Infectious Diseases.</font>" );
  w.writeln( "<br><br>" );
  w.writeln( "<applet archive='/ATVapplet.jar?" + parameterizedCookie() + "'" ); // append any authN ticket
  w.writeln( " codebase='/'" );
  w.writeln( " code='forester.atv_awt.ATVapplet.class'" );
  w.writeln( " align='middle'" );
  w.writeln( " width='220' height='60'" );
  w.writeln( " alt='ATV Applet is not working on your system (requires at least Sun Java 1.5)!'>" );
  w.writeln( "<param name='url_of_tree_to_load' value='" + datasource + "'>" );
  w.writeln( "Your browser is completely ignoring the &lt;APPLET&gt; tag!" );
  w.writeln( "</applet>" );
  w.writeln( "</font>" );
  w.writeln( "</center>" );
  w.writeln( "</body>" );
  w.writeln( "</html>" );
  w.close();  
}

function parameterizedCookie() {
  return document.cookie.replace(/; /g, "&");
}
