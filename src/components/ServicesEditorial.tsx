import Icon from './Icon';
interface Service { number: string; name: string; icon: string; text: string; tags: string[]; image: string; alt: string; }
interface Props { services: Service[]; }

export default function ServicesEditorial({ services }: Props) { return (
<section id="services" className="services section-pad editorial-services">
  <div className="container">
    <div className="section-heading"><div><span className="eyebrow blue-eyebrow"><span className="tiny-square"></span> 01 / EXPERTISE, IN EVERY COLLECTION</span><h2>Different demands.<br/><span>One dependable partner.</span></h2></div><p>From the first collection to your ongoing needs, we make waste management one less thing to think about.</p></div>
    <div className="services-editorial-layout">
      <div className="service-choices" aria-label="Explore our waste services">
        {services.map((service,index) => <article key={service.number} className="service-entry" data-service-entry={service.number} data-active={index === 0 ? 'true' : 'false'}>
          <h3><button className="service-choice" data-service-select={service.number} aria-expanded={index === 0} aria-controls={`service-copy-${service.number}`}><span className="choice-number">{service.number}</span><span>{service.name}</span><span className="choice-arrow"><Icon name="diagonal" size={23}/></span></button></h3>
          <div className="service-entry-body" id={`service-copy-${service.number}`}><div><p>{service.text}</p><div className="service-tags">{service.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className="service-link" data-service-dialog={service.number}>Explore service <Icon name="diagonal" size={18}/></button></div></div>
        </article>)}
        <p className="service-selector-note">Choose a service to explore its collection requirements.</p>
      </div>
      <div className="service-visual-stage" aria-label="Service photography">
        {services.map((service,index)=><figure key={service.number} className="service-visual" data-service-visual={service.number} data-active={index === 0 ? 'true' : 'false'} aria-hidden={index !== 0}><img src={service.image} alt={service.alt} width="900" height="650" loading="lazy"/><figcaption><span>{service.number} / AL NOURAS SOLUTIONS</span><strong>{service.name}</strong><Icon name={service.icon} size={28}/></figcaption></figure>)}
        <span className="service-image-rule" aria-hidden="true"></span>
      </div>
    </div>
    <div className="services-footnote"><span><Icon name="recycle" size={19}/> Also supporting industrial, hazardous and pharmaceutical waste requirements.</span><a href="#contact">Find your solution <Icon name="arrow" size={17}/></a></div>
  </div>
</section>

); }
