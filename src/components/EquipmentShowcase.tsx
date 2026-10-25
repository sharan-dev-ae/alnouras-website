import { useMemo, useState } from 'react';
import Icon from './Icon';

type Category = 'All' | 'Skips' | 'Trolleys' | 'Compactors';

const equipment = [
  { id:'trolley-140l', category:'Trolleys', capacity:'140 L', name:'Compact trolley', image:'/images/equipment/trolley-140l.png', use:'Residential · Offices · Small commercial' },
  { id:'trolley-1-1cbm', category:'Trolleys', capacity:'1.1 CBM', name:'Galvanised trolley', image:'/images/equipment/trolley-1-1cbm.png', use:'Residential · Offices · Commercial' },
  { id:'trolley-2cbm', category:'Trolleys', capacity:'2 CBM', name:'Compaction trolley', image:'/images/equipment/trolley-2cbm.png', use:'Commercial · Industrial · Residential' },
  { id:'trolley-5cbm', category:'Trolleys', capacity:'5 CBM', name:'Heavy-duty trolley', image:'/images/equipment/trolley-5cbm.png', use:'Commercial · Industrial · Construction' },
  { id:'skip-2-5cbm', category:'Skips', capacity:'2.5 CBM', name:'Compact skip bin', image:'/images/equipment/skip-2-5cbm.png', use:'Small projects · Residential · Light commercial' },
  { id:'skip-10cbm', category:'Skips', capacity:'10 CBM', name:'Project skip', image:'/images/equipment/skip-10cbm.png', use:'Commercial · Industrial · Construction' },
  { id:'skip-20cbm', category:'Skips', capacity:'20 CBM', name:'Large-capacity skip', image:'/images/equipment/skip-20cbm.png', use:'Major construction · Industrial · Commercial' },
  { id:'compactor-18cbm', category:'Compactors', capacity:'18 CBM', name:'Portable compactor', image:'/images/equipment/compactor-18cbm.png', use:'High-volume commercial · Industrial · Construction' },
] as const;

export default function EquipmentShowcase() {
  const [category, setCategory] = useState<Category>('All');
  const [activeId, setActiveId] = useState<string>(equipment[0].id);
  const visible = useMemo(() => category === 'All' ? equipment : equipment.filter(item => item.category === category), [category]);
  const active = visible.find(item => item.id === activeId) ?? visible[0];
  const activeIndex = visible.findIndex(item => item.id === active.id);
  const selectCategory = (next: Category) => { setCategory(next); const first = next === 'All' ? equipment[0] : equipment.find(item => item.category === next)!; setActiveId(first.id); };
  const move = (direction: number) => setActiveId(visible[(activeIndex + direction + visible.length) % visible.length].id);

  return <section id="equipment" className="equipment-section section-pad" aria-labelledby="equipment-title"><div className="container">
    <div className="section-heading equipment-heading"><div><span className="eyebrow"><span className="tiny-square"></span> 03 / EQUIPMENT FOR EVERY SCALE</span><h2 id="equipment-title">The right container.<br/><span>For every site.</span></h2></div><p>Skips, trolleys and compactors for operations of every size.</p></div>
    <div className="equipment-explorer">
      <div className="equipment-stage reveal" aria-live="polite">
        <img key={active.id} src={active.image} alt={`${active.capacity} ${active.name} from Al Nouras`} width="1920" height="1080" loading="lazy"/>
        <div className="equipment-stage-meta"><span>{active.category}</span><strong>{active.capacity}</strong><small>{active.use}</small></div>
        <div className="equipment-arrows"><button type="button" onClick={()=>move(-1)} aria-label="Previous equipment"><Icon name="arrow" size={18}/></button><span>{String(activeIndex + 1).padStart(2,'0')} / {String(visible.length).padStart(2,'0')}</span><button type="button" onClick={()=>move(1)} aria-label="Next equipment"><Icon name="arrow" size={18}/></button></div>
      </div>
      <aside className="equipment-selector reveal" aria-label="Choose equipment">
        <div className="equipment-selector-head"><span>SELECT EQUIPMENT</span><strong>{String(activeIndex + 1).padStart(2,'0')}<small> / {String(visible.length).padStart(2,'0')}</small></strong></div>
        <div className="equipment-tabs" role="tablist" aria-label="Equipment categories">{(['All','Skips','Trolleys','Compactors'] as Category[]).map(item=><button key={item} type="button" role="tab" aria-selected={category===item} onClick={()=>selectCategory(item)}>{item}</button>)}</div>
        <div className="equipment-options">{visible.map((item,index)=><button key={item.id} type="button" className={item.id===active.id ? 'active' : ''} aria-pressed={item.id===active.id} onClick={()=>setActiveId(item.id)}><i></i><span>{String(index+1).padStart(2,'0')}</span><div><strong>{item.capacity}</strong><small>{item.name}</small></div><Icon name="diagonal" size={17}/></button>)}</div>
        <a href="#contact" className="equipment-enquire">Discuss the right setup <Icon name="diagonal" size={18}/></a>
      </aside>
    </div>
  </div></section>;
}
