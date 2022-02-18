README for MAL-ED 0-60m (phase 3) Download Files:


General notes:

• Column headers for each data file contain the variable label used on the ClinEpiDB.org website along with the Internationalized Resource Identifier (IRI) in brackets. 
• Each variable on ClinEpiDB.org has been mapped to an ontology term via the IRI. This approach generates a unified semantic framework, where the same variables across different studies are mapped to the same ontology term. IRIs can be searched on ontobee.org. Note that while most ontology terms used in ClinEpiDB are from existing OBO Foundry ontologies, some are placeholder terms that are created as needed and may not be published yet. 
• MAL-ED_phase3_ontologyMetadata.txt links variables to their original study labels so users can reference study data collection forms and data dictionaries to learn more about each variable. 
• Delimited text files are used to store data. Each line represents a single household, participant, participant repeated measure, etc. Each line has fields separated by a tab delimiter. 
• If a variable has multiple values for a given participant/participant repeated measure/etc., values will be in a quoted, comma-separated list.



• Note that large file sizes may cause Excel to crash. We recommended using R (https://www.r-project.org/, a free software environment for statistical computing) instead. To read large files into R, we recommend using the fread( ) function from the data.table package. For example: 
	install.packages("data.table")
	library(data.table)
	setwd("~/Downloads")
	d <- fread("MAL-ED_phase3.txt") 
• If you choose to use Excel: 
   ◦ For a primer on how to open tab delimited .txt files in Excel, see: https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba 
   ◦ When opening data files in Excel, date variables may read "00:00.0" for all values. This is not a data error, but will require reformatting the column using Excel’s ‘Text Import Wizard’ to obtain the actual data. See: https://support.office.com/en-us/article/text-import-wizard-c5b02af6-fda1-4440-899f-f78bafe41857#ID0EAAEAAA=Office_2010_-_Office_2016 





MAL-ED_phase3_ontologyMetadata.txt, the ontology term association file includes the columns: 
• iri -- Internationalized Resource Identifier (IRI) assigned to variable (Example: "EUPATH_0000665") 
• label -- Displayed as variable name on ClinEpiDB (Example: "Study-defined diarrhea") 
• type -- Whether data is formatted as number, string, or date. If empty, row belongs to parent term without data 
• parentLabel -- Term the variable falls directly under in the variable tree on ClinEpiDB (Example: "Diarrheal episodes") 
• category -- Highest level parent term (Household, Participant, Participant repeated measure, etc.) variable falls under (Example: "Participant repeated measure") 
• definition -- Study specific description for variable that is displayed on ClinEpiDB under the label when variable is selected 
• min, max, average, median, upper_quartile, lower_quartile -- Provided for number and date variables 
• number_distinct_values -- Count of all possible values for variable 
• distinct_values -- Quoted, comma-delimited list of all possible values for string variable 
• variable -- Column header, or variable name, from original data files. Quoted, comma-delimited list if multiple variables from original data files were mapped to one ontology term

   ◦ Values are formatted as "data file::variable" (Example: "illnessfull::diar"; variable "diar" came from data file "illness full.csv") 



Data Files:

• Key identifiers: 
  ◦ Household_Id: unique identifier given to every household (For MAL-ED, there was only one participant enrolled per household) 
  ◦ Household_repeated_measure_Id: unique identifier given to every unique observation for every household 
  ◦ Participant_Id: unique identifier given to every participant 
  ◦ Participant_repeated_measure_Id: unique identifier given to every unique observation for every participant 
  ◦ Sample_Id: unique identifier given to every sample 

1. MAL-ED_phase3_Households.txt 
   • Key identifiers: Household_Id 
   • 1 row for each household 

2. MAL-ED_phase3_Household_repeated_measures.txt 
   • Key identifiers: Household__repeated_measure_Id, Household_Id 
   • 1 row for each day of observation for each household 

3. MAL-ED_phase3_Participants.txt 
   • Key identifiers: Participant_Id, Household_Id 
   • 1 row for each participant 

4. MAL-ED_phase3_Participant_repeated_measures.txt 
   • Key identifiers: Participant_repeated_measure_Id, Participant_Id, Household_Id 
   • 1 row for each day of observation for each participant 

5. MAL-ED_phase3_Samples.txt 
   • Key identifiers: Sample_Id, Participant_repeated_measure_Id, Participant_Id, Household_Id 
   • 1 row for each sample 
	◦ Note that multiple stool, blood, and/or urine samples may have been collected from the same participant on any given observation day 
	◦ "Sample ID [OBI_0001616]" gives the sample IDs assigned to each sample by the study team 

6. MAL-ED_phase3.txt 
   • Merges the files indicated below using key indicators: Household_Id, Household_repeated_measure_Id, Participant_Id, Participant_repeated_measure_Id, and Sample_Id 
	◦ MAL-ED_phase3_Households.txt 
	◦ MAL-ED_phase3_Household_repeated_measures.txt 
	◦ MAL-ED_phase3_Participants.txt 
	◦ MAL-ED_phase3_Participant_repeated_measures.txt 
	◦ MAL-ED_phase3_Samples.txt 
