const map = L.map('map').setView([43.7, -79.4], 8);

// Carto Light as the fixed basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB'
}).addTo(map);

// Delivery layer sources (only 3)
const layerSources = {
  "Wed Group": {
    url: "https://klabbyklab.github.io/maplayers/wed_group.geojson",
    color: "green"
  },
  "Thurs Group": {
    url: "https://klabbyklab.github.io/maplayers/thurs_group.geojson",
    color: "red"
  },
  "Fri Group": {
    url: "https://klabbyklab.github.io/maplayers/fri_group.geojson",
    color: "blue"
  }
};

const deliveryLayers = {};
const turfPolygons = []; // Store features for analysis

// Load layers and display checkboxes
const controlContainer = document.getElementById('layer-controls');
Object.entries(layerSources).forEach(([name, { url, color }]) => {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = name;
  checkbox.checked = true;

  const label = document.createElement('label');
  label.htmlFor = name;
  label.textContent = ` ${name}`;

  const wrapper = document.createElement('div');
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  controlContainer.appendChild(wrapper);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: {
          color,
          weight: 2,
          fillOpacity: 0.3
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(name);
        }
      }).addTo(map);

      deliveryLayers[name] = layer;
      turfPolygons.push({ name, data });

      checkbox.addEventListener('change', (e) => {
        e.target.checked ? layer.addTo(map) : map.removeLayer(layer);
      });
    });
});

// Postal code lookup
document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const postal = document.getElementById('postal').value.trim();
  const result = document.getElementById('result');

  if (!postal) return;

  const query = encodeURIComponent(postal);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&countrycodes=ca&format=json`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.length) {
        result.textContent = "❌ Postal code not found.";
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const point = turf.point([lon, lat]);

      let found = false;

      turfPolygons.forEach(({ name, data }) => {
        data.features.forEach(feature => {
          const polygon = turf.feature(feature.geometry);
          if (turf.booleanPointInPolygon(point, polygon)) {
            found = true;
            result.textContent = `✅ We deliver to this postal code on **${name.replace(" Group", "")}**.`;
            map.setView([lat, lon], 13);
            L.popup()
              .setLatLng([lat, lon])
              .setContent(`✅ You’re in our **${name.replace(" Group", "")}** delivery zone!`)
              .openOn(map);
          }
        });
      });

      if (!found) {
        result.textContent = "❌ Sorry, we do not currently deliver to this postal code.";
        map.setView([lat, lon], 12);
        L.popup()
          .setLatLng([lat, lon])
          .setContent(`❌ Not in a delivery zone.`)
          .openOn(map);
      }
    })
    .catch(() => {
      result.textContent = "⚠️ Error searching postal code.";
    });
});
