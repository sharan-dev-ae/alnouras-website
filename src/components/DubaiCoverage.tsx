import Icon from './Icon';

export default function DubaiCoverage() {
  return (
    <div className="coverage-map-static coverage-map-uae reveal" aria-label="Al Nouras service coverage across Dubai">
      <div className="coverage-map-copy">
        <span className="coverage-live"><i /> DUBAI · FULL SERVICE AREA</span>
        <strong>Across Dubai.<br/><em>Fully covered.</em></strong>
        <p>From business districts to healthcare facilities, construction sites and industrial areas, Al Nouras provides collection coverage throughout Dubai.</p>
        <div className="coverage-types"><span>Medical</span><span>Construction</span><span>General</span></div>
        <a href="#contact">Arrange your collection <Icon name="diagonal" size={18}/></a>
      </div>
      <figure className="uae-map-art">
        <div className="uae-map-status"><i/> DUBAI HIGHLIGHTED</div>
        <img src="/images/dubai-in-uae.png" alt="Map of the United Arab Emirates with the Emirate of Dubai highlighted" width="960" height="826" loading="lazy"/>
        <figcaption>Map: TUBS / Wikimedia Commons · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a></figcaption>
      </figure>
    </div>
  );
}
