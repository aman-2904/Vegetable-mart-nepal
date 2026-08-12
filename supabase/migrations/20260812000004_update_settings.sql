-- Add new configuration columns to store_settings
alter table store_settings add column if not exists qr_code_url text;
alter table store_settings add column if not exists cod_enabled boolean default true;
alter table store_settings add column if not exists qr_enabled boolean default true;

-- Ensure an initial row exists so we can update it
insert into store_settings (store_name, currency) 
select 'My Fresh Store', 'INR' 
where not exists (select 1 from store_settings);
