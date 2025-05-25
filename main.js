const map = L.map('map').setView([43.7, -79.4], 8);

// Define basemap layers
const baseLayers = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }),
  esri: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  }),
  light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
  })
};

// Load default basemap
baseLayers.osm.addTo(map);

// Handle basemap switching
document.getElementById('basemap-select').addEventListener('change', (e) => {
  const selected = e.target.value;
  Object.values(baseLayers).forEach(layer => map.removeLayer(layer));
  baseLayers[selected].addTo(map);
});

// Define your GeoJSON layers (with user-friendly names)
const layerSources = {
  "Wed Group": "https://klabbyklab.github.io/maplayers/wed_group.geojson",
  "Thurs Group": "https://klabbyklab.github.io/maplayers/thurs_group.geojson",
  "Fri Group": "https://klabbyklab.github.io/maplayers/fri_group.geojson",
  "Sat Group": "https://klabbyklab.github.io/maplayers/sat_group.geojson",
  "Wed Union": "https://klabbyklab.github.io/maplayers/wed_union.geojson",
  "Thurs Union": "https://klabbyklab.github.io/maplayers/thurs_union.geojson",
  "Fri Union": "https://klabbyklab.github.io/maplayers/fri_union.geojson",
  "Sat Union": "https://klabbyklab.github.io/maplayers/sat_union.geojson",
  "Zones": "https://klabbyklab.github.io/maplayers/zones.geojson",
  "Villages": "https://klabbyklab.github.io/maplayers/zones_villages.geojson",
  "Towns": "https://klabbyklab.github.io/maplayers/zones_towns.geojson",
  "Cities": "https://klabbyklab.github.io/maplayers/zones_cities.geojson"
};

const layers = {}; // Store each loaded layer
const controls = document.getElementById('layer-controls');

// Load each layer and set up checkbox UI
Object.entries(layerSources).forEach(([name, url], index) => {
  const color = `hsl(${index * 30}, 70%, 50%)`;

  // Create checkbox UI
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = name;
  checkbox.checked = true;

  const label = document.createElement('label');
  label.htmlFor = name;
  label.innerText = ` ${name}`;

  const wrapper = document.createElement('div');
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  controls.appendChild(wrapper);

  // Load GeoJSON layer
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const geoLayer = L.geoJSON(data, {
        style: {
          color,
          weight: 2,
          fillOpacity: 0.25
        },
        onEachFeature: function (feature, layer) {
          const info =
            feature.properties?.delivery_day ||
            feature.properties?.zone_name ||
            feature.properties?.name ||
            name;
          layer.bindPopup(info);
        }
      }).addTo(map);
      layers[name] = geoLayer;
    })
    .catch(err => console.error(`Error loading ${name}:`, err));

  // Toggle visibility
  checkbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    if (layers[name]) {
      checked ? map.addLayer(layers[name]) : map.removeLayer(layers[name]);
    }
  });
});
