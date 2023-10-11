import { Map } from 'https://cdn.skypack.dev/maplibre-gl@1';

const map = new Map({
  hash: false,
  maxZoom: 20,
  attributionControl: false,
  container: document.getElementById('map'),
  interactive: false,
  style:
    'https://api.maptiler.com/maps/f5aef65e-5411-4a59-b041-04b2ba140adb/style.json?key=Eg5t1Hfj0rCZrHHtZ6Ug'
});
map.on('idle', async () => {
  await setLoadedIfTilesAreLoaded();
});

async function setLoadedIfTilesAreLoaded() {
  if (map.loaded()) {
    document.body.classList.remove('loading');
  } else {
    setTimeout(() => {
      setLoadedIfTilesAreLoaded();
    }, 2000);
  }
}

window.map = map;
