const map = L.map('map').setView([43.7, -79.4], 8);

// Carto Light base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB'
}).addTo(map);

// ✅ GeoJSON layers for delivery zones
const geoLayers = {
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
  },
  "Sat Group": {
    url: "https://klabbyklab.github.io/maplayers/sat_group.geojson",
    color: "gold"
  }
};

const deliveryLayers = {};
const geoControl = document.getElementById('layer-controls');

Object.entries(geoLayers).forEach(([name, { url, color }]) => {
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
  geoControl.appendChild(wrapper);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: {
          color,
          weight: 2,
          fillOpacity: 0.15
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(name);
        }
      }).addTo(map);

      deliveryLayers[name] = layer;

      checkbox.addEventListener('change', (e) => {
        e.target.checked ? layer.addTo(map) : map.removeLayer(layer);
      });
    });
});

// ✅ CSV layers from Google Sheets

const csvSources = {
  "3 Weeks Out": {
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2LfOVQyErcTtEMSwS1ch4GfUlcpXnNfih841L1Vms0B-9pNMSh9vW5k0TNrXDoQgv2-lgDnYWdzgM/pub?output=csv",
    color: "purple"
  },
  "2 Weeks Out": {
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkTCHp6iaWJBboax7x-Ic8kmX6jlYkTzJhnCnv2WfPtmo70hXPijk0p1JI03vBQTPuyPuDVWzxbavP/pub?output=csv",
    color: "orange"
  },
  "1 Week Out": {
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ1kJEo0ZljAhlg4Lnr_Shz3-OJnV6uehE8vCA8280L4aCfNoWE85WEJnOG2jzL2jE-o0PWTMRZiFu/pub?output=csv",
    color: "black"
  }
};

const csvLayers = {};
const csvControl = document.getElementById('csv-controls');

Object.entries(csvSources).forEach(([name, { url, color }]) => {
  const layer = L.layerGroup().addTo(map);
  csvLayers[name] = layer;

  // UI checkbox
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
  csvControl.appendChild(wrapper);

  checkbox.addEventListener('change', (e) => {
    e.target.checked ? layer.addTo(map) : map.removeLayer(layer);
  });

  // Load and parse CSV
  Papa.parse(url, {
    download: true,
    header: true,
    complete: function(results) {
      results.data.forEach(row => {
        const lat = parseFloat(row.lat || row.latitude);
        const lon = parseFloat(row.lon || row.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.circleMarker([lat, lon], {
            radius: 5,
            color,
            fillOpacity: 0.8
          }).bindPopup(`Name: ${row.name || "N/A"}`);
          marker.addTo(layer);
        }
      });
    }
  });
});
