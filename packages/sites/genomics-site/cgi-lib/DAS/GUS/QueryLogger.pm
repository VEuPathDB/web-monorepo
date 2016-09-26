package  DAS::GUS::QueryLogger;

use Time::HiRes qw ( time );
use Fcntl qw(:flock SEEK_END);
use File::Path;
use WDK::Model::ModelConfig;
use strict;

# Log gbrowse queries.
# file locking is commented out, as it is probably overkill and a bit dangerous.
my $LOG10 = log(10);

#####################################################
# hard coded configuration
#####################################################
# treat sub-floor ranges like the floor
my $RANGE_FLOOR = 50000;

# max log sizes (megabytes) (shared equally among the three logs).
my $LOGSIZES = {'w1' => 250, 'q1' => 25, 'b1' => 25,
		'w2' => 250, 'q2' => 25, 'b2' => 25,
		'dev' => 1};
#####################################################
#####################################################

sub new {
    my ($class, $logFileDirectory, $site, $inGenePage) = @_;
    my $self = {};

    my $projectId = $ENV{PROJECT_ID};
    my $c = new WDK::Model::ModelConfig($projectId);

    $self->{baselineThreshold} = .1;
    $self->{slowThreshold} = 2;

    if ($c->{queryMonitor}) {
      $self->{baselineThreshold} = $c->{queryMonitor}->{baseline} if defined($c->{queryMonitor}->{baseline});
      $self->{slowThreshold} = $c->{queryMonitor}->{slow} if defined($c->{queryMonitor}->{slow});
    }

    if ($logFileDirectory) {
      $self->{inGenePage} = $inGenePage;
      $self->{logFileDir} = $logFileDirectory;
      mkpath($logFileDirectory);
      my @siteparts = split(/\./, $site);

      my $slowFile = "$logFileDirectory/slowQueries.log";
      &rotateLog($logFileDirectory, 'slowQueries', $siteparts[0]);
      open($self->{slowHandle},">> $slowFile") ||
	die "Can't open gbrowse log file '$slowFile'\n";

    }
    bless($self,$class);
    return $self;
  }

# execute a query, and log if we have a handle
sub execute {
    my ($self, $sth) = @_;
    my $start_time = time();
    my $status = $sth->execute();
    return ($status, $start_time, time());
}

sub logQuery {
    my ($self, $startTime, $firstPageTime, $sql, $moduleName, $queryName, $range) = @_;
    if ($self->{logFileDir}) {
      my $elapsed_first_page_time = ($firstPageTime - $startTime);
      my $elapsed_last_page_time = (time() - $startTime);

      my $reportedRange = $range? $range : "n/a";
      my $r = ($range && $range >= $RANGE_FLOOR)? $range : $RANGE_FLOOR;

      # scaling here so that 50k = 1, 1m = 5 and 5m = 9
      # in other words, an approx 10 fold difference in speed allowed
      # across typical smallest window (gene page) and largest (chromosome)
      my $scaledRange = &log10($r/5000) ** 2;
      my $baseline = $scaledRange * $self->{baselineThreshold};
      my $slow = $scaledRange * $self->{slowThreshold};

      my $fh;
      my $howSlow;
      if ($elapsed_last_page_time > $slow) {
	$fh = $self->{slowHandle};
	$howSlow = 'slow';
      } elsif ($elapsed_last_page_time > $baseline) {
	$fh = $self->{slowHandle};
	$howSlow = 'baseline';
      }
      if ($fh) {
        my $inGenePage = $self->{inGenePage}? 'GENEPAGE ' : ''; 
#        lock($fh);
	# we need the EOL so reports can detect corrupted lines
	print $fh "${inGenePage}QUERYTIME\t" . localtime() . "\t" . time() . "\t$howSlow\t$moduleName\t" . sprintf("%.4f", $elapsed_first_page_time) . "\t" . sprintf("%.4f", $elapsed_last_page_time) . "\t$reportedRange\t$queryName\tEOL\n";
	print $fh "$sql\n\n" if $howSlow eq 'slow';
#	unlock($fh);
      }
    }
}

sub lock {
  my ($fh) = @_;
  flock($fh, LOCK_EX) or die "Cannot lock gbrowse log - $!\n";

  # and, in case someone appended while we were waiting...
  seek($fh, 0, SEEK_END) or die "Cannot seek - $!\n";
}

sub unlock {
  my ($fh) = @_;
  flock($fh, LOCK_UN) or die "Cannot unlock gbrowse log - $!\n";
}

sub log10 {
  my $n = shift;
  return log($n)/$LOG10;
}

sub rotateLog {
  my ($logFileDir, $file_base_name, $sitetype) = @_;

  my $maxsize = $LOGSIZES->{$sitetype};
  $maxsize = $LOGSIZES->{dev} unless $maxsize;
  $maxsize = $maxsize * 1000000 / 3;

  my $logFile = "$logFileDir/$file_base_name.log";
  my $rotatedLogFile = "$logFileDir/$file_base_name.1.log";
  my $tmpLogFile = "$rotatedLogFile.tmp";

  # see if we have a log that is too big
  if (-s $logFile > $maxsize) {
    rename($logFile, $tmpLogFile);
  }

  # see if we have a tmp file older than 5 minutes
  elsif (-e $tmpLogFile && (-M $tmpLogFile) * 24 * 60 > 5) {
    rename($tmpLogFile, $rotatedLogFile);
    exec("gzip $rotatedLogFile");
  }

}

1;
