README for [INSERT displayName] Download Files:


General notes:

• Column headers for each data file contain the variable label used on the ClinEpiDB.org website. Column headers for each data file also contain the Internationalized Resource Identifier (IRI), shown in brackets. 
• Each variable on ClinEpiDB.org has been mapped to an ontology term via the IRI. This approach generates a unified semantic framework, where the same variables across different studies are mapped to the same ontology term. IRIs can be searched on ontobee.org. Note that while most ontology terms used in ClinEpiDB are from existing OBO Foundry ontologies, some are placeholder terms that are created as needed and may not be published yet. 
• ISASimple_[INSERT file name]_RSRC_ontologyMetadata.txt links variables to their original study labels so users can reference study data collection forms and data dictionaries to learn more about each variable. 
• Delimited text files are used to store data. Each line represents a single household, participant, observation, or sample. Each line has fields separated by a tab delimiter.




ISASimple_[INSERT file name]_RSRC_ontologyMetadata.txt, the ontology term association file includes the columns: 
• iri -- Internationalized Resource Identifier (IRI) assigned to variable (Example: "[INSERT IRI for a key variable]") 
• label -- Displayed as variable name on ClinEpiDB (Example: "[INSERT label for the key variable whose IRI appears above]") 
• type -- Whether data is formatted as number, string, or date. If empty, row belongs to parent term without data 
• parentLabel -- Term the variable falls directly under in the variable hierarchy tree on ClinEpiDB (Example: "[INSERT parentLabel for the key variable whose IRI appears above]") 
• category -- Highest level parent term (Household, Participant, Observation, Sample) variable falls under (Example: "[INSERT category for the key variable whose IRI appears above]") 
• definition -- Study specific description for variable that is displayed on ClinEpiDB under the label when variable is selected 
• min, max, upper_quartile, lower_quartile -- Provided for number and date variables 
• average -- Provided for number variables 
• number_distinct_values -- Count of all possible values for variable 
• distinct_values -- Pipe-delimited (|) list of all possible values for string variable 
• variable -- Column header, or variable name, from original data files. Comma-delimited (,) list if multiple variables from original data files were mapped to one ontology term (Example: "[INSERT variable for the key variable whose IRI appears above]") 
   ◦ Values are formatted as "data file::variable" (Example: "[INSERT dataFile::variable for the key variable whose IRI appears above]"; variable "[INSERT variable-only for the key variable whose IRI appears above]" came from data file "[INSERT dataFile-only for the key variable whose IRI appears above].[INSERT file extension for the dataFile]") 



Data Files:

• Key identifiers: 
  ◦ Household_Observation_Id: unique identifier given to every unique observation for every household 
  ◦ Household_Id: unique identifier given to every household 
  ◦ Community_Observatioon_Id: unique identifier given to every unique observation for every [community] 
  ◦ Community_Id: unique identifier given to every [community] 
  ◦ Participant_Id: unique identifier given to every participant 
  ◦ Observation_Id: unique identifier given to every unique observation for every participant 
  ◦ Sample_Id: unique identifier given to every sample
 

1. ISASimple_[INSERT file name]_RSRC_households.txt 
   • Key identifiers: [Household_Observation_Id, Household_Id] 
   • 1 row for [each day of observation for each household / each household]. 
   • [INSERT # of columns] variables (columns) & [INSERT # of rows] [household observations / households] (rows) 
	◦ [INSERT # of unique Household_Id] unique "Household_Id" 
	◦ [INSERT # of unique Household_Observation_Id] unique "Household_Observation_Id" 

2. ISASimple_[INSERT file name]_RSRC_participant.txt 
   • Key identifiers: [Participant_Id, Household_Id] 
   • 1 row for each participant 
   • [INSERT # of columns] variables (columns) & [INSERT # of rows] participants (rows) 
	◦ [INSERT # of unique Participant_Id] unique "Participant_Id" 

3. ISASimple_[INSERT file name]_RSRC_observations.txt 
   • Key identifiers: [Observation_Id, Participant_Id, Household_Id] 
   • 1 row for each day of observation for each participant 
   • [INSERT # of columns] variables (columns) & [INSERT # of rows] observations (rows) 
	◦ [INSERT # of unique Observation_Id] unique "Observation_Id" 

4. ISASimple_[INSERT file name]_RSRC_samples.txt 
   • Key identifiers: [Sample_Id, Observation_Id, Participant_Id, Household_Id] 
   • 1 row for each sample 
	◦ Note that multiple [INSERT type of sample (ie, blood, stool)] samples may have been collected from the same participant on any given observation day 
	◦ "Sample ID [OBI_0001616]" gives the sample IDs assigned to each sample by the study team 
   • [INSERT # of columns] variables (columns) & [INSERT # of rows] samples (rows) 
	◦ [INSERT # of unique Sample_Id] unique "Sample_Id" 

5. ISASimple_[INSERT file name]_RSRC_[INSERT file type for OTHER (ie, entomology…)].txt 
   • Key identifiers: [Sample_Id, Observation_Id, Participant_Id, Household_Id] 
   • 1 row for each [INSERT level of data collection (ie, light trap)] 
   • [INSERT # of columns] variables (columns) & [INSERT # of rows] rows 
	◦ [INSERT # of unique XXX] unique "XXX" 

6. ISASimple_[INSERT file name]_RSRC.txt 
   • Merges the files indicated below using [Household_Id, Household_Observation_Id, Participant_Id, Observation_Id, and Sample_Id]: 
	◦ ISASimple_[INSERT file name]_RSRC_households.txt 
	◦ ISASimple_[INSERT file name]_RSRC_participant.txt 
	◦ ISASimple_[INSERT file name]_RSRC_observations.txt 
	◦ ISASimple_[INSERT file name]_RSRC_samples.txt 
	◦ ISASimple_[INSERT file name]_RSRC_[INSERT file type for OTHER bulk download file].txt 
   • Key identifiers: [Household_Id, Household_Observation_Id, Participant_Id, Observation_Id, Sample_Id] 
   • [INSERT # of columns] variables (columns) & [INSERT # of rows] rows




Notes on opening download files:

• Note that large file sizes may cause Excel to crash. We recommended using R (https://www.r-project.org/, a free software environment for statistical computing) instead. To read large files into R, we recommend using the fread() function from the data.table package. For example: 
      install.packages("data.table")
      library(data.table)
      setwd("~/Downloads")
      d <- fread("ISASimple_Gates_WASHb_Bangladesh_rct_RSRC.txt")
      names(d) <-  gsub(" ", "_", gsub("\\[|\\]", "", names(d)))


• If you choose to use Excel: 
   ◦ For a primer on how to open tab delimited .txt files in Excel, see: https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba 
   ◦ When opening data files in Excel, date variables may read "00:00.0" for all values. This is not a data error, but will require reformatting the column using Excel’s ‘Text Import Wizard’ to obtain the actual data. See: https://support.office.com/en-us/article/text-import-wizard-c5b02af6-fda1-4440-899f-f78bafe41857#ID0EAAEAAA=Office_2010_-_Office_2016 
 
