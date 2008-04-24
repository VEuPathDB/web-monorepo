#!/usr/bin/perl -Tw 


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
      AutoCommit => 0 
    }
) or die "Can't connect to the database: $DBI::errstr\n";;

my $query=new CGI();

my $editResult=&editMessage();
if($query->param("updateMessageId")){
   my $updateResult=&updateMessage();
   }

    #Retrieve message row from database for editing.
    sub editMessage(){

        my $editMessageId=$query->param("editMessageId");
        
        my $sql=q(SELECT message_id, message_text, 
           message_category, 
           TO_CHAR(start_date, 'mm-dd-yyyy hh24:mi:ss'), 
           TO_CHAR(stop_date, 'mm-dd-yyyy hh24:mi:ss'), 
           admin_comments 
           FROM messages
           WHERE message_id = ? );  
         
        my $sth=$dbh->prepare($sql) or
        die "Could not prepare query. Check SQL syntax.";
        $sth->execute($editMessageId) or die "Can't excecute SQL";

         my @row;
         
         while (@row=$sth->fetchrow_array()) {
		
         my $editMessageId = $row[0];
	 my $editMessageText = $row[1];
	 my $editMessageCategory = $row[2];
	 my $editStartDate = $row[3];
	 my $editStopDate = $row[4];
	 my $editAdminComments = $row[5];
		
		print<<_END_OF_TEXT_
	<html>
        <head>	
	<title>Edit Message</title>
        <script language="javascript" type="text/javascript" src="../../include/datetimepicker.js">
        </script>
        </head>
	<body style="background-color: #e0e2eb"> 
        <form method="post" action=messageEdit.pl>
	<p><b>Message ID:</b>
	<textarea name="editMessageId"  style="overflow: auto" rows="1" cols="6" readonly="yes">$editMessageId</textarea></p>
	<p><b>Message Category:</b>: 	
	<select name="editMessageCategory">
	<option value=$editMessageCategory>$editMessageCategory</option>
	<option value ="Information">Information</option>
	<option value ="Degraded">Degraded</option>
	<option value ="Down">Down</option>
	</select>
        </p>
        <p><b>Message Text: </b></p>
        <p><textarea name="editMessageText"  style="overflow: auto" rows ="5" cols="50">$editMessageText</textarea></p>     
	<p><b>Start Date/Time:</b>
	<textarea name="editStartDate" id="editStartDate" rows="1" cols="20" size="25">$editStartDate</textarea><a href="javascript:NewCal('editStartDate','mmddyyyy', 'true')"><img src="../../images/cal.gif" width="16" height="16" border="0" alt="Pick a date"></a>	
	<p><b>Stop Date/Time:</b>
        <textarea name="editStopDate" id="editStopDate" rows="1" cols="20" size="25">$editStopDate</textarea><a href="javascript:NewCal('editStopDate','mmddyyyy', 'true')"><img src="../../images/cal.gif" width="16" height="16" border="0" alt="Pick a date"></a>
	<p><b>Admin Comments:</p></b> 
	<textarea name="editAdminComments" rows="6" cols="60">$editAdminComments</textarea>
        <input type="hidden" name="updateMessageId" value=$editMessageId>
	<p align="center"><input type="submit" name="newInfo" value="Submit Edit" ></p>
	</form>
        <!--Submit Form--> 
        </body>
	</html>
_END_OF_TEXT_
;
}
}#End editMessage subroutine

    #Write updated message record to the database.
    sub updateMessage() {
        
        my $updateMessageId = $query->param("editMessageId");
	my $updateMessageText = $query->param("editMessageText");
        my $updateMessageCategory = $query->param("editMessageCategory");
        my $updateStartDate = $query->param("editStartDate");
        my $updateStopDate =  $query->param("editStopDate");
        my $updateAdminComments = $query->param("editAdminComments");
        
        ###Begin database transaction
        eval{
        my $sql=q(UPDATE MESSAGES SET 
                   message_text = ?, message_category = ?, 
                   start_date = TO_DATE( ? , 'mm-dd-yyyy hh24:mi:ss'), 
                   stop_date = TO_DATE( ? , 'mm-dd-yyyy hh24:mi:ss'), 
                   admin_comments = ? 
                   WHERE message_id = ?);

       my $sth=$dbh->prepare($sql) or die "Could not prepare SQL. Check syntax.";
       $sth->execute($updateMessageText, 
                     $updateMessageCategory, 
                     $updateStartDate, 
                     $updateStopDate, 
                     $updateAdminComments, 
                     $updateMessageId)
          or die "Could not execute SQL.";
       $sth->finish();
       $dbh->commit();
       };

    if($@) {
	warn "Unable to process record update transaction. Rolling back as a result of: $@\n";
	$dbh->rollback();
    }  

}#End updateMessage Subroutine

#Finish and close DB connection
$dbh->disconnect();
