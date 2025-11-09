-- Sample Medicine Data
-- Run this script to populate the medicines table with common medications

INSERT INTO medicines (name, unit, price, description) VALUES
  -- Pain Relief & Fever
  ('Paracetamol 500mg', 'Tablet', 2.50, 'Pain relief and fever reducer'),
  ('Ibuprofen 400mg', 'Tablet', 3.00, 'Anti-inflammatory and pain relief'),
  ('Aspirin 75mg', 'Tablet', 1.50, 'Blood thinner and pain relief'),
  ('Diclofenac 50mg', 'Tablet', 4.00, 'Anti-inflammatory medication'),
  
  -- Antibiotics
  ('Amoxicillin 500mg', 'Capsule', 8.00, 'Broad-spectrum antibiotic'),
  ('Azithromycin 500mg', 'Tablet', 15.00, 'Antibiotic for respiratory infections'),
  ('Ciprofloxacin 500mg', 'Tablet', 12.00, 'Antibiotic for bacterial infections'),
  ('Cephalexin 500mg', 'Capsule', 10.00, 'Antibiotic for skin and respiratory infections'),
  
  -- Gastrointestinal
  ('Omeprazole 20mg', 'Capsule', 5.00, 'Reduces stomach acid'),
  ('Ranitidine 150mg', 'Tablet', 3.50, 'Treats heartburn and acid reflux'),
  ('Metoclopramide 10mg', 'Tablet', 2.00, 'Anti-nausea medication'),
  ('Loperamide 2mg', 'Capsule', 4.00, 'Anti-diarrheal medication'),
  
  -- Cardiovascular
  ('Atenolol 50mg', 'Tablet', 6.00, 'Beta-blocker for blood pressure'),
  ('Amlodipine 5mg', 'Tablet', 7.00, 'Calcium channel blocker for hypertension'),
  ('Atorvastatin 20mg', 'Tablet', 12.00, 'Cholesterol-lowering medication'),
  ('Metoprolol 50mg', 'Tablet', 8.00, 'Beta-blocker for heart conditions'),
  
  -- Diabetes
  ('Metformin 500mg', 'Tablet', 5.00, 'Type 2 diabetes medication'),
  ('Glimepiride 2mg', 'Tablet', 8.00, 'Diabetes medication to control blood sugar'),
  ('Insulin Glargine 100IU', 'Injection', 450.00, 'Long-acting insulin'),
  
  -- Respiratory
  ('Salbutamol Inhaler', 'Inhaler', 120.00, 'Bronchodilator for asthma'),
  ('Cetirizine 10mg', 'Tablet', 2.00, 'Antihistamine for allergies'),
  ('Montelukast 10mg', 'Tablet', 15.00, 'Asthma and allergy medication'),
  ('Prednisolone 5mg', 'Tablet', 3.00, 'Corticosteroid for inflammation'),
  
  -- Vitamins & Supplements
  ('Vitamin D3 1000IU', 'Capsule', 8.00, 'Vitamin D supplement for bone health'),
  ('Vitamin B Complex', 'Tablet', 6.00, 'B vitamin supplement'),
  ('Calcium + Vitamin D', 'Tablet', 10.00, 'Bone health supplement'),
  ('Multivitamin', 'Tablet', 12.00, 'Daily multivitamin supplement'),
  
  -- Topical & External
  ('Betadine Solution 100ml', 'Bottle', 45.00, 'Antiseptic solution'),
  ('Hydrocortisone Cream 1%', 'Tube', 35.00, 'Anti-inflammatory cream'),
  ('Clotrimazole Cream', 'Tube', 40.00, 'Antifungal cream'),
  ('Mupirocin Ointment', 'Tube', 55.00, 'Antibiotic ointment'),
  
  -- Syrups & Liquids
  ('Cough Syrup 100ml', 'Bottle', 85.00, 'Cough suppressant syrup'),
  ('Paracetamol Syrup 60ml', 'Bottle', 65.00, 'Liquid pain relief for children'),
  ('Amoxicillin Suspension 100ml', 'Bottle', 95.00, 'Liquid antibiotic for children'),
  
  -- Other Common Medications
  ('Diazepam 5mg', 'Tablet', 4.00, 'Anxiety and muscle relaxant'),
  ('Tramadol 50mg', 'Capsule', 6.00, 'Pain relief medication'),
  ('Levothyroxine 100mcg', 'Tablet', 5.00, 'Thyroid hormone replacement'),
  ('Folic Acid 5mg', 'Tablet', 2.00, 'Vitamin B9 supplement'),
  ('Iron Tablets 200mg', 'Tablet', 4.00, 'Iron supplement for anemia'),
  ('Doxycycline 100mg', 'Capsule', 9.00, 'Antibiotic for various infections'),
  ('Losartan 50mg', 'Tablet', 11.00, 'Blood pressure medication'),
  ('Pantoprazole 40mg', 'Tablet', 6.00, 'Proton pump inhibitor for acid reflux'),
  ('Sertraline 50mg', 'Tablet', 18.00, 'Antidepressant medication'),
  ('Loratadine 10mg', 'Tablet', 3.00, 'Non-drowsy antihistamine'),
  ('Fluconazole 150mg', 'Capsule', 25.00, 'Antifungal medication'),
  ('Gabapentin 300mg', 'Capsule', 14.00, 'Nerve pain medication'),
  ('Warfarin 5mg', 'Tablet', 5.00, 'Blood thinner'),
  ('Allopurinol 100mg', 'Tablet', 4.00, 'Gout medication'),
  ('Bisoprolol 5mg', 'Tablet', 7.00, 'Beta-blocker for heart conditions')
ON CONFLICT DO NOTHING;
