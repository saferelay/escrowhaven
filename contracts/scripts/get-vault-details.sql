-- Run this query in Supabase SQL editor
SELECT 
  vault_address,
  client_wallet_address,
  freelancer_wallet_address,
  splitter_address,
  amount_cents
FROM escrows
WHERE vault_address IN (
  '0x30BBe04680916979BB981FE950BeeB609e0346a7',
  '0xbF87e3B23373b11A0700256Fb63f8aDE91327647'
);
