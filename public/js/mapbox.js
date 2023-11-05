
export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiamFnZzg2IiwiYSI6ImNsbmJ6eWJ0aTAwYTIya28xb2pyampxbGYifQ.JJ9wD_Nhk3yJpkl5r3V3-g';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jagg86/clnc16tfi03r301qxcv508wcs',
    scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
    }).setLngLat(loc.coordinates).addTo(map);

    // Add popup
    new mapboxgl.Popup({
        offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}
