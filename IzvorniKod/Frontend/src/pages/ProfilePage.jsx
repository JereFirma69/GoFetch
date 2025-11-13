import { useState, useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import FavoriteDogs from "../components/Profile/FavoriteDogs";
import AddedDogs from "../components/Profile/AddedDogs";
import Reviews from "../components/Profile/Reviews";
import EditProfilePanel from "../components/Profile/EditProfilePanel";
import DogFormPanel from "../components/Profile/DogFormPanel";
import gD1 from "../assets/dogImages/goldenRetriver1.jpg";
import gD2 from "../assets/dogImages/goldenRetriver2.jpg";
import p1 from "../assets/dogImages/pug1.jpg";

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'default';
  const initialDogId = searchParams.get('dogId');
  
  const [showEdit, setShowEdit] = useState(initialView === 'edit');
  const [dogFormMode, setDogFormMode] = useState(
    initialView === 'add-dog' ? 'add' : 
    initialDogId ? { dog: { idPas: parseInt(initialDogId) } } : 
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  function openEditProfile() {
    setShowEdit(true);
    setDogFormMode(null);
  }

  function openDogForm(mode) {
    setDogFormMode(mode);
    setShowEdit(false);
  }

  function closeAllPanels() {
    setShowEdit(false);
    setDogFormMode(null);
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await api.get("/profile/me");
        setProfileData(data);
        
        if (initialDogId && data?.owner?.dogs) {
          const dog = data.owner.dogs.find(d => d.idPas === parseInt(initialDogId));
          if (dog) {
            setDogFormMode({ dog });
          }
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [refreshKey, initialDogId]);

  useEffect(() => {
    if (showEdit) {
      setSearchParams({ view: 'edit' });
    } else if (dogFormMode === 'add') {
      setSearchParams({ view: 'add-dog' });
    } else if (dogFormMode?.dog) {
      setSearchParams({ view: 'edit-dog', dogId: dogFormMode.dog.idPas });
    } else {
      setSearchParams({});
    }
  }, [showEdit, dogFormMode, setSearchParams]);

  const favoriteDogs = [
    { id: 1, name: "Max", image: gD1 },
    { id: 2, name: "Luna", image: gD2},
    { id: 3, name: "Roki", image: p1 },
  ];

  const addedDogs = profileData?.owner?.dogs?.map(dog => ({
    id: dog.idPas,
    name: dog.imePas,
    breed: dog.pasmina,
    image: dog.profilnaPas,
    ...dog
  })) || [];

  const reviews = [
    { id: 1, dogName: "Rex", rating: 5, text: "Lorem ipsum dolor sit amet." },
    { id: 2, dogName: "Max", rating: 4, text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ];

  function handleDogSave() {
    setRefreshKey((k) => k + 1);
    closeAllPanels();
  }

  function handleRoleChange() {
    setRefreshKey((k) => k + 1);
  }

  function handleProfileSaved() {
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar-container">
          <ProfileSidebar 
            user={{
              name: user?.displayName,
              email: user?.email,
            }}
            onEdit={openEditProfile} 
            onLogout={logout} 
          />
          
          <AddedDogs 
            dogs={addedDogs} 
            onAddClick={() => openDogForm('add')}
            onDogClick={(dog) => openDogForm({ dog })}
          />
        </div>
        <div className="profile-main-content">
          {showEdit ? (
            <EditProfilePanel 
              onBack={closeAllPanels} 
              profileData={profileData} 
              onRoleChange={handleRoleChange}
              onSaved={handleProfileSaved}
            />
          ) : dogFormMode ? (
            <DogFormPanel
              dog={dogFormMode === 'add' ? null : dogFormMode.dog}
              onBack={closeAllPanels}
              onSave={handleDogSave}
            />
          ) : (
            <>
              <FavoriteDogs dogs={favoriteDogs} />
              <Reviews reviews={reviews} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
