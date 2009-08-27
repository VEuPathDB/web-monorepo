#!/usr/bin/perl -Tw 

use CGI qw/:standard/;
use DBI qw(:sql_types);
use HTTP::Headers;
use lib map { /(.*)/ } split /:/, $ENV{PERL5LIB}; # Untaint PERL5LIB 
use ApiCommonWebsite::Model::CommentConfig;
use strict;
use warnings;

# Print the content and no-cache headers
my $headers = HTTP::Headers->new(
        "Content-type" => "text/html",
        Expires => 0,
        Pragma => "no-cache",
        "Cache-Control" => "no-cache, must-revalidate");
print $headers->as_string() . "\n";

# Create DB connection
my $model=$ENV{'PROJECT_ID'};
my $dbconnect=new ApiCommonWebsite::Model::CommentConfig($model);

my $dbh = DBI->connect(
    $dbconnect->{dbiDsn},
    $dbconnect->{login},
    $dbconnect->{password},
    { PrintError => 1,
      RaiseError => 1,
      AutoCommit => 1
    }
) or die "Can't connect to the database: $DBI::errstr\n";;

# Query database using parameters passed via announcement.tag
my $query=new CGI();
my $messageCategory=$query->param("messageCategory");
my $projectName=$query->param("projectName");

my $sql=q(SELECT m.message_text, c.category_name 
            FROM announce.messages m, announce.category c, announce.projects p, announce.message_projects mp 
            WHERE p.project_name = ? 
            AND p.project_id = mp.project_id 
            AND mp.message_id = m.message_id 
            AND m.message_category  =  c.category_name 
            AND CURRENT_TIMESTAMP BETWEEN START_DATE AND STOP_DATE
            AND m.message_category = ? );


my $sth=$dbh->prepare($sql) or
     die "Could not prepare query. Check SQL syntax.";
     
$sth->execute($projectName, $messageCategory) or die "Can't excecute SQL";

# Output message(s) returned via query
my @row;
my @messages;
 while (@row=$sth->fetchrow_array()){
    push @messages, $row[0];
}

print join '<hr class="announce"/>', @messages;
 
# Finish and close DB connection  
$dbh->disconnect();






