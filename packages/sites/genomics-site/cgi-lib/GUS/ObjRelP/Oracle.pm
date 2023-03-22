package GUS::ObjRelP::Oracle;
use strict;
use Carp;

############################################################
#
# Package:	Oracle
# Description:	To support an Oracle  implementation of 
#		GUS, instantiate this class from 
#		DbiDatabase.pm.   Methods return sql
#		strings to query the system tables.
#
# Modified    By                 Description
# _________________________________________________________
#
# 3/22/2004   Jason Hackney      Created
#
############################################################

############################################################
# Constructor
############################################################
sub new{
	my ($class)=@_;
	my $self={};
	bless $self, $class;
	return $self;
}

############################################################
# dateFunction
#
# Return the function that is used by the database engine 
# to return the current date/timestamp.
############################################################
sub dateFunction{
	my($self)=@_;
	return "SYSDATE";
}

############################################################
# sequenceIdSql
#
# Query the system tables to get (schemaname, sequencename) 
# Return them in uppercase.
############################################################
sub sequenceIdSql{
	my($self)=@_;
	return "select sequence_owner,sequence_name from all_sequences";
}

############################################################
# tableChildRelationsSql
#
# Return a list of (foreignSchema,selfSchema,selfTable,
# selfColumn,foreignTable,foreignColumn) for all foreign key 
# constraints within a schema (i.e., $owner).
############################################################
sub tableChildRelationsSql{
	my($self,$owner)=@_;
	return "select acon.owner,acc1.owner,acc1.table_name,acc1.column_name ,
        acon.table_name ,acc2.column_name 
        from all_cons_columns acc1, all_constraints acon,all_cons_columns acc2
        where acon.r_constraint_name = acc1.constraint_name
        and acc1.owner = '$owner'
        and acon.r_owner = acc1.owner
        and acc2.constraint_name = acon.constraint_name
        and acc2.owner = acon.owner";
}

############################################################
# attributeSql
#
# Returns attributes (columnName, dataType, nullable
# ('Y' or 'N'), columnId, dataPrecision, dataLength, dataScale)
# about the columns from a given table in a schema
############################################################
sub attributeSql{
	my($self,$owner,$table)=@_;
	$table=~tr/a-z/A-Z/;	
	return "select column_name,data_type,nullable,column_id,
     data_precision,data_length,data_scale
     from all_tab_columns where table_name = '$table'
     and owner = '$owner'
     order by column_id";
}

############################################################
# viewSql
#
# returns the sql statement that was used to 
# create a view ($table) in a given schema
############################################################
sub viewSql{
	my($self,$owner,$table)=@_;
	$table=~tr/a-z/A-Z/;
	return "select text from all_views where owner = '$owner' and view_name = '$table'";
}

############################################################
# parentRelationsSql
#
# Returns (selfSchema,selfTable,sefColumn,parentSchema,
# parentTable,parentColumn) for a particular table in a 
# schema. The return values are all upper case.
############################################################
sub parentRelationsSql{
	my($self,$owner,$table)=@_;
	$table=~tr/a-z/A-Z/;
	return "select ac.owner,accs.table_name,accs.column_name,accr.owner,accr.table_name,accr.column_name
        from all_cons_columns accr, all_cons_columns accs, all_constraints ac 
        where accs.owner = '$owner'
        and ac.table_name = '$table'
        and ac.owner = '$owner'
        and ac.constraint_type = 'R'
        and accr.constraint_name = ac.r_constraint_name
        and ac.r_owner = accr.owner
        and accs.constraint_name = ac.constraint_name";
}

############################################################
# primaryKeySql
#
# Return the primary key for a table in a schema.
############################################################
sub primaryKeySql{
	my($self,$owner,$table)=@_;
	$table=~tr/a-z/A-Z/;
	return "select acc.column_name
        from all_cons_columns acc, all_constraints ac
        where acc.owner = '$owner'
        and ac.owner = '$owner'
        and ac.table_name = '$table'
        and ac.constraint_type = 'P'
        and acc.constraint_name = ac.constraint_name";
}	

############################################################
# nextValSelect
#
# Returns the sql select statement to generate the next value in a sequence.
############################################################
sub nextValSelect{
	my($self,$table)=@_;
	return "select ${table}_SQ.NEXTVAL from DUAL";
}

############################################################
# nextVal
#
# Returns the sql for the next value in a sequence,
# to be used directly in a statement, such as an insert.
############################################################
sub nextVal{
	my($self,$table)=@_;
	return "${table}_SQ.NEXTVAL";
}


############################################################
# dateFormatSql
#
# Tell the database engine in what format you will be 
# entering date/time information.
############################################################
sub dateFormatSql{
	my($self,$dateFormat)=@_;
	return "alter session set NLS_DATE_FORMAT='$dateFormat'";
}

1;
