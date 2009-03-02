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
                 TO_CHAR(start_date, 'mm-dd-yyyy hh24:mi'), 
                 TO_CHAR(stop_date, 'mm-dd-yyyy hh24:mi'), 
                 admin_comments, TO_CHAR(time_submitted, 'mm-dd-yyyy hh24:mi:ss') 
                 FROM announce.messages ORDER BY message_id DESC);

my $sth=$dbh->prepare($sql) or
     die "Could not prepare query. Check SQL syntax.";
     
$sth->execute() or die "Can't excecute SQL";

my @row;
# XHTML to display query results in bordered table.
print <<_END_OF_TEXT_
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" >
	<head>
	<title>AMS Console</title>
        <link href="/css/messageStyles.css" rel="stylesheet" type="text/css" />
        <script language="javascript">
         function submitWindow()
           {
              window.open("/cgi-bin/messageConsole.pl",
             "mywindow",location=1,status=1,scrollbars=1,
             width=500,height=500, value=submitMessage);  return false;
             
           }

	</script>
        <script language="javascript" type="text/javascript">
          function change_image(id,image_url)
          {
          id.src = image_url;
          }
        </script>
         <script language="JavaScript">
         <!--
         function confirmDelete(row)
          {
          var confirmDelete= confirm("Are you sure you want to delete this message record?");
          if (confirmDelete== true)
          {
           window.location=("messageInsert.pl?deleteMessageId="+row+"&messageDelete=true");
           setTimeout('window.location=("messageConsole.pl"), 4000');
          }
          else
            {
             window.close();
            }
          }
           //-->
        </script>
        </head>
        <body>
	<!--Create column headers and border-->
	<div style="position: relative; width: 80%; height: 60%; top: 5%; margin: 0 auto; text-align: center">
        <table> 
	<tr class="header">
	<th>Message ID</th>
	<th>Message Text</th>
	<th>Message Category</th>
        <th>Projects</th>
	<th>Start Date</th>
	<th>Stop Date</th>
	<th>Admin Comments</th>
        <th></th>
	</tr>
_END_OF_TEXT_
;

  
# Print message rows from database 
      my $i=0;
      my $n=0;
      while ((@row=$sth->fetchrow_array) && ($n < 50)){
       
         # Query associated projects from DB
          my @projects=&getProjects($row[0]);
          
        my $rowStyle;        
	if ($i % 2==0){$rowStyle="alternate";}
           else {$rowStyle="primary";}

         print <<_END_OF_TEXT_
        <!--Display database rows, alternating background color-->  
	<tr class="$rowStyle">  
        <td> <a href=/cgi-bin/admin/messageInsert.pl?messageId=$row[0] onsubmit="return validate_form(this)" onClick="window.open('/cgi-bin/admin/messageInsert.pl?messageId=$row[0]','submitNew', 'width=500,height=730,toolbar=no, location=no, value=submitNew, directories=no,status=yes,menubar=no,scrollbars=no,copyhistory=yes, resizable=no'); return false">$row[0]</a>
        </td>
        <td class="message">$row[1]</td>
	<td>$row[2]</td>
        <td>@projects</td> 
	<td>$row[3]</td>
	<td>$row[4]</td>
	<td class="message">@{[$row[5] || '']}</td>
        <td>
            <img id="image_id" src="/images/deleteButtongs.png" onclick="confirmDelete($row[0])" 
            onmouseover="change_image(this, '/images/deleteButton.png')" 
            onmouseout="change_image(this, '/images/deleteButtongs.png')" border="0"/></a>
        </td>
        </tr> 
        
_END_OF_TEXT_
;
        $i++;
        $n++;
     }

 # Render link for new message creation       
print <<_END_OF_TEXT_
</table>
  <div style="position: relative; bottom: 20px; width: 175px; height: 30px; margin: 0 auto">
      <a href=admin/insertMessage.pl?submitMessage=true onClick="window.open('/cgi-bin/admin/messageInsert.pl?submitMessage=true','submitNew', 'width=500,height=700,toolbar=no, location=no, value=submitNew, directories=no,status=yes, menubar=no,scrollbars=no,copyhistory=yes, resizable=no'); return false">Create New Message</a>
  </div>
</div>
</body>
</html>
_END_OF_TEXT_
;
     	 


########################################
  sub getProjects{
   
  ## Query database and return projects associated with messages
   
   my $messageID=$_[0];
   my @projects;
   my $sql=q(SELECT p.project_name FROM announce.projects p, announce.message_projects mp WHERE mp.message_ID = ? AND mp.project_ID = p.project_ID); 
   my $sth=$dbh->prepare($sql);
   $sth->execute($messageID);
        
     while (my @row=$sth->fetchrow_array()){
     my $i=0;
     push (@projects, $row[$i]);
     $i++;
     }
   $sth->finish();
   return @projects;
 
   }# End getProjects subroutine 
########################################

# Finish and close DB connection
$sth->finish();
$dbh->disconnect();




