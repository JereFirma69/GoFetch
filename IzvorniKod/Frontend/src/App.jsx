<<<<<<< HEAD
import {Routes, Route} from 'react-router-dom'
import Header from './shared_components/Header'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
//ovdje importat jos i SignUpPage

function App(){
  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<LoginPage/>} />
      </Routes>
    </div>
  )
}
export default App
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
>>>>>>> e7a2d15837b90b271122159bec2483ef5c0b9d8f
