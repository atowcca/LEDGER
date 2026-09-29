-- CA Ledger — makes the hand-written demo rows from 0003 agree with the live reconciliation engine.
-- A simulation of the engine over the seeded data found 3 rows whose seeded label the engine would
-- contradict on a re-run of 'Run reconciliation':
--   INV-341  (ABC, EX-1044) labelled GSTIN mismatch but both sides had the same GSTIN
--   INV-77   (XYZ, EX-3005) same problem
--   INV-8821 (ABC, EX-1045) labelled DUPLICATE but only ONE purchase row existed for that invoice
-- After this migration the engine reproduces every seeded label, and ABC still totals exactly
-- 2,500 entries / 2,327 matched / 61 / 74 / 23 / 15 = 173 exceptions.

update transactions set vendor_gstin = '27AAKEL2233Q1Z1' where id = '50000000-0000-0000-0000-000000000005' and vendor_gstin = '07AAKEL2233Q1Z1';
update transactions set vendor_gstin = '27AAMPK8899A1Z1' where id = '50000000-0000-0000-0000-000000000010' and vendor_gstin = '29AAMPK8899A1Z1';
insert into transactions (id, firm_id, client_id, source, vendor_name, vendor_gstin, invoice_number, invoice_date, taxable_value, cgst, sgst, igst, total_amount) values
  ('4fffffff-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'PURCHASE_REGISTER', 'Nandi Chemicals', '27AANCH4455R1Z8', 'INV-8821', '2026-08-10', 189000, 0, 0, 0, 189000);
insert into reconciliation_results (id, firm_id, reconciliation_id, transaction_id, matched_transaction_id, result_type, difference_amount, explanation) values
  ('7fffffff-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '4fffffff-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000007', 'MATCHED', 0, 'Vendor GSTIN, invoice number, date, and amount all match.');
-- remove one unduplicated MATCHED pair (PR-102326) to keep ABC at exactly 2,500 purchase entries / 2,327 matched
delete from reconciliation_results where transaction_id = '50000000-0000-0000-0000-0000000f546d';
delete from transactions where id in ('50000000-0000-0000-0000-0000000f546d', '50000000-0000-0000-0000-0000000f546e');
