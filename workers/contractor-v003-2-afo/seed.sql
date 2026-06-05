INSERT OR REPLACE INTO site_config (key,value,updated_at) VALUES
('company_name','CCS Services Group',datetime('now')),
('phone_display','(818) 624-7212',datetime('now')),
('phone_tel','18186247212',datetime('now')),
('hero_headline','Los Angeles Remodeling, ADUs & General Construction',datetime('now')),
('hero_subheadline','Kitchens, bathrooms, ADUs, additions, exterior work, and new construction from a local LA contractor.',datetime('now')),
('chat_opening_message','Hi — I can help with an estimate, callback request, or project question. What are you planning?',datetime('now')),
('admin_password','demo',datetime('now'));

INSERT OR IGNORE INTO notification_routes (