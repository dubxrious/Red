-- Ultimate SQL test file for fixing apostrophe issues
-- Try running this file first to see which approach works in your Supabase environment

-- Version 1: The standard SQL approach of escaping apostrophes by doubling them
SELECT 'Line 322 (escaped): Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life.' as test_escaped;

-- Version 2: Complete removal of apostrophes
SELECT 'Line 322 (removed): Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. Youll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life.' as test_removed;

-- Another example - line 1235 with escaping
SELECT 'Line 1235 (escaped): Cruise along the Nile River, from Aswan to Luxor, on this 4-day experience. Glide by ancient riverbanks, with stops to visit sites such as the temples at Kom Ombo and Edfu, and Luxor''s celebrated temple complexes.' as test_escaped_2;

-- Line 1235 with removal
SELECT 'Line 1235 (removed): Cruise along the Nile River, from Aswan to Luxor, on this 4-day experience. Glide by ancient riverbanks, with stops to visit sites such as the temples at Kom Ombo and Edfu, and Luxors celebrated temple complexes.' as test_removed_2;

-- After running this test, use one of these SQL files based on which approach works:
-- 1. scripts/sql/manually-fixed-setup.sql - All apostrophes properly escaped with ''
-- 2. scripts/sql/apostrophes-removed-setup.sql - All apostrophes completely removed 