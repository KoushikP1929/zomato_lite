INSERT INTO restaurants (name, cuisine, area)
SELECT 'Ludhiana Burrito', 'Indian', 'Sector 32'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Ludhiana Burrito');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, v.rating, v.comment, NOW() - v.ago
FROM restaurants r
CROSS JOIN (
  VALUES
    (5, 'Paneer burrito is unreal', INTERVAL '8 days'),
    (4, 'Good, but slow service',   INTERVAL '6 days'),
    (4, 'Solid. Would repeat.',     INTERVAL '2 days')
) AS v(rating, comment, ago)
WHERE r.name = 'Ludhiana Burrito'
  AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.comment = v.comment);
