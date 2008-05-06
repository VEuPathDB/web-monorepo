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
my $insertResult;
my $editResult;
my $updateResult;


# Is this a new message submission?
if ($query->param("newMessage")){
   $insertResult=&insertMessage();
   }

# Is this a message edit?
if ($query->param("editMessageId")){
   $editResult=&editMessage();
   }


# Is this a message update?
if ($query->param("updateMessageId")){
   $updateResult=&updateMessage();
   }


    sub insertMessage(){
        
        my $messageText=$query->param("messageText");
        my $messageCategory=$query->param("messageCategory");
        my @selectedProjects=$query->param("projects");
        my $startDate=$query->param("startDate");
        my $stopDate=$query->param("stopDate");
        my $adminComments=$query->param("adminComments");

        ###Begin DB Transaction###
        eval{
             my $sql=q(INSERT INTO MESSAGES (message_id, message_text, 
                message_category, start_date, stop_date, 
                admin_comments, time_submitted) 
                VALUES (messages_id_pkseq.nextval,?,?,
                (TO_DATE( ? , 'mm-dd-yyyy hh24:mi:ss')),
                (TO_DATE( ? , 'mm-dd-yyyy hh24:mi:ss')),
                ?,SYSDATE)
                RETURNING message_id INTO ?);

        my $sth=$dbh->prepare($sql);
           die "Could not prepare query. Check SQL syntax."
              unless defined $sql;

        # Bind variable parameters by reference (mandated by bind_param_inout)  
        my $newMessageID;
        $sth->bind_param_inout(1,\$messageText, 38);
        $sth->bind_param_inout(2,\$messageCategory, 38);
        $sth->bind_param_inout(3,\$startDate, 38);
        $sth->bind_param_inout(4,\$stopDate, 38);
        $sth->bind_param_inout(5,\$adminComments, 38);
        $sth->bind_param_inout(6,\$newMessageID, 38);
        $sth->execute();

        # Bind message id's to selected projects in DB       
        foreach my $projectID (@selectedProjects) {
            my $insert=q(INSERT INTO MESSAGE_PROJECTS (message_id, project_id) VALUES (?, ?));
               $sth=$dbh->prepare($insert);
               $sth->execute($newMessageID, $projectID);
               }

        $sth->finish();

        # Attempt DB commit, rollback if any errrors occur    
        $dbh->commit();
        };

        if ($@) {
          warn "Unable to process database transaction. Rolling back as a result of: $@\n";
          eval{ $dbh->rollback() };
          }
         ###End DB Transaction###

         # XHTML redirect to updated table view
         print<<_END_OF_TEXT_
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
         "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" >
        <head>
        <meta http-equiv="REFRESH" content="0;url=http://ryanthib.giardiadb.org/cgi-bin/messageConsole.pl">
        </head>
        </html>
_END_OF_TEXT_
;

    } ## End insertMessage Subroutine

    # Retrieve message row from database for editing.
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
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
         "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" >
        <head>	
	<title>Edit Message</title>
        <script language="javascript" type="text/javascript" src="../../include/datetimepicker.js">
        </script>
        <script language="JavaScript">
        <!--
        function refreshParent() {
         window.opener.location.href = "../messageConsole.pl";

        if (window.opener.progressWindow)
                
        {
        window.opener.progressWindow.close()
        }
        window.close();
        }
        //-->
        </script>

        </head>
	<body style="background-color: #e0e0eb"> 
        <form method="get" name="submitEdit" action=messageInsert.pl>
	<p><b>Message ID: $editMessageId</b>
	<p><b>Message Category:</b>: 	
	<select name="editMessageCategory">
	<option value=$editMessageCategory>$editMessageCategory</option>
	<option value ="Information">Information</option>
	<option value ="Degraded">Degraded</option>
	<option value ="Down">Down</option>
	</select>
        </p>
        <p>Select affected systems:</p>
        <div style="width: 140px; height: 105px; padding: 5px; line-height: 1.3; background-color: #EDE6DE; border-style: outset">
        <input type="checkbox" name="editSelectedProjects" value="1">CryptoDB<br>
        <input type="checkbox" name="editSelectedProjects" value="2">GiardiaDB<br>
        <input type="checkbox" name="editSelectedProjects" value="3">PlasmodDB<br>
        <input type="checkbox" name="editSelectedProjects" value="4">ToxoDB<br>
        <input type="checkbox" name="editSelectedProjects" value="5">TrichDB<br>
        </div>
        <p><b>Message Text: </b></p>
        <p><textarea name="editMessageText"  style="overflow: auto" rows ="5" cols="50">$editMessageText</textarea></p>     
	<p><b>Start Date/Time:</b>
	<textarea name="editStartDate" id="editStartDate" rows="1" cols="20" size="25">$editStartDate</textarea><a href="javascript:NewCal('editStartDate','mmddyyyy', 'true')"><img src="../../images/cal.png" width="16" height="16" border="0" alt="Pick a date"></a>	
	<p><b>Stop Date/Time:</b>
        <textarea name="editStopDate" id="editStopDate" rows="1" cols="20" size="25">$editStopDate</textarea><a href="javascript:NewCal('editStopDate','mmddyyyy', 'true')"><img src="../../images/cal.png" width="16" height="16" border="0" alt="Pick a date"></a>
	<p><b>Admin Comments:</p></b> 
	<textarea name="editAdminComments" rows="6" cols="50">$editAdminComments</textarea>
        <input type="hidden" name="updateMessageId" value=$editMessageId>
	<p align="center"><input type="submit" name="newInfo" value="Submit Edit"></p>
	</form>
        <!--Submit Form--> 
        </body>
	</html>
_END_OF_TEXT_
;
}
}### End editMessage subroutine

    # Write updated message record to the database.
    sub updateMessage() {
        
        my $updateMessageId = $query->param("updateMessageId");
	my $updateMessageText = $query->param("editMessageText");
        my $updateMessageCategory = $query->param("editMessageCategory");
        my @updateSelectedProjects = $query->param("editSelectedProjects");
        my $updateStartDate = $query->param("editStartDate");
        my $updateStopDate =  $query->param("editStopDate");
        my $updateAdminComments = $query->param("editAdminComments");
        
        ### Begin database transaction
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

         # Delete existing message_projects rows to avoid redundant messages
         my $sqlDelete=q(DELETE FROM message_projects WHERE message_id = ?);
            $sth=$dbh->prepare($sqlDelete);
            $sth->execute($updateMessageId)
              or die "Could not execute SQL.";

 
         # Bind message id's to revised selected projects in DB       
        foreach my $projectID (@updateSelectedProjects) {
            my $sqlInsert=q(INSERT INTO MESSAGE_PROJECTS (message_id, project_id) VALUES (?, ?));
               $sth=$dbh->prepare($sqlInsert);
               $sth->execute($updateMessageId, $projectID);
               }

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
