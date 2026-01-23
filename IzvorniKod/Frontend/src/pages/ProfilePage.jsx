import { useState, useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import FavoriteDogs from "../components/Profile/FavoriteDogs";
import AddedDogs from "../components/Profile/AddedDogs";
import Reviews from "../components/Profile/Reviews";
import EditProfilePanel from "../components/Profile/EditProfilePanel";
import DogFormPanel from "../components/Profile/DogFormPanel";
import BookingHistory from "../components/Profile/BookingHistory";
import gD1 from "../assets/dogImages/goldenRetriver1.jpg";
import gD2 from "../assets/dogImages/goldenRetriver2.jpg";
import p1 from "../assets/dogImages/pug1.jpg";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'default';
  const initialDogId = searchParams.get('dogId');

  const [showEdit, setShowEdit] = useState(initialView === "edit");
  const [dogFormMode, setDogFormMode] = useState(
    initialView === "add-dog"
      ? "add"
      : initialDogId
      ? { dog: { idPas: parseInt(initialDogId) } }
      : null
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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
          const dog = data.owner.dogs.find(
            (d) => d.idPas === parseInt(initialDogId)
          );
          if (dog) {
            setDogFormMode({ dog });
          }
        }
      } catch (e) {
        if (e?.status === 401) {
          // Session expired or unauthorized; logout to clear stale state
          logout();
          return;
        }
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [refreshKey, initialDogId]);

  useEffect(() => {
    if (showEdit) {
      setSearchParams({ view: "edit" });
    } else if (dogFormMode === "add") {
      setSearchParams({ view: "add-dog" });
    } else if (dogFormMode?.dog) {
      setSearchParams({ view: "edit-dog", dogId: dogFormMode.dog.idPas });
    } else {
      setSearchParams({});
    }
  }, [showEdit, dogFormMode, setSearchParams]);

  useEffect(() => {
    async function fetchWalkerReviews() {
      const walkerId = profileData?.walker?.walkerId;
      if (!walkerId) {
        setReviews([]);
        return;
      }

      setLoadingReviews(true);
      try {
        const data = await api.get(`/search/walkers/${walkerId}/reviews?limit=100`);
        setReviews(data || []);
      } catch (e) {
        console.error("Failed to load reviews:", e);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    }

    if (!profileData) return;
    if (showEdit || dogFormMode) return;
    if (activeTab !== "reviews") return;
    fetchWalkerReviews();
  }, [profileData, showEdit, dogFormMode, activeTab]);


  const addedDogs = profileData?.owner?.dogs?.map(dog => ({
      id: dog.idPas,
      name: dog.imePas,
      breed: dog.pasmina,
      image: dog.profilnaPas,
      ...dog,
    })) || [];

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
              role: user?.role,
            }}
            profileData={profileData}
            onEdit={openEditProfile}
            onLogout={logout}
          />

          <AddedDogs
            dogs={addedDogs}
            onAddClick={() => openDogForm("add")}
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
              key={dogFormMode === "add" ? "new" : dogFormMode.dog.idPas}
              dog={dogFormMode === "add" ? null : dogFormMode.dog}
              onBack={closeAllPanels}
              onSave={handleDogSave}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm">
              {/* Tabs */}
              <div className="border-b">
                <div className="flex">
                  {[
                    { key: "reviews", label: "⭐ Reviews" },
                    { key: "settings", label: "📅 Booking History" },
                    { key: "payment", label: "💳 Payment" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? "text-teal-600 border-b-2 border-teal-500 bg-teal-50/50"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "reviews" && (
                  loadingReviews ? (
                    <div className="text-gray-500">Loading reviews...</div>
                  ) : (
                    <Reviews reviews={reviews} />
                  )
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <BookingHistory />
                  </div>
                )}

                {activeTab === "payment" && (
                  <div className="space-y-4 max-w-md">
                    <h3 className="text-lg font-semibold">Premium subskripcija</h3>
                    <p className="text-gray-600">
                      Otključaj premium značajke za 10 €
                    </p>

                    <PayPalButtons
                      createOrder={async () => {
                        const res = await fetch(`${API_URL}/payments/create-order`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify("10.00"),
                        });

                        const data = await res.json();
                        return data.orderId;
                      }}
                      onApprove={async (data) => {
                        const res = await fetch(
                          `${API_URL}/payments/capture-order/${data.orderID}`,
                          { method: "POST" }
                        );

                        const result = await res.json();
                        console.log("CAPTURE RESULT:", result);

                        alert("✅ Plaćanje uspješno ✅");
                      }}
                      onError={(err) => {
                        console.error(err);
                        alert("❌ Greška pri plaćanju ❌");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}