import Icon from './Icon';

export default function CompanyIntro() {
  return (
    <section id="company" className="company-intro chapter-section">
      <div className="container company-intro-grid">
        <div className="company-intro-copy reveal">
          <span className="chapter-number">01</span>
          <span className="eyebrow"><i className="tiny-square"/> WHO WE ARE</span>
          <h2>Three decades.<br/><span>One cleaner Dubai.</span></h2>
          <p>Al Nouras is a Dubai-based waste collection and transporting company serving healthcare facilities, construction sites and businesses across the city.</p>
          <a href="#services">See what we collect <Icon name="arrow" size={17}/></a>
        </div>
        <div className="company-intro-visual reveal">
          <img src="/images/company/alnouras-team-fleet.jpg" alt="Illustrative Al Nouras operations team with a modern waste collection fleet in Dubai" width="1672" height="940" loading="lazy" decoding="async"/>
          <div className="experience-block"><strong><span data-count="30">30</span><sup>+</sup></strong><span>YEARS OF<br/>LOCAL EXPERIENCE</span></div>
          <div className="company-proof company-scale"><span><Icon name="truck" size={18}/><strong><b data-count="70">70</b>+</strong><small>VEHICLES</small></span><span><Icon name="people" size={18}/><strong><b data-count="200">200</b>+</strong><small>STAFF</small></span><span><Icon name="clock" size={18}/><strong>24/7</strong><small>SUPPORT</small></span></div>
        </div>
      </div>
    </section>
  );
}
