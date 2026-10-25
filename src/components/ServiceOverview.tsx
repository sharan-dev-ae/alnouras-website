import Icon from './Icon';

interface Service { number: string; name: string; icon: string; text: string; tags: string[]; image: string; }

export default function ServiceOverview({ services }: { services: Service[] }) {
  return (
    <section id="services" className="service-overview chapter-section">
      <div className="container">
        <div className="compact-heading reveal"><div><span className="chapter-number">02</span><span className="eyebrow"><i className="tiny-square"/> WHAT WE COLLECT</span><h2>Waste solutions.<br/><span>Built around your site.</span></h2></div><p>Three core services, one dependable local team.</p></div>
        <div className="service-overview-grid">
          {services.map(service => <article key={service.number} className={`service-overview-card service-${service.number} reveal${service.name === 'Construction waste' ? ' construction-focus' : ''}`}>
            <img src={service.image} alt="" width="640" height="420" loading="lazy" decoding="async"/>
            <div className="service-card-shade"/>
            <span className="service-card-number">{service.number}</span><span className="service-card-icon"><Icon name={service.icon} size={24}/></span>
            <div className="service-card-copy">{service.name === 'Construction waste' && <span className="service-focus-label">BUILT FOR ACTIVE SITES</span>}<h3>{service.name}</h3><p>{service.text}</p><button data-service-dialog={service.number}>View service <Icon name="diagonal" size={16}/></button></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}
