README for [INSERT displayName] Download Files:


General notes:

• Column headers for each data file contain the variable label used on the ClinEpiDB.org website along with the Internationalized Resource Identifier (IRI) in brackets. 
• Each variable on ClinEpiDB.org has been mapped to an ontology term via the IRI. This approach generates a unified semantic framework, where the same variables across different studies are mapped to the same ontology term. IRIs can be searched on ontobee.org. Note that while most ontology terms used in ClinEpiDB are from existing OBO Foundry ontologies, some are placeholder terms that are created as needed and may not be published yet. 
• [INSERT file name]_ontologyMetadata.txt links variables to their original study labels so users can reference study data collection forms and data dictionaries to learn more about each variable. 
• Delimited text files are used to store data. Each line represents a single household, participant, participant repeated measure, etc.. Each line has fields separated by a tab delimiter.

• If a variable has multiple values for a given participant/participant repeated measure/etc., values will be in a quoted, comma-separated list.




[INSERT file name]_ontologyMetadata.txt, the ontology term association file includes the columns: 
• iri -- Internationalized Resource Identifier (IRI) assigned to variable (Example: "[INSERT IRI for a key variable]") 
• label -- Displayed as variable name on ClinEpiDB (Example: "[INSERT label for the key variable whose IRI appears above]") 
• type -- Whether data is formatted as number, string, or date. If empty, row belongs to parent term without data 
• parentLabel -- Term the variable falls directly under in the variable tree on ClinEpiDB (Example: "[INSERT parentLabel for the key variable whose IRI appears above]") 
• category -- Highest level parent term (Household, Participant, Participant repeated measure, etc.) variable falls under (Example: "[INSERT category for the key variable whose IRI appears above]") 
• definition -- Study specific description for variable that is displayed on ClinEpiDB under the label when variable is selected 
• min, max, average, median, upper_quartile, lower_quartile -- Provided for number and date variables 
• number_distinct_values -- Count of all possible values for variable 
• distinct_values -- Quoted, comma-separated list of all possible values for string variable 
• variable -- Column header, or variable name, from original data files. Comma-delimited (,) list if multiple variables from original data files were mapped to one ontology term (Example: "[INSERT variable for the key variable whose IRI appears above]") 
   ◦ Values are formatted as "data file::variable" (Example: "[INSERT dataFile::variable for the key variable whose IRI appears above]"; variable "[INSERT variable-only for the key variable whose IRI appears above]" came from data file "[INSERT dataFile-only for the key variable whose IRI appears above].[INSERT file extension for the dataFile]") 



Data Files:

• Key identifiers:

  ◦ [Community]_Id: unique identifier given to every [community]

  ◦ [Community]_repeated_measure_Id: unique identifier given to every unique observation for every [community]

  ◦ Household_Id: unique identifier given to every household
 
  ◦ Household_repeated_measure_Id: unique identifier given to every unique observation for every household  
  ◦ Participant_Id: unique identifier given to every participant 
  ◦ Participant_repeated_measure_Id: unique identifier given to every unique observation for every participant 
  ◦ Sample_Id: unique identifier given to every sample
 


1. [INSERT file name]_[Communities].txt 
   • Key identifiers: [Community_Id] 
   • 1 row for each [community]


2. [INSERT file name]_[Community]_repeated_measures.txt 
   • Key identifiers: [Community_repeated_measure_Id, Community_Id] 
   • 1 row for each observation for each [community]


3. [INSERT file name]_Households.txt 
   • Key identifiers: [Household_Id, Community_Id] 
   • 1 row for each household


4. [INSERT file name]_Household_repeated_measures.txt 
   • Key identifiers: [Household_repeated_measures_Id, Household_Id, Community_Id] 
   • 1 row for each observation for each household


5. [INSERT file name]_Participants.txt 
   • Key identifiers: [Participant_Id, Household_Id, Community_Id] 
   • 1 row for each participant 

6. [INSERT file name]_Participant_repeated_measures.txt 
   • Key identifiers: [Participant_repeated_measures_Id, Participant_Id, Household_Id, Community_Id] 
   • 1 row for each observation for each participant 

7. [INSERT file name]_Samples.txt 
   • Key identifiers: [Sample_Id, Participant_repeated_measures_Id, Participant_Id, Household_Id, Community_Id] 
   • 1 row for each sample 
	◦ Note that multiple [INSERT type of sample (ie, blood, stool)] samples may have been collected from the same participant on any given observation day 
	◦ "Sample ID [OBI_0001616]" gives the sample IDs assigned to each sample by the study team 

8. [INSERT file name]_RSRC.txt 
   • Merges the files indicated below using [Community_Id, Community_repeated_measures_Id, Household_Id, Household_repeated_measures_Id, Participant_Id, Participant_repeated_measures_Id, and Sample_Id]: 
	◦ [INSERT file name]_[Communities].txt 
	◦ [INSERT file name]_[Community]_repeated_measures.txt 
	◦ [INSERT file name]_Households.txt 
	◦ [INSERT file name]_Household_repeated_measures.txt 
	◦ [INSERT file name]_Participant.txt 
	◦ [INSERT file name]_Participant_repeated_measures.txt 
	◦ [INSERT file name]_Samples.txt 
   • Key identifiers: [Community_Id, Community_repeated_measures_Id, Household_Id, Household_repeated_measures_Id, Participant_Id, Participant_repeated_measures_Id, Sample_Id]




Notes on opening download files:

• Note that large file sizes may cause Excel to crash. We recommended using R (https://www.r-project.org/, a free software environment for statistical computing) instead. To read large files into R, we recommend using the fread() function from the data.table package. For example: 
      install.packages("data.table")
      library(data.table)
      setwd("~/Downloads")
      d <- fread("WASHb_Bangladesh_rct.txt")
      names(d) <-  gsub(" ", "_", gsub("\\[|\\]", "", names(d)))


• If you choose to use Excel: 
   ◦ For a primer on how to open tab delimited .txt files in Excel, see: https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba 
   ◦ When opening data files in Excel, date variables may read "00:00.0" for all values. This is not a data error, but will require reformatting the column using Excel’s ‘Text Import Wizard’ to obtain the actual data. See: https://support.office.com/en-us/article/text-import-wizard-c5b02af6-fda1-4440-899f-f78bafe41857#ID0EAAEAAA=Office_2010_-_Office_2016 
 
