
import {Routes, Route} from 'react-router-dom'
import Header from './shared_components/Header'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'


function App(){
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}
export default App
