import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ipcbokfqwnsbjlsvztip.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImMyNjZkZWJkLTBlY2QtNGNhNi05MDY0LTM4MzQ1NGZmNDE1OCJ9.eyJwcm9qZWN0SWQiOiJpcGNib2tmcXduc2JqbHN2enRpcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzkwNDI3NDI3LCJleHAiOjIxMDU3ODc0MjcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.o9KewQ7tlYReq2B4yQOPJ-Oxt_2YHYAb57fE0eQBdBE';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };