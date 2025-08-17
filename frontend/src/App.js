import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/profile';
import Tasks from './pages/tasks';
import Projects from './pages/project';
import Bids from './pages/bid';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Projects />} /> {/* Default page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/projects" element={<Projects />} />     
        <Route path="/bids" element={<Bids />} />
      </Routes>
    </Router>
  );
}

export default App;
