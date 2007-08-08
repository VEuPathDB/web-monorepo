<!-- ATV applet (phylogenetic tree viewer) launchpad -->
function openATVWin( dataurl ) {
  atv_window = open("", "atv_window", 
    "width=300,height=150,status=no,toolbar=no,menubar=no,resizable=no");
  
  atv_window.document.open();
  atv_window.document.writeln( "<HTML>" );
  atv_window.document.writeln( "<HEAD>" );
  atv_window.document.writeln( "<TITLE>ATV Launchpad</TITLE>" );
  atv_window.document.writeln( "</HEAD>" );
  atv_window.document.writeln( "<BODY TEXT=\"#FFFFFF\" BGCOLOR=\"#000000\">" );
  atv_window.document.writeln( "<FONT FACE=\"HELVETICA,ARIAL\">" );
  atv_window.document.writeln( "<CENTER>" );
  atv_window.document.writeln( "<B>Please do not close this window as long as you want to use ATV.</B>" );
  atv_window.document.write( "<APPLET ARCHIVE=\"/ATVapplet.jar\"" );
  atv_window.document.write( " CODEBASE=\"/\"" );
  atv_window.document.write( " CODE=\"forester.atv_awt.ATVapplet.class\"" );
  atv_window.document.write( " NAME=\"ATV" );
  atv_window.document.write( " WIDTH=\"220\" HEIGHT=\"60\"" );
  atv_window.document.writeln( " ALT=\"ATV Applet is not working on your system (requires at least Sun Java 1.5)!\">" );
  atv_window.document.writeln( "<PARAM NAME=\"url_of_tree_to_load\" VALUE=\"" + dataurl + "\">" );
  atv_window.document.writeln( "Your browser is completely ignoring the &lt;APPLET&gt; tag!" );
  atv_window.document.writeln( "</APPLET>" );
  atv_window.document.writeln( "</CENTER>" );
  atv_window.document.writeln( "</BODY>" );
  atv_window.document.writeln( "</HTML>" );
  atv_window.document.close();  
}
