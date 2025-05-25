const map = L.map('map').setView([43.7, -79.4], 8);

// Base layers
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

let currentBaseLayer = baseLayers.osm;
currentBaseLayer.addTo(map);

document.getElementById('basemap-select').addEventListener('change', (e) => {
  const selected = e.target.value;
  if (baseLayers[selected]) {
    map.removeLayer(currentBaseLayer);
    currentBaseLayer = baseLayers[selected];
    currentBaseLayer.addTo(map);
  }
});

// Layer source map
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

// Define fixed delivery day colors
const deliveryColors = {
  "wednesday": "green",
  "thursday": "red",
  "friday": "blue",
  "saturday": "yellow"
};

// Loop through each GeoJSON layer
Object.entries(layerSources).forEach(([name, url]) => {
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

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let geoLayer;

      // Special label handling for cities, towns, villages
      if (["Villages", "Towns", "Cities"].includes(name)) {
        geoLayer = L.layerGroup();
        data.features.forEach(feature => {
          const coords = feature.geometry.coordinates;
          const latlng = feature.geometry.type === "Point"
            ? [coords[1], coords[0]]
            : [coords[0][0][1], coords[0][0][0]]; // fallback for non-point

          const label = feature.properties?.name || "Unnamed";
          const marker = L.marker(latlng, {
            icon: L.divIcon({
              className: 'label-icon',
              html: `<div style="font-size: 12px; color: #222;">${label}</div>`
            })
          });
          marker.addTo(geoLayer);
        });
        geoLayer.addTo(map);
      } else {
        geoLayer = L.geoJSON(data, {
          style: function (feature) {
            const rawDay = (feature.properties?.delivery_day || name || "").toLowerCase();
            const color = deliveryColors[rawDay] || "gray";
            return {
              color,
              weight: 2,
              fillOpacity: 0.25
            };
          },
          onEachFeature: function (feature, layer) {
            const info = feature.properties?.delivery_day || feature.properties?.zone_name || name;
            layer.bindPopup(info);
          }
        }).addTo(map);
      }

      layers[name] = geoLayer;

      checkbox.addEventListener('change', (e) => {
        e.target.checked ? geoLayer.addTo(map) : map.removeLayer(geoLayer);
      });
    })
    .catch(err => console.error(`Error loading layer "${name}":`, err));
});

