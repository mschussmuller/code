-- Fachadas tomadas de la portada de cada brochure (sólo donde la portada es un render del edificio).
-- No pisa imágenes cargadas desde la app.
UPDATE projects SET image_url = '/projects/bi-san-clemente-fernando/fachada.jpg' WHERE id = 'bi-san-clemente-fernando' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/city-02/fachada.jpg' WHERE id = 'city-02' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/insignia-07/fachada.jpg' WHERE id = 'insignia-07' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/insignia-08/fachada.jpg' WHERE id = 'insignia-08' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/insignia-09/fachada.jpg' WHERE id = 'insignia-09' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/insignia-10/fachada.jpg' WHERE id = 'insignia-10' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/insignia-11/fachada.jpg' WHERE id = 'insignia-11' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/narciso/fachada.jpg' WHERE id = 'narciso' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/terra-02/fachada.jpg' WHERE id = 'terra-02' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/venire-villa-morra/fachada.jpg' WHERE id = 'venire-villa-morra' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/venire/fachada.jpg' WHERE id = 'venire' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/ventura-hassler/fachada.jpg' WHERE id = 'ventura-hassler' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/ventura-torre-1/fachada.jpg' WHERE id = 'ventura-torre-1' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/ventura/fachada.jpg' WHERE id = 'ventura' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/r-bulnes/fachada.jpg' WHERE id = 'r-bulnes' AND image_url IS NULL;
