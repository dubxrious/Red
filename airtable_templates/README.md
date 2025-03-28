# Airtable Templates for Red Sea Tours

These CSV files are templates for creating the required tables in Airtable for the Red Sea Tours application. Follow the instructions below to import them into your Airtable base.

## Required Tables

The following tables are required for the Airtable-Supabase integration:

1. `tourz` - The main tours table (which you already have)
2. `Categories` - Categories for tours
3. `Destinations` - Destinations where tours take place
4. `Tags` - Tags for filtering tours
5. `Tour Features` - Features of each tour
6. `Tour Tags` - Junction table linking tours to tags

## Import Instructions

### 1. Create Tables in Airtable

For each required table:

1. Go to your Airtable base
2. Click "+" to add a new table
3. Name the table exactly as specified above
4. Click "Save"

### 2. Import CSV Data

For each CSV file:

1. Open the table in Airtable
2. Click on "..." (More) in the top-right of the table view
3. Select "Import data"
4. Choose "CSV file" and upload the corresponding CSV template
5. In the import dialog, ensure field mapping is correct
6. Click "Import"

### 3. Set Up Linked Records

After importing the data, you need to set up linked record fields:

1. For `Tour Features` table:
   - Convert the "Tour" column to a "Link to another record" field type
   - Link it to the `tourz` table

2. For `Tour Tags` table:
   - Convert the "Tour" column to a "Link to another record" field type, linked to `tourz`
   - Convert the "Tag" column to a "Link to another record" field type, linked to `Tags`

## Running the Sync

After setting up all tables, run the sync script to transfer data from Airtable to Supabase:

```bash
node scripts/sync-airtable-to-supabase.js sync
```

This will synchronize your Airtable data with the Supabase database.

## Important Notes

- Make sure the column names in Airtable match exactly with the names in these templates
- The first row of each CSV file contains the column headers
- For linked record fields, you'll need to manually establish the connections in Airtable after import
- Some tables have notes in their first data row explaining special requirements 