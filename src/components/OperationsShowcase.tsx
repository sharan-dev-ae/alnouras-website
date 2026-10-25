import Icon from './Icon';
export default function OperationsShowcase() { return (
<section id="operations" className="operations-section section-pad"><div className="container">
  <div className="section-heading"><div><span className="eyebrow blue-eyebrow"><span className="tiny-square"></span> 04 / FROM THE FIELD</span><h2>Our work.<br/><span>Out in the real world.</span></h2></div><p>A closer look at the vehicles, people and collection work in the Al Nouras company archive.</p></div>
  <div className="operations-grid">
    <a className="operation-card operation-wide" href="#contact" data-pointer-image><div className="operation-image"><img src="/images/alnouras-operations.webp" alt="Al Nouras skip truck and crew at work in Dubai" loading="lazy" width="1400" height="529"/></div><span className="operation-index">01 / COLLECTION IN PRACTICE</span><div className="operation-caption"><span className="eyebrow">DUBAI · COMPANY ARCHIVE</span><h3>Equipment with<br/>a job to do.</h3><span className="operation-arrow"><Icon name="diagonal" size={27}/></span></div></a>
    <a className="operation-card operation-tall" href="#contact" data-pointer-image><div className="operation-image"><img src="/images/alnouras-collection.webp" alt="Al Nouras team member operating a collection vehicle" loading="lazy" width="1400" height="529"/></div><span className="operation-index">02 / THE PEOPLE BEHIND IT</span><div className="operation-caption"><span className="eyebrow">PROFESSIONAL TEAMS</span><h3>The human side<br/>of every collection.</h3><span className="operation-arrow"><Icon name="diagonal" size={27}/></span></div></a>
  </div><div className="operations-bottom"><span>Actual operational photography from the Al Nouras archive.</span><a className="text-link" href="#contact">Let’s talk about your site <Icon name="arrow" size={18}/></a></div>
</div></section>

); }
