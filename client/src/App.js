import { HashRouter, Route, Routes } from 'react-router-dom';
import Banner from './Banner';
import Dashboard from './Dashboard';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Banner />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;