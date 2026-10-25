import { useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router';
import { routeMetadata } from './data/routeMetadata';
import Home from './pages/Home';
import ExperiencePreview from './pages/ExperiencePreview';

function RetiredPreview() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/', { replace: true }); }, [navigate]);
  return <main className="route-message"><p>The geographic concept has been retired.</p><Link to="/">Continue to Al Nouras →</Link></main>;
}
function NotFound() { return <main className="route-message"><h1>Page not found.</h1><Link to="/">Return to Al Nouras →</Link></main>; }
export default function App() {
  const location = useLocation();
  useEffect(() => { const metadata = routeMetadata(location.pathname); document.title = metadata.title; document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description); document.querySelector('meta[name="robots"]')?.setAttribute('content', metadata.robots); }, [location.pathname]);
  return <div data-app-root><Routes><Route path="/" element={<Home/>}/><Route path="/satellite-preview" element={<RetiredPreview/>}/><Route path="/experience-preview" element={<ExperiencePreview/>}/><Route path="*" element={<NotFound/>}/></Routes></div>;
}
