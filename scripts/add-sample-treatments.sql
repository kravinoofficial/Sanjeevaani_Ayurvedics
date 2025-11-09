-- Add sample physical treatments
-- Run this in Supabase SQL Editor after creating the physical_treatments table

INSERT INTO physical_treatments (name, description, duration_unit, price) VALUES
('Physiotherapy', 'Physical therapy to improve movement and reduce pain', 'sessions', 50.00),
('Massage Therapy', 'Therapeutic massage for muscle relaxation', 'sessions', 40.00),
('Heat Therapy', 'Application of heat to affected areas', 'sessions', 25.00),
('Cold Therapy', 'Application of cold to reduce inflammation', 'sessions', 25.00),
('Ultrasound Therapy', 'Use of sound waves for deep tissue treatment', 'sessions', 60.00),
('Electrical Stimulation', 'TENS or EMS therapy for pain relief', 'sessions', 45.00),
('Exercise Therapy', 'Prescribed exercises for rehabilitation', 'weeks', 35.00),
('Manual Therapy', 'Hands-on techniques for joint and soft tissue', 'sessions', 55.00),
('Hydrotherapy', 'Water-based physical therapy', 'sessions', 70.00),
('Traction Therapy', 'Mechanical traction for spine treatment', 'sessions', 65.00);
