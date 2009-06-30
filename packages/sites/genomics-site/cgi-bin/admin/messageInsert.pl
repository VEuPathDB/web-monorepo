#!/usr/bin/perl -Tw 

use CGI qw/:standard/;
use strict;
use warnings;
use CGI::Carp qw(fatalsToBrowser);
use DBI qw(:sql_types);
use lib map { /(.*)/ } split /:/, $ENV{PERL5LIB}; # untaint PERL5LIB 
use ApiCommonWebsite::Model::CommentConfig;
use HTTP::Headers;
use Time::Local;

# Print the content and no-cache headers
my $headers = HTTP::Headers->new(
        "Content-type" => "text/html",
        Expires => 0,
        Pragma => "no-cache",
        "Cache-Control" => "no-cache, must-revalidate");
print $headers->as_string() . "\n";


# Open DB connection
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


if ($query->param("submitMessage"))
  # This is a new message request. Display new message form and exit.
    {
     &displayMessageForm();
     exit(1);
    }

if ($query->param("messageDelete"))
  # This is a message deletion - invoke deletion method.
    {
     &deleteMessage();
     exit(1);
    }


if ($query->param("messageId")){
   # This is a message edit request. Display existing message for editing.
    $editResult=&editMessage();
   }
   
   elsif ($query->param("updateMessageId")){
    # This is an edited message submission. Write it to database.
      $updateResult=&updateMessage();
       if ($updateResult) {&confirmation();}
   }

    else{
     # This is a new message submission. Write it to database.
        $insertResult=&insertMessage();
          if ($insertResult) {&confirmation("new");}
       }

##########################################################
    sub insertMessage(){
       
        my $messageId=""; 
        my $messageText=$query->param("messageText");
        my $messageCategory=$query->param("messageCategory");
        my @selectedProjects=$query->param("selectedProjects");
        my $startDate=$query->param("startDate");
        my $stopDate=$query->param("stopDate");
        my $adminComments=$query->param("adminComments");

       # Validate data from form
       if (&validateData($messageId, $messageCategory, \@selectedProjects, $messageText, $startDate, $stopDate, $adminComments)){

        ###Begin DB Transaction###
        eval{
             my $sql=q(INSERT INTO announce.messages (message_id, message_text, 
                message_category, start_date, stop_date, 
                admin_comments, time_submitted) 
                VALUES (announce.messages_id_pkseq.nextval,?,?,
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
            my $insert=q(INSERT INTO announce.message_projects (message_id, project_id) VALUES (?, ?));
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
          return 0;
          }
        else{
            return 1;
            }
         ###End DB Transaction###
       }

    } 
###########################################################################

    ## Retrieve message row from database for editing.
    sub editMessage() {

        my $editMessageId=$query->param("messageId");
        
        my $sql=q(SELECT message_id, message_text, 
           message_category, 
           TO_CHAR(start_date, 'mm-dd-yyyy hh24:mi:ss'), 
           TO_CHAR(stop_date, 'mm-dd-yyyy hh24:mi:ss'), 
           admin_comments 
           FROM announce.messages
           WHERE message_id = ? );  
         
        my $sth=$dbh->prepare($sql) or
        die "Could not prepare query. Check SQL syntax.";
        $sth->execute($editMessageId) or die "Can't excecute SQL";

         my @row;
         my $errorMessage;
         my $messageId;
         my $messageText;
         my $messageCategory;
         my $startDate;
         my $stopDate;
         my $adminComments;

         while (@row=$sth->fetchrow_array()) {
          $messageId=$row[0];
	  $messageText=$row[1];
	  $messageCategory=$row[2];
	  $startDate=$row[3];
	  $stopDate=$row[4];
	  $adminComments=$row[5];
         }
         # Determine and re-select previously checked projects
         my @selectedProjects=&getSelectedProjects($editMessageId);
         
         # Populate fields and display message form
         &displayMessageForm($errorMessage,
                             $messageId, 
                             $messageCategory,
                             \@selectedProjects,
                             $messageText,
                             $startDate, 
                             $stopDate, 
                             $adminComments);
       
}
##############################################################
    
    sub updateMessage() {

       ##Write an updated message record to the database.
       
        my $messageId = $query->param("updateMessageId");
	my $messageText = $query->param("messageText");
        my $messageCategory = $query->param("messageCategory");
        my @selectedProjects = $query->param("selectedProjects");
        my $startDate = $query->param("startDate");
        my $stopDate =  $query->param("stopDate");
        my $adminComments = $query->param("adminComments");
        my $validForm;

       # Validate data from form
       if (&validateData($messageId, $messageCategory, \@selectedProjects, $messageText, $startDate, $stopDate, $adminComments)) {
       
         $validForm = 1; # form data is valid..proceed
       
        ###Begin database transaction###
        eval{
        my $sql=q(UPDATE announce.messages SET 
                   message_text = ?, message_category = ?, 
                   start_date = TO_DATE( ? , 'mm-dd-yyyy hh24:mi:ss'), 
                   stop_date = TO_DATE( ? , 'mm-dd-yyyy hh24:mi:ss'), 
                   admin_comments = ? 
                   WHERE message_id = ?);

        my $sth=$dbh->prepare($sql) or die "Could not prepare SQL. Check syntax.";
        $sth->execute($messageText, 
                     $messageCategory, 
                     $startDate, 
                     $stopDate, 
                     $adminComments, 
                     $messageId)
          or die "Could not execute SQL.";

         # Delete existing message_projects rows to avoid redundant messages
         my $sqlDelete=q(DELETE FROM announce.message_projects WHERE message_id = ?);
            $sth=$dbh->prepare($sqlDelete);
            $sth->execute($messageId)
              or die "Could not execute SQL.";

 
         # Bind message id's to revised selected projects in DB       
        foreach my $projectID (@selectedProjects) {
            my $sqlInsert=q(INSERT INTO announce.message_projects (message_id, project_id) VALUES (?, ?));
               $sth=$dbh->prepare($sqlInsert);
               $sth->execute($messageId, $projectID);
               }

         $sth->finish();
         $dbh->commit();
         };
       }
  
	if($@) {
            warn "Unable to process record update transaction. Rolling back as a result of: $@\n";
	        $dbh->rollback();
            return 0;
            }
             elsif (!$@ && $validForm) {
                   return 1; # valid form, db transaction succesful, return success
                 }
       ###End database transaction###

    }
####################################
sub displayMessageForm {

        ## Render new submission form, or repopulate and display form with passed params if validation failed.
       
         my $errorMessage=$_[0] || '';
         my $messageId=$_[1] || '';
         my $messageCategory=$_[2] || '';
         my (@selectedProjects)=@{($_[3])} if (@_); # Get selected projects from new message submit
         my $messageText=$_[4] || '';   
         my $startDate=$_[5] || '';
         my $stopDate=$_[6] || '';
         my $adminComments=$_[7] || '';
         my $checkBox;
         my $projectId;

         # Display message ID in form if this is a message edit
            my $idString;
            if ($messageId){
            $idString="<p><b>Message ID: $messageId</b></p>";
            }

my @projectNames=getProjectNames();
my @projectIds=getProjectIds();
   #### XHTML FORM #####     
    print<<_END_OF_TEXT_
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Edit Message</title>
<style type="text/css">
<!--
body {
	background-color: #F6F8FF;
}
.style10 {font-family: Arial, Helvetica, sans-serif; }
-->
</style>
</head>
<body>
<form action="messageInsert.pl" method="get" name="submitEdit" id="submitEdit">
  <div align="center">
    <table width="500" border="0" cellpadding="5" cellspacing="5" bordercolor="#CCCCB0" bgcolor="#F6F8FF">
      <tr>
        <p style="color: red">$errorMessage</p>
        <td><div align="right" class="style10">
          <div align="right">Message Category:</div>
        </div></td>
        <td>
          <label>
          <select name="messageCategory" id="messageCategory">
            <option value="$messageCategory">$messageCategory</option>
            <option value="Event">Event</option>
            <option value="Information">Information</option>
            <option value="Degraded">Degraded</option>
            <option value="Down">Down</option>
          </select>
          </label></td>
      </tr>
      <tr>
        <td valign="top"><div align="right" class="style10">
          <div align="right">Projects Affected:</div>
        </div></td>
        <td bgcolor="#FFF8F2"><p>
_END_OF_TEXT_
;

           my $i=0;
           foreach $projectId (@projectIds) {
            $checkBox = '';
             if (!$messageId) {
                 foreach my $project (@selectedProjects) { 
                      if ($projectId eq $project) {$checkBox = "checked='checked'"};
                     }
                  } 
                elsif ($messageId) {
                   @selectedProjects = getSelectedProjects($messageId);
                    foreach my $project (@selectedProjects) {
                      if ($projectId eq $project) {$checkBox = "checked='checked'"};
                    }
                 }
             print "<label>";
             print "<input type=\"checkbox\" name=\"selectedProjects\" value=\"$projectId\" $checkBox id=\"selectedProjects_[$i]\" />";
             print "<em>$projectNames[$i]</em>";
             print "</label>";
             print "<em>";
             print "<br/>";
             $i++;
            }

print<<_END_OF_TEXT_
        </p>
       <label></label></td>
      </tr>
      <tr>
        <td valign="top"><div align="right" class="style10">
          <div align="right">Message Text:</div>
        </div></td>
        <td>
          <label>
           <textarea name="messageText" id="messageText" cols="45" rows="5">$messageText</textarea>
          </label></td>
      </tr>
      <tr>
        <td><div align="right" class="style10">
          <div align="right">Start Date:</div>
        </div></td>
        <td>
           <label>
          <input name="startDate" type="text" id="startDate" value="$startDate" size="30" />
          </label>
          <a href="javascript:NewCal('startDate','mmddyyyy', 'true')"><img src="/images/cal.gif" width="16" height="16" border="0" alt="Pick a date" /></td>      
      </tr>
      <tr>
        <td><div align="right" class="style10">
          <div align="right">Stop Date:</div>
        </div></td>
        <td>
          <label>
          <input name="stopDate" type="text" id="stopDate" value="$stopDate" size="30" />
          </label>
        <a href="javascript:NewCal('stopDate','mmddyyyy', 'true')"><img src="/images/cal.gif" width="16" height="16" border="0" alt="Pick a date" /></td>
      </tr>
      <tr>
        <td valign="top"><div align="right" class="style10">
          <div align="right">Admin Comments:</div>
        </div></td>
        <td>
          <label>
          <textarea name="adminComments" id="adminComments" cols="45" rows="5">$adminComments</textarea>
        </label></td>
      </tr>
    </table>
    <br/>
    <label>
    <input type="submit" name="newInfo" id="newInfo" value="Submit Message" />
    </label>  
    
    <input name="updateMessageId" type="hidden" id="updateMessageId" value="$messageId" />
  </div>
</form>
<div align="center">
  <script language="javascript" type="text/javascript" src="/js/datetimepicker.js">
</script>
</div>
<script language="javascript" type="text/javascript">
function refreshParent() {
  if (window.opener && !window.opener.closed) {
  window.opener.location.reload();
      }
      //window.close();
  }        
</script>
</body>
</html>
_END_OF_TEXT_
;
}


####################################
   sub getSelectedProjects(){

     ## Determine and return previously selected projects associated with given message ID.
     
     my $messageID=$_[0];
     my @selectedProjects;
     my $sql=q(SELECT p.project_id 
               FROM announce.projects p, announce.message_projects mp 
               WHERE mp.message_ID = ? 
               AND mp.project_ID = p.project_ID);
     my $sth=$dbh->prepare($sql);
     $sth->execute($messageID);

     while (my @row=$sth->fetchrow_array()){
     my $i=0;
     push (@selectedProjects, $row[$i]);
     $i++;
     }
   
     return @selectedProjects;
     } 

####################################

 sub getProjectIds() {

     ## Query DB and return ID's associated with projects.

     my @projectIds;
     my $sql=q(SELECT project_id from announce.projects);
     my $sth=$dbh->prepare($sql);
     $sth->execute();

     while (my @row=$sth->fetchrow_array()){
     my $i=0;
     push (@projectIds,  $row[$i]);
     $i++;
     }

     return @projectIds;
     }

####################################

sub getProjectNames() {

     ## Query DB and return ID's associated with projects.

     my @projectNames;
     my $sql=q(SELECT project_name from announce.projects
               ORDER BY project_id);
     my $sth=$dbh->prepare($sql);
     $sth->execute();

     while (my @row=$sth->fetchrow_array()){
     my $i=0;
     push (@projectNames,  $row[$i]);
     $i++;
     }

     return @projectNames;
     }

####################################

   sub deleteMessage() {
 
      ## Delete a message record from the database
 
      my $messageID=$query->param("deleteMessageId");

      ###Begin Database Transaction###
      eval{
      # Delete message from message_projects table
      my $sql=q(DELETE FROM announce.message_projects WHERE message_id = ?);
      my $sth=$dbh->prepare($sql);
      $sth->execute($messageID);

      # Delete message from message table
        $sql=q(DELETE FROM announce.messages WHERE message_id = ?);
        $sth=$dbh->prepare($sql);
        $sth->execute($messageID);

        $sth->finish();
        $dbh->commit();
       };
       ###End Database Transaction###
       if ($@) {
             warn "Unable to process record update transaction. Rolling back as a result of: $@\n";
             $dbh->rollback();
             }
       }  
###################################
   sub validateData(){
 
         ## Validate data submitted from message form. Reload form and notify user if data is invalid.
      
         my $messageId = shift;
         my $messageCategory = shift;
         my (@selectedProjects) = @{(shift)};
         my $messageText = shift;
         my $startDate = shift;
         my $stopDate = shift;
         my $adminComments = shift;
         my $errorMessage = "";
          
         # Check to ensure that required fields are filled out
           $errorMessage .= "ERROR: Message Category must be specified.<br/>" if(!$messageCategory);
           $errorMessage .= "ERROR: At least one project must be selected.<br/>" if (!@selectedProjects);
           $errorMessage .= "ERROR: Message field is required.<br/>" if (!$messageText);
       
         # Alter submitted date string format to match localtime() format 
           my $convertedStartDate=$startDate;
           my $convertedStopDate=$stopDate;
              $convertedStartDate=~s/\s|:/-/g;
              $convertedStopDate=~s/\s|:/-/g;
       
         # Convert date strings to integer seconds since epoch
          (my $startMonth, my $startDay, my $startYear, my $startHour, my $startMinutes, my $startSeconds) = ($convertedStartDate =~ /(\d+)-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/);
          (my $stopMonth, my $stopDay, my $stopYear, my $stopHour, my $stopMinutes, my $stopSeconds) = ($convertedStopDate =~ /(\d+)-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/);
     
            eval{ 
                 $convertedStartDate = timelocal($startSeconds, $startMinutes, $startHour, $startDay, $startMonth-1, $startYear-1900);
                };
                 if ($@) {$errorMessage .= "ERROR: Start date must be in format MM-DD-YYYY HH:MM:SS.<br/>";}
          
            eval{
                 $convertedStopDate = timelocal($stopSeconds, $stopMinutes, $stopHour, $stopDay, $stopMonth-1, $stopYear-1900);
                };
                 if ($@) {$errorMessage .= "ERROR: Stop date must be in format MM-DD-YYYY HH:MM:SS.<br/>";}

        # Ensure start/stop date logic is valid
        $errorMessage .= "ERROR: Stop date cannot be before start date.<br/>" if (($convertedStartDate) && ($convertedStopDate) && ($convertedStartDate >= $convertedStopDate));
     
        # Ensure start date is not in the past, allow three minute delay
        $errorMessage .= "ERROR: Stop date/time cannot be in the past." if ($convertedStopDate < (time()-600));
        
        if ( $errorMessage )
           {
             # Errors found within the form data - redisplay it and return failure
              &displayMessageForm($errorMessage,
                                  $messageId,
                                  $messageCategory,
                                  \@selectedProjects,
                                  $messageText,
                                  $startDate, 
                                  $stopDate,
                                  $adminComments);

             return 0;
           }
   
        else
           {
        # Form OK - return success
        return 1;
           } 
       
       } ##End validate data subroutine 

#######################################

sub confirmation(){

##Provide confirmation of successful message submission in form window.

my $messageType=$_[0];
my $confirmation;

if ($messageType && $messageType eq "new"){$confirmation="Your message has been scheduled successfully.";}
   else {$confirmation="Revised message has been scheduled successfully.";}

    print<<_END_OF_TEXT_
    <html>
     <body>
     <script type="text/javascript">
        alert ("$confirmation");
        window.close();
      </script>
     </body>
    </html>
_END_OF_TEXT_
;
} 
#Finish and close DB connection
$dbh->disconnect();


