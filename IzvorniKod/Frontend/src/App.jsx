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
