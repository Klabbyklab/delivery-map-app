const map = L.map('map').setView([43.7, -79.4], 8); // Example: Southern Ontario

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const layerUrls = [
  "https://klabbyklab.github.io/maplayers/wed_group.geojson",
  "https://klabbyklab.github.io/maplayers/thurs_group.geojson",
  "https://klabbyklab.github.io/maplayers/fri_group.geojson",
  "https://klabbyklab.github.io/maplayers/sat_group.geojson",
  "https://klabbyklab.github.io/maplayers/wed_union.geojson",
  "https://klabbyklab.github.io/maplayers/thurs_union.geojson",
  "https://klabbyklab.github.io/maplayers/fri_union.geojson",
  "https://klabbyklab.github.io/maplayers/sat_union.geojson",
  "https://klabbyklab.github.io/maplayers/zones.geojson",
  "https://klabbyklab.github.io/maplayers/zones_villages.geojson",
  "https://klabbyklab.github.io/maplayers/zones_towns.geojson",
  "https://klabbyklab.github.io/maplayers/zones_cities.geojson"
];

layerUrls.forEach((url, index) => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        style: {
          color: `hsl(${index * 30}, 70%, 50%)`, // unique color per layer
          weight: 2,
          fillOpacity: 0.2
        },
        onEachFeature: function (feature, layer) {
          const info = feature.properties?.delivery_day || feature.properties?.zone_name || "Delivery Zone";
          layer.bindPopup(info);
        }
      }).addTo(map);
    })
    .catch(err => console.error(`Error loading ${url}`, err));
});
