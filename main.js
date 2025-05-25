const map = L.map('map').setView([43.7, -79.4], 8);

// Define base layers
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

// Add default basemap
let currentBaseLayer = baseLayers.osm;
currentBaseLayer.addTo(map);

// Basemap switcher
document.getElementById('basemap-select').addEventListener('change', (e) => {
  const selected = e.target.value;
  if (baseLayers[selected]) {
    map.removeLayer(currentBaseLayer);
    currentBaseLayer = baseLayers[selected];
    currentBaseLayer.addTo(map);
  }
});

// GeoJSON layers to load
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

const layers = {};
const controlContainer = document.getElementById('layer-controls');

// Create checkbox and fetch each layer
Object.entries(layerSources).forEach(([name, url], index) => {
  const color = `hsl(${index * 30}, 70%, 50%)`;

  // Create checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = name;
  checkbox.checked = true;

  const label = document.createElement('label');
  label.htmlFor = name;
  label.textContent = name;

  const wrapper = document.createElement('div');
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  controlContainer.appendChild(wrapper);

  // Load the layer
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const geoLayer = L.geoJSON(data, {
        style: {
          color,
          weight: 2,
          fillOpacity: 0.3
        },
        onEachFeature: function (feature, layer) {
          const info = feature.properties?.delivery_day ||
                       feature.properties?.zone_name ||
                       feature.properties?.name ||
                       name;
          layer.bindPopup(info);
        }
      }).addTo(map);

      layers[name] = geoLayer;

      // Add toggle behavior
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          geoLayer.addTo(map);
        } else {
          map.removeLayer(geoLayer);
        }
      });
    })
    .catch(err => console.error(`Error loading layer "${name}":`, err));
});
