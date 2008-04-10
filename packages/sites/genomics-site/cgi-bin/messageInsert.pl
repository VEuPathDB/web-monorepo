#!/usr/bin/perl

###
# messageInsert.pl  
#
# Insert a new user specified message into the DB
#
# Author: Ryan Thibodeau
#
###

use DBI;
use lib $ENV{GUS_HOME};
use CGI qw/:standard/;
use strict;
use warnings;
use CGI::Carp qw(fatalsToBrowser);
use DBI qw(:sql_types);
use ApiCommonWebsite::Model::CommentConfig;

#New CGI object to query parameters
my $query=new CGI();

#Query parameters from form;
my $messageText=$query->param("messageText");
my $messageCategory=$query->param("messageCategory");
my @selectedProjects=$query->param("projects");
my $startDate=$query->param("startDate");
my $stopDate=$query->param("stopDate");
my $adminComments=$query->param("adminComments");


#Create DB connection
my $model="GiardiaDB";
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

###Begin DB Transaction###
eval{
my $sql=q(INSERT INTO MESSAGES (message_id, message_category, 
          message_text, start_date, stop_date, 
          admin_comments, time_submitted) 
          VALUES (messages_id_pkseq.nextval,?,?,
          (TO_DATE( ?, 'mm-dd-yyyy hh24:mi')),
          (TO_DATE( ? , 'mm-dd-yyyy hh24:mi')),?,SYSDATE)
          RETURNING message_id INTO ?);
my $sth=$dbh->prepare($sql);
     die "Could not prepare query. Check SQL syntax."
        unless defined $sql;
#Bind variable parameters by reference (mandated by bind_param_inout)  
my $newMessageID;
$sth->bind_param_inout(1,\$messageText, 38);
$sth->bind_param_inout(2,\$messageCategory, 38);
$sth->bind_param_inout(3,\$startDate, 38);
$sth->bind_param_inout(4,\$stopDate, 38);
$sth->bind_param_inout(5,\$adminComments, 38);
$sth->bind_param_inout(6,\$newMessageID, 38); 
$sth->execute(); 

#Bind message id's to selected projects in DB       
foreach my $projectID (@selectedProjects) {
  my $insert=q(INSERT INTO MESSAGE_PROJECTS (message_id, project_id) VALUES (?, ?));
     $sth=$dbh->prepare($insert);
     $sth->execute($newMessageID, $projectID);
     }

$sth->finish();
    
#Attempt DB commit, rollback if any errrors occur    
$dbh->commit();
};

if ($@) {
warn "Unable to process database transaction. Rolling back as a result of: $@\n";
eval{ $dbh->rollback() };
}
###End DB Transaction### 

#Finsh and close DB connection  
$dbh->disconnect();



