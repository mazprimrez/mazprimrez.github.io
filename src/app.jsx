// ============================================================
//  App · hash-based router (GitHub Pages friendly)
// ============================================================
const { useState: useStateApp, useEffect: useEffectApp } = React;

function useHashRoute() {
  const get = () => {
    let h = window.location.hash || '#/';
    if (h === '#' || h === '') h = '#/';
    return h;
  };
  const [route, setRoute] = useStateApp(get());
  useEffectApp(() => {
    const onHash = () => {
      setRoute(get());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

const ROUTES = {
  '#/':         Home,
  '#/about':    About,
  '#/projects': Projects,
  '#/contact':  Contact,
};

const PAGE_TITLES = {
  '#/':         'Mazi Prima Reza · AI Engineer & Data Scientist',
  '#/about':    'About · Mazi Prima Reza',
  '#/projects': 'Projects · Mazi Prima Reza',
  '#/contact':  'Contact · Mazi Prima Reza',
};

// GA4 drops the #fragment from page paths, so report each route as a real path (/about, /projects…).
function useAnalytics(route) {
  useEffectApp(() => {
    document.title = PAGE_TITLES[route];
    if (typeof window.gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.origin + location.pathname.replace(/\/$/, '') + route.slice(1),
    });
  }, [route]);
}

function App() {
  const hash = useHashRoute();
  const route = ROUTES[hash] ? hash : '#/';
  const Page = ROUTES[route];
  useAnalytics(route);
  return (
    <React.Fragment>
      <Nav route={route} />
      <Page key={route} />
      <Footer />
    </React.Fragment>
  );
}

loadSiteContent();
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
