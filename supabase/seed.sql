insert into public.report_types (code, label, description)
values
  ('report', 'Report', 'Standard civic issue or field report from a citizen.'),
  ('complaint', 'Complaint', 'Formal service-delivery complaint that requires accountability follow-up.'),
  ('suggestion', 'Suggestion', 'Improvement idea, recommendation, or community suggestion.')
on conflict (code) do update
  set label = excluded.label,
      description = excluded.description;

insert into public.categories (slug, name, description, icon_key, sort_order)
values
  ('road', 'Road', 'Road damage, potholes, failed shoulders, and access problems.', 'construction', 10),
  ('drainage', 'Drainage', 'Blocked drains, collapsed culverts, and flood channels.', 'waves', 20),
  ('water', 'Water', 'Water outages, leakages, and broken supply infrastructure.', 'droplets', 30),
  ('electricity', 'Electricity', 'Power outages, transformers, and public lighting faults.', 'zap', 40),
  ('sanitation', 'Sanitation', 'Waste build-up, refuse overflow, and hygiene risks.', 'trash-2', 50),
  ('health', 'Health', 'Primary healthcare, ambulance, or urgent health-service failures.', 'heart-pulse', 60),
  ('security', 'Security', 'Safety threats, insecurity, and urgent public-risk incidents.', 'shield-alert', 70),
  ('education', 'Education', 'School facilities, absenteeism, and education-service issues.', 'graduation-cap', 80),
  ('environment', 'Environment', 'Pollution, smoke, erosion, and environmental damage.', 'trees', 90),
  ('public-facility', 'Public Facility', 'Markets, toilets, bus parks, government buildings, and civic assets.', 'landmark', 100),
  ('other', 'Other', 'Any issue that does not fit the main categories.', 'circle-ellipsis', 110)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      icon_key = excluded.icon_key,
      sort_order = excluded.sort_order;

insert into public.lgas (slug, name, headquarters)
values
  ('ado-ekiti', 'Ado Ekiti', 'Ado-Ekiti'),
  ('efon', 'Efon', 'Efon-Alaaye'),
  ('ekiti-east', 'Ekiti East', 'Omuo-Ekiti'),
  ('ekiti-south-west', 'Ekiti South West', 'Ilawe-Ekiti'),
  ('ekiti-west', 'Ekiti West', 'Aramoko-Ekiti'),
  ('emure', 'Emure', 'Emure-Ekiti'),
  ('gbonyin', 'Gbonyin', 'Ode-Ekiti'),
  ('ido-osi', 'Ido / Osi', 'Ido-Ekiti'),
  ('ijero', 'Ijero', 'Ijero-Ekiti'),
  ('ikere', 'Ikere', 'Ikere-Ekiti'),
  ('ikole', 'Ikole', 'Ikole-Ekiti'),
  ('ilejemeje', 'Ilejemeje', 'Iye-Ekiti'),
  ('irepodun-ifelodun', 'Irepodun / Ifelodun', 'Igede-Ekiti'),
  ('ise-orun', 'Ise / Orun', 'Ise-Ekiti'),
  ('moba', 'Moba', 'Otun-Ekiti'),
  ('oye', 'Oye', 'Oye-Ekiti')
on conflict (slug) do update
  set name = excluded.name,
      headquarters = excluded.headquarters;

with ward_seed (lga_slug, ward_name) as (
  values
    ('ado-ekiti', 'ADO ''A'' IDOFIN'),
    ('ado-ekiti', 'ADO ''B'' INISA'),
    ('ado-ekiti', 'ADO ''C'' IDOLOFIN'),
    ('ado-ekiti', 'ADO ''D'' IJIGBO'),
    ('ado-ekiti', 'ADO ''E'' IJOKA / OREREOWU'),
    ('ado-ekiti', 'ADO ''F'' OKEYINMI'),
    ('ado-ekiti', 'ADO ''G'' OKE ILA'),
    ('ado-ekiti', 'ADO ''H'' EREGURU'),
    ('ado-ekiti', 'ADO ''I'' DALLIMORE'),
    ('ado-ekiti', 'ADO ''J'' OKESA'),
    ('ado-ekiti', 'ADO ''K'' IRONA'),
    ('ado-ekiti', 'ADO ''L'' IGBEHIN'),
    ('ado-ekiti', 'ADO ''M'' FARM SETTLEMENT'),
    ('efon', 'EFON I'),
    ('efon', 'EFON II'),
    ('efon', 'EFON III'),
    ('ekiti-east', 'OMUO - OKE I'),
    ('ekiti-east', 'OMUO OKE II'),
    ('ekiti-east', 'ARAROMI'),
    ('ekiti-east', 'KOTA I'),
    ('ekiti-east', 'KOTA II'),
    ('ekiti-south-west', 'ILAWE I'),
    ('ekiti-south-west', 'ILAWE II'),
    ('ekiti-south-west', 'IGBARA ODO I'),
    ('ekiti-south-west', 'OGOTUN I'),
    ('ekiti-west', 'ARAMOKO I'),
    ('ekiti-west', 'ARAMOKO II'),
    ('ekiti-west', 'IKOGOSI'),
    ('ekiti-west', 'OKEMESI I'),
    ('emure', 'ODO - EMURE I'),
    ('emure', 'ODO - EMURE II'),
    ('emure', 'OKE EMURE I'),
    ('gbonyin', 'EGBE / IRO'),
    ('gbonyin', 'ODE I'),
    ('gbonyin', 'IMESI'),
    ('ido-osi', 'IDO I'),
    ('ido-osi', 'IFAKI I'),
    ('ido-osi', 'USI'),
    ('ido-osi', 'OSI'),
    ('ijero', 'IJERO WARD "A"'),
    ('ijero', 'IJERO WARD "B"'),
    ('ijero', 'IPOTI WARD ''A'''),
    ('ikere', 'ATIBA/AAFIN'),
    ('ikere', 'OKERUKU'),
    ('ikere', 'UGELE / AROKU'),
    ('ikere', 'OGBONJANA'),
    ('ikole', 'IKOLE WEST I'),
    ('ikole', 'IKOLE EAST'),
    ('ikole', 'ODO AYEDUN I'),
    ('ilejemeje', 'EWU'),
    ('ilejemeje', 'IYE I'),
    ('ilejemeje', 'IPERE'),
    ('irepodun-ifelodun', 'AFAO'),
    ('irepodun-ifelodun', 'IGEDE I'),
    ('irepodun-ifelodun', 'IWOROKO'),
    ('ise-orun', 'ODO ISE I'),
    ('ise-orun', 'ERINWA I'),
    ('ise-orun', 'ORUN I'),
    ('moba', 'OTUN I'),
    ('moba', 'IGOGO I'),
    ('moba', 'OSUN'),
    ('oye', 'ITAPA / OSIN'),
    ('oye', 'OYE I'),
    ('oye', 'AYEDE NORTH'),
    ('oye', 'ISAN / ILAFON / ILEMESO')
)
insert into public.wards (lga_id, slug, name)
select
  l.id,
  concat(
    l.slug,
    '-',
    lower(regexp_replace(regexp_replace(ws.ward_name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
  ),
  ws.ward_name
from ward_seed ws
join public.lgas l on l.slug = ws.lga_slug
on conflict (slug) do update
  set name = excluded.name;

insert into public.offices (
  slug,
  name,
  office_type,
  description,
  email,
  phone,
  is_default_queue
)
values
  (
    'works-ado',
    'Ado Works Department Queue',
    'department',
    'Road rehabilitation, drainage repairs, and right-of-way issues in Ado-Ekiti.',
    'works.ado@ekisignal.demo',
    '+2348000001001',
    false
  ),
  (
    'water-ikere',
    'Ikere Water Board Queue',
    'agency',
    'Water supply failures, leakages, and burst lines in Ikere and nearby communities.',
    'water.ikere@ekisignal.demo',
    '+2348000001002',
    false
  ),
  (
    'environment-state',
    'Environmental Health Response Desk',
    'department',
    'Sanitation, waste, erosion, and environmental health issues across Ekiti.',
    'environment@ekisignal.demo',
    '+2348000001003',
    false
  ),
  (
    'power-state',
    'State Power Response Desk',
    'agency',
    'Outages, transformer issues, and public-lighting faults.',
    'power@ekisignal.demo',
    '+2348000001004',
    false
  ),
  (
    'health-state',
    'Emergency Health Desk',
    'department',
    'Primary health centre complaints and urgent health-service failures.',
    'health@ekisignal.demo',
    '+2348000001005',
    false
  ),
  (
    'security-state',
    'Public Safety Coordination Centre',
    'agency',
    'Security reports and coordinated public-safety incidents.',
    'security@ekisignal.demo',
    '+2348000001006',
    false
  ),
  (
    'education-state',
    'Education Monitoring Desk',
    'ministry',
    'School condition reports and education-service feedback.',
    'education@ekisignal.demo',
    '+2348000001007',
    false
  ),
  (
    'facilities-state',
    'Public Facility Maintenance Unit',
    'department',
    'Markets, bus parks, public toilets, and civic asset maintenance.',
    'facilities@ekisignal.demo',
    '+2348000001008',
    false
  ),
  (
    'integrity-state',
    'Integrity and Moderation Queue',
    'moderation',
    'Sensitive complaints, whistleblowing, and abuse-review queue.',
    'integrity@ekisignal.demo',
    '+2348000001009',
    false
  ),
  (
    'citizen-default',
    'Citizen Relations Default Queue',
    'default_queue',
    'Fallback moderation and triage queue for unmatched reports and routing exceptions.',
    'citizen.relations@ekisignal.demo',
    '+2348000001010',
    true
  )
on conflict (slug) do update
  set name = excluded.name,
      office_type = excluded.office_type,
      description = excluded.description,
      email = excluded.email,
      phone = excluded.phone,
      is_default_queue = excluded.is_default_queue;

with office_refs as (
  select id, slug
  from public.offices
)
insert into public.handlers (
  office_id,
  full_name,
  email,
  phone,
  title,
  escalation_level,
  is_primary
)
select
  office_refs.id,
  seed.full_name,
  seed.email,
  seed.phone,
  seed.title,
  seed.escalation_level,
  seed.is_primary
from (
  values
    ('works-ado', 'Engr. Tunde Omotosho', 'tunde.omotosho@ekisignal.demo', '+2348001001001', 'Works Supervisor', 2, true),
    ('water-ikere', 'Engr. Damilola Arogundade', 'damilola.arogundade@ekisignal.demo', '+2348001001002', 'Regional Water Engineer', 2, true),
    ('environment-state', 'Mrs. Modupe Bamidele', 'modupe.bamidele@ekisignal.demo', '+2348001001003', 'Environmental Health Lead', 2, true),
    ('education-state', 'Mr. Olufemi Akinwale', 'olufemi.akinwale@ekisignal.demo', '+2348001001004', 'Education Monitoring Lead', 1, true),
    ('citizen-default', 'Aisha Adeyemi', 'aisha.adeyemi@ekisignal.demo', '+2348001001005', 'Triage Moderator', 3, true)
) as seed(slug, full_name, email, phone, title, escalation_level, is_primary)
join office_refs on office_refs.slug = seed.slug
on conflict (email) do update
  set full_name = excluded.full_name,
      phone = excluded.phone,
      title = excluded.title,
      escalation_level = excluded.escalation_level,
      is_primary = excluded.is_primary;

with refs as (
  select
    (select id from public.categories where slug = 'road') as road_category_id,
    (select id from public.categories where slug = 'drainage') as drainage_category_id,
    (select id from public.categories where slug = 'water') as water_category_id,
    (select id from public.categories where slug = 'sanitation') as sanitation_category_id,
    (select id from public.categories where slug = 'education') as education_category_id,
    (select id from public.categories where slug = 'other') as other_category_id,
    (select id from public.offices where slug = 'works-ado') as works_ado_office_id,
    (select id from public.offices where slug = 'water-ikere') as water_ikere_office_id,
    (select id from public.offices where slug = 'environment-state') as environment_state_office_id,
    (select id from public.offices where slug = 'education-state') as education_state_office_id,
    (select id from public.offices where slug = 'citizen-default') as citizen_default_office_id,
    (select id from public.lgas where slug = 'ado-ekiti') as ado_lga_id,
    (select id from public.lgas where slug = 'ikere') as ikere_lga_id
)
insert into public.routing_rules (
  code,
  name,
  category_id,
  lga_id,
  office_id,
  priority,
  is_fallback,
  notes
)
select * from (
  select
    'ado-road'::text,
    'Road issues in Ado-Ekiti route to the works queue'::text,
    refs.road_category_id,
    refs.ado_lga_id,
    refs.works_ado_office_id,
    100,
    false,
    'High-confidence routing rule for road failures in Ado-Ekiti.'
  from refs
  union all
  select
    'ado-drainage',
    'Drainage issues in Ado-Ekiti route to the works queue',
    refs.drainage_category_id,
    refs.ado_lga_id,
    refs.works_ado_office_id,
    95,
    false,
    'Works queue covers drainage repairs in Ado-Ekiti.'
  from refs
  union all
  select
    'ikere-water',
    'Water issues in Ikere route to the Ikere water board queue',
    refs.water_category_id,
    refs.ikere_lga_id,
    refs.water_ikere_office_id,
    100,
    false,
    'Water issues in Ikere go directly to the local water board queue.'
  from refs
  union all
  select
    'sanitation-state',
    'Sanitation issues route to the environmental desk',
    refs.sanitation_category_id,
    null,
    refs.environment_state_office_id,
    70,
    false,
    'Statewide sanitation issues are routed to environmental health.'
  from refs
  union all
  select
    'education-state',
    'Education issues route to the education monitoring desk',
    refs.education_category_id,
    null,
    refs.education_state_office_id,
    70,
    false,
    'Statewide education routing.'
  from refs
  union all
  select
    'fallback-default',
    'Fallback moderation queue for unmatched reports',
    null,
    null,
    refs.citizen_default_office_id,
    0,
    true,
    'Fallback queue used when no specific category or location rule matches.'
  from refs
) seeded(code, name, category_id, lga_id, office_id, priority, is_fallback, notes)
on conflict (code) do update
  set name = excluded.name,
      category_id = excluded.category_id,
      lga_id = excluded.lga_id,
      office_id = excluded.office_id,
      priority = excluded.priority,
      is_fallback = excluded.is_fallback,
      notes = excluded.notes;

with
  report_type as (
    select id from public.report_types where code = 'report'
  ),
  category as (
    select id from public.categories where slug = 'road'
  ),
  lga as (
    select id, name from public.lgas where slug = 'ado-ekiti'
  ),
  ward as (
    select id, name from public.wards where slug = 'ado-ekiti-ado-f-okeyinmi'
  ),
  office as (
    select id, name from public.offices where slug = 'works-ado'
  ),
  location_row as (
    insert into public.locations (
      state_name,
      lga_id,
      ward_id,
      community,
      area,
      street_address,
      landmark,
      latitude,
      longitude
    )
    select
      'Ekiti State',
      lga.id,
      ward.id,
      'Ado-Ekiti',
      'Fajuyi corridor',
      'Ado-Iworoko Road',
      'Near Fajuyi Memorial Park',
      7.6218,
      5.2203
    from lga, ward
    returning id
  ),
  report_row as (
    insert into public.reports (
      tracking_number,
      report_type_id,
      category_id,
      location_id,
      assigned_office_id,
      current_status,
      severity,
      title,
      description,
      contact_name,
      contact_phone,
      contact_email,
      estimated_response_text,
      source_channel
    )
    select
      'EKI-20260328-A1D3Q9',
      report_type.id,
      category.id,
      location_row.id,
      office.id,
      'Assigned',
      'urgent',
      'Deep potholes around Fajuyi axis after rainfall',
      'Residents are swerving into oncoming traffic to avoid a damaged stretch near the market corridor.',
      'Bisi Adebayo',
      '08030001122',
      'bisi@example.com',
      'Estimated first review in 12 hours',
      'mobile-web'
    from report_type, category, location_row, office
    returning id, assigned_office_id
  ),
  assignment_row as (
    insert into public.assignments (
      report_id,
      office_id,
      assignment_mode,
      note
    )
    select
      report_row.id,
      report_row.assigned_office_id,
      'routing',
      'Auto-routed based on Road + Ado Ekiti rule.'
    from report_row
    returning id, report_id
  )
update public.reports r
set current_assignment_id = assignment_row.id
from assignment_row
where r.id = assignment_row.report_id;

insert into public.report_updates (
  report_id,
  status,
  title,
  note,
  visibility,
  actor_name_snapshot,
  actor_role_snapshot,
  created_at
)
select
  r.id,
  seeded.status,
  seeded.title,
  seeded.note,
  seeded.visibility::public.update_visibility,
  seeded.actor_name,
  seeded.actor_role,
  seeded.created_at
from public.reports r
join (
  values
    (
      'EKI-20260328-A1D3Q9',
      'Received',
      'Report received',
      'Your report was logged and assigned a tracking number.',
      'public',
      'EkiSignal Intake',
      'Citizen platform',
      '2026-03-28T07:20:00.000Z'::timestamptz
    ),
    (
      'EKI-20260328-A1D3Q9',
      'Assigned',
      'Assigned to office',
      'Ado Works Department Queue accepted the ticket for operational review.',
      'public',
      'Routing Engine',
      'Automation',
      '2026-03-28T07:32:00.000Z'::timestamptz
    )
) as seeded(
  tracking_number,
  status,
  title,
  note,
  visibility,
  actor_name,
  actor_role,
  created_at
) on r.tracking_number = seeded.tracking_number;

insert into public.report_media (
  report_id,
  storage_path,
  media_kind,
  file_name,
  mime_type,
  file_size_bytes
)
select
  r.id,
  'demo/road-fajuyi.jpg',
  'image',
  'road-fajuyi.jpg',
  'image/jpeg',
  1200000
from public.reports r
where r.tracking_number = 'EKI-20260328-A1D3Q9';

insert into public.notifications (
  report_id,
  recipient_office_id,
  kind,
  channel,
  title,
  body,
  recipient_email
)
select
  r.id,
  o.id,
  'assignment',
  'email',
  'New routed report: EKI-20260328-A1D3Q9',
  'A new Road report from Ado Ekiti was routed to the Ado Works Department Queue.',
  o.email
from public.reports r
join public.offices o on o.slug = 'works-ado'
where r.tracking_number = 'EKI-20260328-A1D3Q9';

insert into public.audit_logs (
  report_id,
  entity_type,
  entity_id,
  action,
  actor_role_snapshot,
  payload
)
select
  r.id,
  'report',
  r.id,
  'report_submitted',
  'Citizen platform',
  jsonb_build_object('trackingNumber', r.tracking_number, 'status', r.current_status)
from public.reports r
where r.tracking_number = 'EKI-20260328-A1D3Q9';

with
  report_type as (
    select id from public.report_types where code = 'complaint'
  ),
  category as (
    select id from public.categories where slug = 'water'
  ),
  lga as (
    select id from public.lgas where slug = 'ikere'
  ),
  ward as (
    select id from public.wards where slug = 'ikere-okeruku'
  ),
  office as (
    select id from public.offices where slug = 'water-ikere'
  ),
  location_row as (
    insert into public.locations (
      state_name,
      lga_id,
      ward_id,
      community,
      area,
      street_address,
      landmark,
      latitude,
      longitude
    )
    select
      'Ekiti State',
      lga.id,
      ward.id,
      'Ikere-Ekiti',
      'Okeruku junction',
      'Local service road',
      'Near St. Louis Primary School',
      7.4971,
      5.2304
    from lga, ward
    returning id
  ),
  report_row as (
    insert into public.reports (
      tracking_number,
      report_type_id,
      category_id,
      location_id,
      assigned_office_id,
      current_status,
      severity,
      title,
      description,
      contact_name,
      contact_phone,
      is_anonymous,
      estimated_response_text,
      source_channel
    )
    select
      'EKI-20260327-W8K2L4',
      report_type.id,
      category.id,
      location_row.id,
      office.id,
      'In Progress',
      'critical',
      'Burst pipe leaving Ikere lane flooded',
      'Water has been running continuously since yesterday and households on the stretch have no controlled supply.',
      'Aanu Kolawole',
      '08140010022',
      false,
      'Estimated first review in 2 hours',
      'mobile-web'
    from report_type, category, location_row, office
    returning id, assigned_office_id
  ),
  assignment_row as (
    insert into public.assignments (
      report_id,
      office_id,
      assignment_mode,
      escalated,
      note
    )
    select
      report_row.id,
      report_row.assigned_office_id,
      'routing',
      true,
      'Auto-routed to Ikere Water Board Queue and escalated for field action.'
    from report_row
    returning id, report_id
  )
update public.reports r
set current_assignment_id = assignment_row.id
from assignment_row
where r.id = assignment_row.report_id;

insert into public.report_updates (
  report_id,
  status,
  title,
  note,
  visibility,
  actor_name_snapshot,
  actor_role_snapshot,
  created_at,
  metadata
)
select
  r.id,
  seeded.status,
  seeded.title,
  seeded.note,
  seeded.visibility::public.update_visibility,
  seeded.actor_name,
  seeded.actor_role,
  seeded.created_at,
  seeded.metadata
from public.reports r
join (
  values
    (
      'EKI-20260327-W8K2L4',
      'Received',
      'Report received',
      'Submission logged and routed for urgent review.',
      'public',
      'EkiSignal Intake',
      'Citizen platform',
      '2026-03-27T13:40:00.000Z'::timestamptz,
      '{}'::jsonb
    ),
    (
      'EKI-20260327-W8K2L4',
      'Assigned',
      'Assigned to office',
      'Ikere Water Board Queue accepted the ticket for field action.',
      'public',
      'Routing Engine',
      'Automation',
      '2026-03-27T15:05:00.000Z'::timestamptz,
      '{}'::jsonb
    ),
    (
      'EKI-20260327-W8K2L4',
      'Assigned',
      'Escalated for urgent field response',
      'The issue was escalated to the regional maintenance lead because continuous loss risk was affecting nearby households.',
      'public',
      'Moderation Desk',
      'Moderator',
      '2026-03-27T18:10:00.000Z'::timestamptz,
      '{"isEscalation": true}'::jsonb
    ),
    (
      'EKI-20260327-W8K2L4',
      'In Progress',
      'Field inspection underway',
      'Technicians are on-site and have begun isolation of the damaged line.',
      'public',
      'Engr. Damilola Arogundade',
      'Water Board',
      '2026-03-28T06:30:00.000Z'::timestamptz,
      '{}'::jsonb
    )
) as seeded(
  tracking_number,
  status,
  title,
  note,
  visibility,
  actor_name,
  actor_role,
  created_at,
  metadata
) on r.tracking_number = seeded.tracking_number;

insert into public.report_media (
  report_id,
  storage_path,
  media_kind,
  file_name,
  mime_type,
  file_size_bytes
)
select
  r.id,
  'demo/ikere-burst-pipe.jpg',
  'image',
  'ikere-burst-pipe.jpg',
  'image/jpeg',
  980000
from public.reports r
where r.tracking_number = 'EKI-20260327-W8K2L4';

insert into public.audit_logs (
  report_id,
  entity_type,
  entity_id,
  action,
  actor_role_snapshot,
  payload
)
select
  r.id,
  'assignment',
  r.current_assignment_id,
  'assignment_escalated',
  'Moderator',
  jsonb_build_object('trackingNumber', r.tracking_number, 'status', r.current_status)
from public.reports r
where r.tracking_number = 'EKI-20260327-W8K2L4';

with
  report_type as (
    select id from public.report_types where code = 'suggestion'
  ),
  category as (
    select id from public.categories where slug = 'education'
  ),
  lga as (
    select id from public.lgas where slug = 'oye'
  ),
  ward as (
    select id from public.wards where slug = 'oye-oye-i'
  ),
  office as (
    select id from public.offices where slug = 'education-state'
  ),
  location_row as (
    insert into public.locations (
      state_name,
      lga_id,
      ward_id,
      community,
      area,
      street_address,
      landmark
    )
    select
      'Ekiti State',
      lga.id,
      ward.id,
      'Oye-Ekiti',
      'Community school cluster',
      'School access lane',
      'Near Oye civic square'
    from lga, ward
    returning id
  ),
  report_row as (
    insert into public.reports (
      tracking_number,
      report_type_id,
      category_id,
      location_id,
      assigned_office_id,
      current_status,
      severity,
      title,
      description,
      contact_name,
      contact_phone,
      is_anonymous,
      estimated_response_text,
      source_channel
    )
    select
      'EKI-20260325-E9H1D8',
      report_type.id,
      category.id,
      location_row.id,
      office.id,
      'Resolved',
      'routine',
      'Community noticeboard for school feeding schedule',
      'Parents suggested a visible noticeboard so feeding schedules and PTA announcements stay accessible.',
      'Abiola Fadeyi',
      '08094005000',
      false,
      'Estimated first review in 48 hours',
      'mobile-web'
    from report_type, category, location_row, office
    returning id, assigned_office_id
  ),
  assignment_row as (
    insert into public.assignments (
      report_id,
      office_id,
      assignment_mode,
      note
    )
    select
      report_row.id,
      report_row.assigned_office_id,
      'routing',
      'Suggestion routed to the education monitoring desk.'
    from report_row
    returning id, report_id
  )
update public.reports r
set current_assignment_id = assignment_row.id
from assignment_row
where r.id = assignment_row.report_id;

insert into public.report_updates (
  report_id,
  status,
  title,
  note,
  visibility,
  actor_name_snapshot,
  actor_role_snapshot,
  created_at
)
select
  r.id,
  seeded.status,
  seeded.title,
  seeded.note,
  seeded.visibility::public.update_visibility,
  seeded.actor_name,
  seeded.actor_role,
  seeded.created_at
from public.reports r
join (
  values
    (
      'EKI-20260325-E9H1D8',
      'Received',
      'Suggestion received',
      'The idea was logged and sent to the education desk.',
      'public',
      'EkiSignal Intake',
      'Citizen platform',
      '2026-03-25T10:10:00.000Z'::timestamptz
    ),
    (
      'EKI-20260325-E9H1D8',
      'Resolved',
      'Public notice accepted',
      'The local education supervisor approved a pilot noticeboard for the school cluster.',
      'public',
      'Mr. Olufemi Akinwale',
      'Education Monitoring Desk',
      '2026-03-27T11:30:00.000Z'::timestamptz
    )
) as seeded(
  tracking_number,
  status,
  title,
  note,
  visibility,
  actor_name,
  actor_role,
  created_at
) on r.tracking_number = seeded.tracking_number;

with
  report_type as (
    select id from public.report_types where code = 'complaint'
  ),
  category as (
    select id from public.categories where slug = 'other'
  ),
  lga as (
    select id from public.lgas where slug = 'efon'
  ),
  ward as (
    select id from public.wards where slug = 'efon-efon-i'
  ),
  office as (
    select id from public.offices where slug = 'citizen-default'
  ),
  location_row as (
    insert into public.locations (
      state_name,
      lga_id,
      ward_id,
      community,
      area,
      street_address,
      landmark
    )
    select
      'Ekiti State',
      lga.id,
      ward.id,
      'Efon-Alaaye',
      'Town centre',
      'Community secretariat road',
      'Near the local council hall'
    from lga, ward
    returning id
  ),
  report_row as (
    insert into public.reports (
      tracking_number,
      report_type_id,
      category_id,
      location_id,
      assigned_office_id,
      current_status,
      severity,
      title,
      description,
      is_anonymous,
      public_tracking_enabled,
      estimated_response_text,
      source_channel
    )
    select
      'EKI-20260325-F4X8N1',
      report_type.id,
      category.id,
      location_row.id,
      office.id,
      'Under Review',
      'routine',
      'Anonymous concern about aggressive online conduct by local liaison',
      'The report did not match a service category and was sent to the default moderation queue for triage.',
      true,
      true,
      'Estimated first review in 48 hours',
      'mobile-web'
    from report_type, category, location_row, office
    returning id, assigned_office_id
  ),
  assignment_row as (
    insert into public.assignments (
      report_id,
      office_id,
      assignment_mode,
      note
    )
    select
      report_row.id,
      report_row.assigned_office_id,
      'moderation',
      'Fallback routing rule sent this report to the moderation queue.'
    from report_row
    returning id, report_id
  )
update public.reports r
set current_assignment_id = assignment_row.id
from assignment_row
where r.id = assignment_row.report_id;

insert into public.report_updates (
  report_id,
  status,
  title,
  note,
  visibility,
  actor_name_snapshot,
  actor_role_snapshot,
  created_at
)
select
  r.id,
  seeded.status,
  seeded.title,
  seeded.note,
  seeded.visibility::public.update_visibility,
  seeded.actor_name,
  seeded.actor_role,
  seeded.created_at
from public.reports r
join (
  values
    (
      'EKI-20260325-F4X8N1',
      'Received',
      'Complaint received',
      'The anonymous complaint was received and queued for moderation review.',
      'public',
      'EkiSignal Intake',
      'Citizen platform',
      '2026-03-25T09:10:00.000Z'::timestamptz
    ),
    (
      'EKI-20260325-F4X8N1',
      'Under Review',
      'Moved to moderation queue',
      'No direct office rule matched, so the issue was sent to the default moderation queue for careful triage.',
      'public',
      'Routing Engine',
      'Automation',
      '2026-03-25T09:18:00.000Z'::timestamptz
    )
) as seeded(
  tracking_number,
  status,
  title,
  note,
  visibility,
  actor_name,
  actor_role,
  created_at
) on r.tracking_number = seeded.tracking_number;
