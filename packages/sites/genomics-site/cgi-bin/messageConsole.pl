#!/usr/bin/perl -Tw 

###
# messageConsole.pl  
#
# AMS management script
#
# Author: Ryan Thibodeau
#
###

use CGI qw/:standard/;
use strict;
use warnings;
use CGI::Carp qw(fatalsToBrowser);
use DBI qw(:sql_types);
use lib map { /(.*)/ } split /:/, $ENV{PERL5LIB}; # untaint PERL5LIB 
use ApiCommonWebsite::Model::CommentConfig;
use HTTP::Headers;

# Print the content and no-cache headers
my $headers = HTTP::Headers->new(
        "Content-type" => "text/html",
        Expires => 0,
        Pragma => "no-cache",
        "Cache-Control" => "no-cache, must-revalidate");
print $headers->as_string() . "\n";


# Test for new submission request
my $query=new CGI();
if ($query->param("submitMessage")){

#XHTML to Render a new message submission form
        print <<_END_OF_DATA_
<html>
<head>
<title>AMS ALPHA</title>
<h1 align="left">Message Submission</h1>
<script language="javascript" type="text/javascript" src="../include/datetimepicker.js">
</script>
<script language="JavaScript">
<!--
function refreshParent() {
  window.opener.location.href = "messageConsole.pl";

  if (window.opener.progressWindow)
		
 {
    window.opener.progressWindow.close()
  }
  window.close();
}
//-->
</script>
<!--Link to site style-->
<link href="/var/www/ryanthib.giardiadb.org/project_home/ApiCommonWebsite/Site/htdocs/include/messageStyles.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div style="width: 500px; left: 10px; top: 10%; height: 640px; padding: 5px; background-color: #E0E2EB">
<form method="get" name="submitNew" action="admin/messageInsert.pl">
<p>Message Category:
<select name="messageCategory">
<option value ="Information">Information </option>
<option value ="Degraded">Degraded</option>
<option value ="Down">Down</option>
</select>
<p>Select affected systems:</p>
 <div style="width: 140px; height: 105px; padding: 5px; line-height: 1.3; background-color: #EDE6DE; border-style: outset">
  <input type="checkbox" name="projects" value="1">CryptoDB<br>
  <input type="checkbox" name="projects" value="2">GiardiaDB<br>
  <input type="checkbox" name="projects" value="3">PlasmodDB<br>
  <input type="checkbox" name="projects" value="4">ToxoDB<br>
  <input type="checkbox" name="projects" value="5">TrichDB<br>
  </div>
<p>Enter Message Text:</p>
<p><textarea cols="60" rows="5" name="messageText"></textarea></p>
<p>Start date:
<input id="startDate" type="text" name="startDate" size="25"><a href="javascript:NewCal('startDate','mmddyyyy', 'true')"><img src="../images/cal.png" width="16" height="16" border="0" alt="Pick a date"></a>
<p>Stop date:
<input id="stopDate" type="text" name="stopDate" size="25"><a href="javascript:NewCal('stopDate','mmddyyyy', 'true')"><img src="../images/cal.png" width="16" height="16" border="0" alt="Pick a date"></a>
<p>Enter Additional Comments:</p>
<p><textarea cols="60" rows="5" name="adminComments"></textarea></p>
<input type="hidden" name="newMessage" value="newMessage">
 <div style="margin: 0 auto ; width: 130px; height: 25px">
  <input type="submit" value="Submit New Message" onClick="refreshParent();">
    </div>
</form>
</div>
</body>
</html>
_END_OF_DATA_
;
}

else{ # Display message database
#Create DB connection
my $model=$ENV{'PROJECT_ID'};
my $dbconnect=new ApiCommonWebsite::Model::CommentConfig($model);

my $dbh = DBI->connect(
    $dbconnect->{dbiDsn},
    $dbconnect->{login},
    $dbconnect->{password},
    { PrintError => 1,
      RaiseError => 1,
      AutoCommit => 1,
    }
) or die "Can't connect to the database: $DBI::errstr\n";;

# SQL to select messages from DB for display
my $sql=q(SELECT message_id, 
                message_text, message_category, 
                TO_CHAR(start_date, 'mm-dd-yyyy hh24:mi:ss'), 
                TO_CHAR(stop_date, 'mm-dd-yyyy hh24:mi:ss'), 
                admin_comments, TO_CHAR(time_submitted, 'mm-dd-yyyy hh24:mi:ss') 
                FROM MESSAGES ORDER BY message_id DESC);

my $sth=$dbh->prepare($sql) or
     die "Could not prepare query. Check SQL syntax.";
     
$sth->execute() or die "Can't excecute SQL";


# XHTML to display query results in bordered table.
print <<_END_OF_TEXT_
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" >
	<head>
	<title>AMS Console</title>
        <link href="/include/messageStyles.css" rel="stylesheet" type="text/css" />
        <script language="javascript">
         function submitWindow()
           {
             mywindow = window.open ("/cgi-bin/messageConsole.pl",
             "mywindow","location=1,status=1,scrollbars=1,
             width=500,height=500");
             mywindow.moveTo(0,0);
           }
	</script>
        </head>
        <body>
	<!--Create column headers and border-->
	<div style="position: relative; width: 80%; height: 60%; top: 5%; margin: 0 auto;">
        <table> 
	<tr class="header">
	<th>Message ID</th>
	<th>Message Text</th>
	<th>Message Category</th>
	<th>Start Date</th>
	<th>Stop Date</th>
	<th>Admin Comments</th>
	<th>Time Submitted</th>
	</tr>
_END_OF_TEXT_
;

# Print retrieved rows from database
my @row;
my $i=0;
my $n=0;


      while ((@row=$sth->fetchrow_array) && ($n < 10)){
        
         my $rowStyle;        
	if ($i % 2==0){$rowStyle="alternate";}
           else {$rowStyle="primary";}

         print <<_END_OF_TEXT_
        <!--Print database row, alternating background color-->  
	<tr class="$rowStyle">  
        <td> <a href=/cgi-bin/admin/messageInsert.pl?editMessageId=$row[0] onClick="window.open('/cgi-bin/admin/messageInsert.pl?editMessageId=$row[0]','submitNew','width=500,height=700,toolbar=no, location=no, value=submitNew, directories=no,status=yes,menubar=no,scrollbars=no,copyhistory=yes, resizable=no'); return false">$row[0]</a></td>
        <td>$row[1]</td>
	<td>$row[2]</td>
	<td>$row[3]</td>
	<td>$row[4]</td>
	<td>$row[5]</td>
	<td>$row[6]</td>
	</tr>
        
_END_OF_TEXT_
;
$i++;
$n++;
       }
       
print <<_END_OF_TEXT_
</table>
</div>  
<div style="position: relative; top: 3px; width: 175px; height: 30px; margin: 0 auto">
   <form>
    <input type= "submit" value="Submit New Message" onClick="submitWindow();"> 
    <input type="hidden" name="submitMessage" value="submitMessage">
   </form>
</div>
</body>
</html>
_END_OF_TEXT_
;
     	 
#Finsh and close DB connection  
$dbh->disconnect();
}
