import { useEffect, useRef } from 'react';
import Icon from './Icon';

const emirates = [
  ['ABU DHABI',24.20,53.72],['SHARJAH',25.34,55.48],['AJMAN',25.41,55.58],
  ['UMM AL QUWAIN',25.55,55.70],['RAS AL KHAIMAH',25.82,56.04],['FUJAIRAH',25.14,56.20],
] as const;

export default function DubaiCoverage() {
  const mapRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let map: import('leaflet').Map | undefined;
    let resizeObserver: ResizeObserver | undefined;
    void Promise.all([import('leaflet'), fetch('/data/dubai-boundary.geojson').then(response => response.json())]).then(([module,boundary]) => {
      if (disposed || !mapRoot.current) return;
      const L = (module.default ?? module) as typeof import('leaflet');
      map = L.map(mapRoot.current, { center:[24.55,54.55], zoom:7, minZoom:6, maxZoom:14, scrollWheelZoom:false, zoomControl:false, attributionControl:true });
      map.attributionControl.setPrefix(false);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors', className:'alnouras-map-tiles' }).addTo(map);
      L.control.zoom({ position:'bottomright' }).addTo(map);
      L.geoJSON(boundary, { style:{ color:'#f4c542', weight:3, opacity:1, fillColor:'#f4c542', fillOpacity:.38 } }).addTo(map);
      emirates.forEach(([name,lat,lng]) => L.marker([lat,lng], { interactive:false, icon:L.divIcon({ className:'emirate-map-label', html:name, iconSize:[120,20], iconAnchor:[60,10] }) }).addTo(map!));
      L.marker([25.20,55.20], { interactive:false, zIndexOffset:500, icon:L.divIcon({ className:'emirate-map-label emirate-map-label-active', html:'DUBAI', iconSize:[90,26], iconAnchor:[45,13] }) }).addTo(map);
      map.fitBounds([[22.72,51.55],[26.35,56.45]], { padding:[12,12], animate:false });
      resizeObserver = new ResizeObserver(()=>map?.invalidateSize({ animate:false }));
      resizeObserver.observe(mapRoot.current);
      requestAnimationFrame(()=>requestAnimationFrame(()=>map?.invalidateSize({ animate:false })));
    }).catch(error => console.error('Dubai coverage map could not initialize.', error));
    return () => { disposed = true; resizeObserver?.disconnect(); map?.remove(); };
  }, []);
  return <div className="coverage-map-static coverage-map-uae reveal" aria-label="Al Nouras service coverage across Dubai">
    <div className="coverage-map-copy">
      <span className="coverage-live"><i /> DUBAI · FULL SERVICE AREA</span>
      <strong>Across Dubai.<br/><em>Fully covered.</em></strong>
      <p>From business districts to healthcare facilities, construction sites and industrial areas, Al Nouras provides collection coverage throughout Dubai.</p>
      <div className="coverage-types"><span>Medical</span><span>Construction</span><span>General</span></div>
      <a href="#contact">Arrange your collection <Icon name="diagonal" size={18}/></a>
    </div>
    <div className="coverage-leaflet" aria-label="Interactive UAE map with Dubai highlighted"><div className="coverage-map-fallback" aria-hidden="true">UAE</div><div className="uae-map-status"><i/> DUBAI HIGHLIGHTED</div><div className="coverage-map-legend"><span><i/> Dubai emirate</span></div><div ref={mapRoot} className="coverage-leaflet-canvas"/></div>
  </div>;
}
