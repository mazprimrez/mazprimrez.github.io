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

function App() {
  const route = useHashRoute();
  const Page = ROUTES[route] || Home;
  return (
    <React.Fragment>
      <Nav route={route} />
      <Page key={route} />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
