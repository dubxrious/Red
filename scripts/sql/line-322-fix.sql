-- Manual fix for the most problematic line 322
-- Test this standalone to verify the fix

-- Original line for reference (DO NOT RUN THIS):
-- 'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You'll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board.',

-- Fixed version with apostrophes completely removed (use this):
SELECT 'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. Youll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board.' as fixed_line_322; 