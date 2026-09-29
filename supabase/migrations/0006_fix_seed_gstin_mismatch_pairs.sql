-- CA Ledger — corrects 2 seeded GSTIN_MISMATCH pairs from 0005 whose two GSTINs were
-- accidentally identical (the generator picked the same vendor twice). With identical
-- GSTINs the live reconciliation engine would classify them MATCHED, contradicting the
-- seeded result. Giving the GSTR-2B side a different GSTIN makes the seed and the engine agree.

update transactions set vendor_gstin = '24GQIEL1354A1Z2' where id = '50000000-0000-0000-0000-0000000f5535' and vendor_gstin = '09GQIEL1354A1Z2';
update transactions set vendor_gstin = '24YOTXQ6872A1Z7' where id = '50000000-0000-0000-0000-0000000f5539' and vendor_gstin = '27YOTXQ6872A1Z7';
