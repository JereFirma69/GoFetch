import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";
import ImageUpload from "../../shared_components/ImageUpload";

export default function EditProfilePanel({ onBack, profileData, onRoleChange, onSaved }) {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: profileData?.firstName || user?.firstName || "",
    lastName: profileData?.lastName || user?.lastName || "",
    email: profileData?.email || user?.email || "",
    profilePicture: profileData?.profilePicture || user?.profilePicture || "",
    walker: {
      location: profileData?.walker?.location || "",
      phone: profileData?.walker?.phone || "",
      profilePicture: profileData?.walker?.profilePicture || "",
    },
  });

  const initialIsOwner = profileData?.owner != null || user?.role === "owner" || user?.role === "both";
  const initialIsWalker = profileData?.walker != null || user?.role === "walker" || user?.role === "both";
  const [ownerEnabled, setOwnerEnabled] = useState(initialIsOwner);
  const [walkerEnabled, setWalkerEnabled] = useState(initialIsWalker);

  const [saving, setSaving] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState("");
  const [rolesError, setRolesError] = useState("");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    }));
  }, [user]);

  useEffect(() => {
    if (profileData) {
      setOwnerEnabled(!!profileData.owner);
      setWalkerEnabled(!!profileData.walker);

      setFormData((prev) => ({
        ...prev,
        firstName: profileData.firstName ?? prev.firstName,
        lastName: profileData.lastName ?? prev.lastName,
        email: profileData.email ?? prev.email,
        profilePicture: profileData.profilePicture ?? prev.profilePicture,
        walker: profileData.walker
          ? {
              location: profileData.walker.location || "",
              phone: profileData.walker.phone || "",
              profilePicture: profileData.walker.profilePicture || "",
            }
          : prev.walker,
      }));
    }
  }, [profileData]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        profilePicture: formData.profilePicture || null,
        walkerDetails: walkerEnabled
          ? {
              location: formData.walker.location || "",
              phone: formData.walker.phone || "",
              walkerProfilePicture: formData.walker.profilePicture || null,
            }
          : null,
      };

      const data = await api.put("/profile", payload);
      
      const updatedUser = {
        ...user,
        role: data.role,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
      };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  setUser(updatedUser);
  onSaved?.(data);
  onBack?.();
    } catch (e) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRole(role, value) {
    setRolesLoading(true);
    setRolesError("");
    try {
      if (role === "owner" && value === false && profileData?.owner?.dogs?.length > 0) {
        setRolesError("Remove all dogs before disabling owner role.");
        setRolesLoading(false);
        return;
      }

      const currentlyHasRole =
        (role === "owner" && ownerEnabled) || (role === "walker" && walkerEnabled);

      let data;
      if (currentlyHasRole && value === false) {
        if (role === "walker") {
          const saved = {
            location: formData.walker.location,
            phone: formData.walker.phone,
            walkerProfilePicture: formData.walker.profilePicture,
          };
          try {
            localStorage.setItem("savedWalkerDetails", JSON.stringify(saved));
          } catch {}
        }
        data = await api.post("/auth/remove-role", { role });
      } else if (!currentlyHasRole && value === true) {
        data = await api.post("/auth/register-role", { role });
        if (role === "walker") {
          try {
            const savedStr = localStorage.getItem("savedWalkerDetails");
            if (savedStr) {
              const saved = JSON.parse(savedStr) || {};
              await api.put("/profile", {
                firstName: null,
                lastName: null,
                profilePicture: null,
                walkerDetails: {
                  location: saved.location || "",
                  phone: saved.phone || "",
                  walkerProfilePicture: saved.walkerProfilePicture || null,
                },
              });
              setFormData((prev) => ({
                ...prev,
                walker: {
                  location: saved.location || "",
                  phone: saved.phone || "",
                  profilePicture: saved.walkerProfilePicture || "",
                },
              }));
              localStorage.removeItem("savedWalkerDetails");
            }
          } catch {}
        }
      } else {
        setRolesLoading(false);
        return;
      }

      const updatedUser = {
        ...user,
        role: data.role,
        displayName: data.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      const newIsOwner = data.role === "owner" || data.role === "both";
      const newIsWalker = data.role === "walker" || data.role === "both";
      setOwnerEnabled(newIsOwner);
      setWalkerEnabled(newIsWalker);

      onRoleChange?.(role, value, data);
    } catch (e) {
      setRolesError(e.message || "Failed to update role");
    } finally {
      setRolesLoading(false);
    }
  }

  return (
    <div className="edit-panel">
      <div className="edit-panel-header">
        <button className="back-arrow" onClick={() => onBack?.()} aria-label="Back">
          ←
        </button>
        <h2 className="edit-panel-title">Edit Profile</h2>
      </div>
      <form onSubmit={handleSave} className="edit-panel-content">
        {error && <div className="form-error">{error}</div>}

        <section className="form-section">
          <h3 className="section-title">General Info</h3>
          <div className="form-grid">
            <label className="form-field">
              <span>First Name</span>
              <input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </label>
            <label className="form-field">
              <span>Last Name</span>
              <input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </label>
            <label className="form-field full">
              <span>Email</span>
              <input value={formData.email} disabled readOnly />
            </label>
          </div>
          <ImageUpload
            label="Profile Picture"
            currentUrl={formData.profilePicture}
            onUpload={async (file) => {
              const data = await api.upload("/upload/avatar", file);
              setFormData((prev) => ({ ...prev, profilePicture: data.url }));
            }}
            onDelete={async () => {
              await api.delete("/upload/avatar");
              setFormData((prev) => ({ ...prev, profilePicture: "" }));
            }}
          />
        </section>

        {walkerEnabled && (
          <section className="form-section">
            <h3 className="section-title">Walker Details</h3>
            <div className="helper-text">
              Walker profile photo is optional. If not set, we'll use your profile picture.
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Location</span>
                <input
                  value={formData.walker.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      walker: { ...prev.walker, location: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input
                  value={formData.walker.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      walker: { ...prev.walker, phone: e.target.value },
                    }))
                  }
                />
              </label>
          </div>
          <ImageUpload
            label="Walker Profile Picture (optional)"
            currentUrl={formData.walker.profilePicture}
            onUpload={async (file) => {
              const data = await api.upload("/upload/walker-avatar", file);
              setFormData((prev) => ({
                ...prev,
                walker: { ...prev.walker, profilePicture: data.url },
              }));
            }}
            onDelete={async () => {
              await api.delete("/upload/avatar");
              setFormData((prev) => ({
                ...prev,
                walker: { ...prev.walker, profilePicture: "" },
              }));
            }}
          />
          </section>
        )}

        <section className="form-section">
          <h3 className="section-title">Roles</h3>
          {rolesError && <div className="form-error">{rolesError}</div>}
          <div className="role-toggle-row">
            <span className="role-label">Owner</span>
            <button
              type="button"
              disabled={rolesLoading}
              className={`role-toggle-btn ${ownerEnabled ? "enabled" : "disabled"}`}
              onClick={() => toggleRole("owner", !ownerEnabled)}
            >
              {ownerEnabled ? "Enabled" : "Enable"}
            </button>
          </div>
          <div className="role-toggle-row">
            <span className="role-label">Walker</span>
            <button
              type="button"
              disabled={rolesLoading}
              className={`role-toggle-btn ${walkerEnabled ? "enabled" : "disabled"}`}
              onClick={() => toggleRole("walker", !walkerEnabled)}
            >
              {walkerEnabled ? "Enabled" : "Enable"}
            </button>
          </div>
        </section>

        <div className="edit-panel-actions">
          <button type="button" className="btn-secondary" onClick={() => onBack?.()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
