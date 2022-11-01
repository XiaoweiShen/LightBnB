select city, count(reservations.id) as total_reservations from properties join reservations on properties.id = reservations.property_id
group by city 
order by total_reservations desc;