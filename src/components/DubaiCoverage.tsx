import { useEffect, useRef } from 'react';
import Icon from './Icon';

const coveragePoints = [
  ['Jebel Ali',24.9857,55.0273],['Dubai Marina',25.0805,55.1403],['Al Quoz',25.1394,55.2353],
  ['Downtown Dubai',25.1972,55.2744],['Business Bay',25.1851,55.2606],['Deira',25.2697,55.3095],
  ['Al Qusais',25.2764,55.3661],['Dubai Silicon Oasis',25.1251,55.3784],['Dubai South',24.8965,55.1614],
] as const;

export default function DubaiCoverage() {
  const mapRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let map: import('leaflet').Map | undefined;
    let resizeObserver: ResizeObserver | undefined;
    void import('leaflet').then(module => {
      if (disposed || !mapRoot.current) return;
      const L = (module.default ?? module) as typeof import('leaflet');
      map = L.map(mapRoot.current, { center:[25.17,55.25], zoom:9, minZoom:8, maxZoom:14, scrollWheelZoom:false, zoomControl:false, attributionControl:true });
      map.attributionControl.setPrefix(false);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(map);
      L.control.zoom({ position:'bottomright' }).addTo(map);
      L.circle([25.18,55.25], { radius:43000, color:'#f4c542', weight:2, opacity:.95, fillColor:'#f4c542', fillOpacity:.2, dashArray:'7 8' }).addTo(map).bindTooltip('Dubai-wide service coverage', { permanent:true, direction:'center', className:'coverage-map-label' });
      coveragePoints.forEach(([name,lat,lng]) => L.circleMarker([lat,lng], { radius:5, color:'#06182c', weight:2, fillColor:'#f4c542', fillOpacity:1 }).addTo(map!).bindTooltip(name, { direction:'top', offset:[0,-6] }));
      L.circleMarker([25.2048,55.2708], { radius:9, color:'#fff', weight:2, fillColor:'#f4c542', fillOpacity:1 }).addTo(map).bindPopup('<strong>Dubai</strong><br>Al Nouras service area');
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
    <div className="coverage-leaflet" aria-label="Interactive map showing Al Nouras coverage across Dubai"><div className="coverage-map-fallback" aria-hidden="true">DUBAI</div><div className="uae-map-status"><i/> LIVE DUBAI COVERAGE</div><div ref={mapRoot} className="coverage-leaflet-canvas"/></div>
  </div>;
}
