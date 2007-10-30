package GUS::ObjRelP::DbiDbHandle;
use strict;
use DBI;
use Carp;

use vars qw(@ISA $verbose $noInsert $exitOnFailure $rollBack);
@ISA = qw( DBI::db DBI );
my ($NO_EMPTY_STRINGS);

$| = 1;

sub new{
  my($class, $dsn, $user, $password, $verbose, $noInsert, $autoCommit) = @_;
  #  my $self = {};
  #  my $self = $class->connect($dsn, $user, $password, 
  #                          {AutoCommit=>$autoCommit, RaiseError=>1});
  my $self = $class->connect($dsn, $user, $password, 
                             {AutoCommit=>$autoCommit,
			      FetchHashKeyName=>'NAME_uc',
			     });
  bless $self, $class;
  $self->setVerbose($verbose);
  $self->setNoInsert($noInsert);
  $self->setRollBack(0);
  return $self;
}

sub setVerbose{
	my ($self, $v) = @_;
	if (defined $v){$verbose = $v;}
}

sub getVerbose{
	my ($self) = @_; 	
  return $verbose;
}

sub setNoInsert{
	my ($self, $noIns) = @_;
	if (defined $noIns){$noInsert = $noIns;}
}

sub getNoInsert{ 
	my ($self) = @_;
	return $noInsert;
}
sub setNoEmptyStrings { shift; my($bool)=@_; $NO_EMPTY_STRINGS = $bool; }
sub getNoEmptyStrings {return $NO_EMPTY_STRINGS;}

sub setRollBack { 
  my($self,$rb) = @_;
  $rollBack = $rb;
}
sub getRollBack {
  return $rollBack;
}

sub getTransactionStatus {
  my($self) = @_;
  return $self->getRollBack() ? 0 : 1;
}

##default is 1;
$exitOnFailure = 1;
sub setExitOnFailure{
	my ($self, $exitFlag) = @_;
	if (defined $exitFlag){$exitOnFailure = $exitFlag;}
}

sub getExitOnFailure{
	my ($self) = @_;
	return $exitOnFailure;
}

#add error checking here.
sub prepareAndExecute {
  my ($self, $sql_cmd) = @_;
  if ($verbose) { print STDERR"\n\nprepareAndExecute: $sql_cmd \n"; }

  my $sth = $self->prepare($sql_cmd) || &death("Prepare FAILED: " . $self->errstr() . "\n sql_cmd:  \n $sql_cmd \n");
  $sth->execute() || &death("Execute FAILED: " . $self->errstr() . "\n sql_cmd:  \n $sql_cmd \n");
  return $sth;
}

sub sqlexec {
  my ($dbh, $sql_cmd) = @_; ## $dbh is $self
  if (!$dbh) { &confess("\n NO DBH for $sql_cmd \n"); }
  if ($verbose) { print STDERR"\n\nsqlexec: $sql_cmd \n"; }
  if(!$dbh->do($sql_cmd)) {
    &death($dbh, "Failed doing $sql_cmd");
    return 0;
  }
  return 1; # succeeded!
}

#assumes at least one row should be inserted, throws errow if not.
#returns the number of rows affected/inserted.
sub sqlexecIns {
  my ($dbh, $sql_cmd,$longValues) = @_;
	my $row_count = 0;
  if ($verbose) { print STDERR"\n\nsqlexecIns: \n $sql_cmd \n"; print STDERR "LongValues (",join(', ',@$longValues),")\n" if $longValues;}
  if ($noInsert) {
	  print STDERR "\n DbiDbHandle:do\nSET NOEXEC ON \n";
    $dbh->do("SET NOEXEC ON"); 
    if ($verbose) { print STDERR "TESTRUN - INSERT/UPDATE NOT EXECUTED \n"; }
  }
  if($longValues){
    my $stmt = $dbh->prepare($sql_cmd);
    if($stmt->execute(@$longValues)){
      $row_count = 1;  ##not true but will throw error if not successful and objects only do one row!!
    }else{
      my $msg =  "\n SQL ERROR!! involving\n $sql_cmd \n longValues: \n" . 
	join(', ', @$longValues);
      &death($dbh, $msg);
      return 0;
    }

  }else{
    if(!($row_count = $dbh->do($sql_cmd))){
      &death($dbh, "\n SQL ERROR!! involving\n $sql_cmd \n");
      return 0;
    }
  }
	if ($verbose) {print STDERR "rowcount:" . $row_count ."\n";}
	if ($row_count > 0) {
		if ($verbose) { print STDERR " DbiHandle:sqlexecIns:insert succeeded $row_count row(s)\n";}
	} else {
		print STDERR " DbiHandle:sqlexecIns:insert failed on  \n $sql_cmd \n no rows inserted\n";		
	}
  if ($noInsert) {
    $dbh->do("SET NOEXEC OFF");  ##SJD - Check same for ORACLE!
    if ($verbose) { print STDERR "Turning execution back on. \n"; }
  }
  return $row_count; # return number of rows inserted.
}

##new exec method...takes in statement..is here only to take advantage of $verbose, $exitOnFailure
sub sqlExec {
  my($dbh,$stmt,$values,$sql_cmd) = @_;
#  if ($verbose) { print STDERR"\n\nsqlExec: $sql_cmd \n  bindValues (",join(', ',@$values),")\n";}
  if ($verbose) { print STDERR"\n\nsqlExec: $stmt->{Statement}\n  bindValues (",join(', ',@$values),")\n";}
  if ($noInsert) {
	  print STDERR "\n DbiDbHandle:do\nSET NOEXEC ON \n";
    $dbh->do("SET NOEXEC ON"); 
    if ($verbose) { print STDERR "TESTRUN - INSERT/UPDATE NOT EXECUTED \n"; }
  }
  if($stmt->execute(@$values)){
    if ($verbose) { print STDERR " DbiHandle:sqlExec:insert succeeded 1 row(s)\n";}
  }else{
    &death($dbh, "\n SQL ERROR!! involving\n $sql_cmd \n Values: " .
	   join(', ',@$values));
    return 0;
  }

  if ($noInsert) {
    $dbh->do("SET NOEXEC OFF");  ##SJD - Check same for ORACLE!
    if ($verbose) { print STDERR "Turning execution back on. \n"; }
  }
  return 1; 
}

sub death {
  my ($dbh, $msg) = @_; 
  if ($exitOnFailure) {
    $dbh->rollback();
    &confess("$msg");
  } else {
    print STDERR "$msg\n\nRolling back and continuing\n";
    $dbh->setRollBack(1);
  }
}

sub free{
	my $self = shift;
	$self->disconnect();

} 

# JC 9/6/2002 
#
# Subclassing not set up correctly according to DBI manpage;
# this appears to fix it, although the structure is still 
# a little off.  The fact that we're reblessing the return 
# value from the DBI connect() method is making everything
# work, albeit in a roundabout way.
#
package GUS::ObjRelP::DbiDbHandle::db;
use vars qw(@ISA);
@ISA = qw( DBI::db );

package GUS::ObjRelP::DbiDbHandle::st;
use vars qw(@ISA);
@ISA = qw( DBI::st );



1;
