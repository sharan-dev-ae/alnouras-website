import Icon from './Icon';
const chapters = [
 { number:'01', label:'The fleet', title:'Built for the work ahead.', text:'Purpose-built collection vehicles. Practical equipment for the waste your business generates.', image:'/images/alnouras-fleet.webp', alt:'An Al Nouras Hino waste collection truck from the company archive', tags:['Waste collection vehicles','Transporting & bulk collection'] },
 { number:'02', label:'The people', title:'People you can count on.', text:'Professional, uniformed drivers and crews. An experienced team behind every collection.', image:'/images/alnouras-collection.webp', alt:'An Al Nouras team member wearing gloves and a mask while operating collection equipment', tags:['Trained, uniformed teams','Professional collection practices'] },
 { number:'03', label:'The commitment', title:'A proper setup. Every collection.', text:'Collection plans suited to your operation. Discuss your site, your waste and your schedule with us.', image:'/images/alnouras-operations.webp', alt:'An Al Nouras crew and truck handling a skip collection in Dubai', tags:['Collection plans for your site','A locally based team'] },
];
export default function FleetStory() { return (
<section id="fleet" className="fleet-section section-pad cinematic-fleet"><div className="container">
  <div className="section-heading fleet-heading"><div><span className="eyebrow"><span className="tiny-square"></span> 04 / BUILT FOR THE JOB</span><h2>Modern fleet.<br/><span>Professional people.</span></h2></div><p>Reliable equipment and experienced teams, prepared for clean, careful collections across Dubai.</p></div>
  <div className="fleet-compact">
    <figure className="fleet-compact-media"><img src={chapters[0].image} alt={chapters[0].alt} width="1400" height="529" loading="lazy"/><span className="fleet-photo-credit">AL NOURAS / COMPANY ARCHIVE</span><strong>Ready for Dubai.<br/>Ready around the clock.</strong></figure>
    <div className="fleet-compact-details">{chapters.map(chapter=><article key={chapter.number} className="fleet-compact-card"><span>{chapter.number}</span><div><small>{chapter.label}</small><h3>{chapter.title}</h3><p>{chapter.text}</p></div><Icon name="check" size={17}/></article>)}<a className="fleet-compact-link" href="#contact">Discuss your collection needs <Icon name="diagonal" size={18}/></a></div>
  </div>
</div></section>

); }
