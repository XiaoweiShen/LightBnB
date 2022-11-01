select reservations.id, title, cost_per_night, start_date from reservations join properties on reservations.property_id = properties.id
join property_reviews on reservation_id = reservations.id
where reservations.guest_id =1 
order by start_date asc;