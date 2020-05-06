#!/usr/bin/perl

############################################
##                                        ##
##                 WebLog                 ##
##           by Darryl Burgdorf           ##
##                                        ##
##           Configuration File           ##
##                                        ##
############################################

require "weblog.pl";

$LogFile = "/etc/httpd/logs/orthomcl-access_log*";
$IPLog = "/usr/foo/logs/ips";

$FileDir = "/home/fengchen/www/orthomcl-web/html/weblog/reports";
$ReportFile = "log.html";
$FullListFile = "log.files.html";
$DetailsFile = "log.details.html";
$RefsFile = "log.refs.html";
$KeywordsFile = "log.keys.html";
$AgentsFile = "log.agents.html";

$AgentListFile = "";
$DBMType = 0;

$PrintFullAgentLists = 0;

$EOMFile = "log.eom.html";

$SystemName = "OrthoMCL-DB";

$OrgName = "Univ. of Penn.";
$OrgDomain = 'cbil.upenn.edu';

$GraphURL = "http://orthomcl.cbil.upenn.edu/weblog/graphs";
$GraphBase = "visits";

# $IncludeOnlyRefsTo = '(includethis|andthis)';
# $ExcludeRefsTo = '(excludethis|andthis)';

# $IncludeOnlyDomain = '';
# $ExcludeDomain = '';

$IncludeQuery = 0;

$PrintFiles = 1;
$Print404 = 1;
$PrintDomains = 0;
$PrintUserIDs = 0;
$PrintTopNFiles = 10;
$TopFileListFilter = '(\.gif|\.jpg|\.jpeg|\.class|\.ico|\.txt|Code)';
$PrintTopNDomains = 0;

$LogOnlyNew = 0;

$NoSessions = 0;
$NoResolve = 0;

$HourOffset = 0;

$DetailsFilter = '(\.gif|\.jpg|\.jpeg|\.class|\.ico|\.txt)';
$DetailsDays = 0;
$DetailsSummaryDays = 28;

$refsexcludefrom = '(file:)';
$refsexcludeto = '(\.gif|\.jpg|\.jpeg|\.class|\.ico|\.txt)';

$RefsStripWWW = 1;
$RefsFilterLists = 1;
$TopNRefDoms = 10;
$TopNKeywords = 10;

$AgentsIgnore = '(\.gif|\.jpg|\.jpeg|\.class|\.ico|\.txt)';

$Verbose = 1;

$bodyspec = "BGCOLOR=\"#ffffff\" TEXT=\"#000000\"";

$headerfile = "/usr/www/users/foo/header.txt";
$footerfile = "/usr/www/users/foo/footer.txt";

&MainProg;
