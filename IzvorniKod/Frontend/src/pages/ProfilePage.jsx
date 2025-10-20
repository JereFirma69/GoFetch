import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: "Guest", email: "unknown" };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <img src="https://ui-avatars.com/api/?name=Guest" alt="Profile" className="profile-avatar" />
      <h2>{user.name}</h2>
      <p>{user.email}</p>

      <button className="secondary-btn" onClick={() => navigate('/edit-profile')}>Edit Profile</button>
      <button className="primary-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default ProfilePage;
