import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import ImageUpload from "../../shared_components/ImageUpload";
import defaultDogPic from "../../assets/profileDog.jpg";

export default function DogFormPanel({ dog, onBack, onSave }) {
  const isEditing = !!dog;

  const [name, setName] = useState("");
  const [treats, setTreats] = useState("");
  const [socialization, setSocialization] = useState("Friendly");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [healthNotes, setHealthNotes] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (dog) {
      setName(dog.imePas || "");
      setTreats(dog.poslastice || "");
      setSocialization(dog.socijalizacija || "Friendly");
      setEnergyLevel(dog.razinaEnergije || 3);
      setHealthNotes(dog.zdravstveneNapomene || "");
      setAge(dog.starost || "");
      setBreed(dog.pasmina || "");
      setProfilePicture(dog.profilnaPas || "");
      setPendingFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    } else {
      // Reset form when opening "Add Dog"
      setName("");
      setTreats("");
      setSocialization("Friendly");
      setEnergyLevel(3);
      setHealthNotes("");
      setAge("");
      setBreed("");
      setProfilePicture("");
      setPendingFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    }
  }, [dog]);

  // Cleanup blob URL on unmount only
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        imePas: name,
        poslastice: treats,
        socijalizacija: socialization,
        razinaEnergije: parseInt(energyLevel),
        zdravstveneNapomene: healthNotes || null,
        starost: parseInt(age),
        pasmina: breed,
        // For new dogs, avoid sending base64 or temp preview URL
        // The real image will be uploaded after the dog is created
        profilnaPas: isEditing ? (profilePicture || "") : "",
      };

      if (isEditing) {
        await api.put(`/profile/dogs/${dog.idPas}`, payload);
      } else {
        const created = await api.post("/profile/dogs", payload);
        // If user selected an image before creating, upload it now
        if (pendingFile && created?.idPas) {
          const data = await api.upload(`/upload/dog/${created.idPas}`, pendingFile);
          setProfilePicture(data.url);
        }
      }

      onSave?.();
      onBack?.();
    } catch (e) {
      setError(e.message || "Failed to save dog");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/profile/dogs/${dog.idPas}`);
      onSave?.();
      onBack?.();
    } catch (e) {
      setError(e.message || "Failed to delete dog");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="edit-panel">
      <div className="edit-panel-header">
        <button className="back-arrow" onClick={() => onBack?.()} aria-label="Back">
          ←
        </button>
        <h2 className="edit-panel-title">{isEditing ? `Edit ${dog.imePas}` : "Add Dog"}</h2>
      </div>
      <form onSubmit={handleSave} className="edit-panel-content">
        {error && <div className="form-error">{error}</div>}

        <section className="form-section">
          <h3 className="section-title">Basic Info</h3>
          <div className="form-grid">
            <label className="form-field">
              <span>Name *</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="form-field">
              <span>Age (years) *</span>
              <input
                required
                type="number"
                min="0"
                max="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
            <label className="form-field full">
              <span>Breed *</span>
              <input required value={breed} onChange={(e) => setBreed(e.target.value)} />
            </label>
          </div>
          <ImageUpload
            label="Profile Picture"
            currentUrl={previewUrl || profilePicture}
            onUpload={async (file) => {
              if (!dog?.idPas) {
                // For new dogs, store file and show a local preview
                // Revoke old blob URL before creating new one
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }
                setPendingFile(file);
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
              } else {
                // For existing dogs, upload immediately
                const data = await api.upload(`/upload/dog/${dog.idPas}`, file);
                setProfilePicture(data.url);
              }
            }}
            onDelete={async () => {
              if (dog?.idPas) {
                await api.delete(`/upload/dog/${dog.idPas}`);
              }
              setProfilePicture("");
              setPendingFile(null);
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl("");
              }
            }}
          />
        </section>

        <section className="form-section">
          <h3 className="section-title">Behavior & Care</h3>
          <div className="form-grid">
            <label className="form-field full">
              <span>Favorite Treats / Food Preferences *</span>
              <input
                required
                placeholder="e.g., Chicken treats, no beef"
                value={treats}
                onChange={(e) => setTreats(e.target.value)}
              />
            </label>
            <label className="form-field full">
              <span>Socialization *</span>
              <select
                required
                value={socialization}
                onChange={(e) => setSocialization(e.target.value)}
              >
                <option value="Friendly">Friendly - loves other dogs</option>
                <option value="Selective">Selective - depends on the dog</option>
                <option value="Prefers alone">Prefers alone - not social with other dogs</option>
              </select>
            </label>
            <label className="form-field full">
              <span>Energy Level: {energyLevel} {energyLevel === 1 ? "(Calm)" : energyLevel === 5 ? "(High Energy)" : ""}</span>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="energy-slider"
              />
              <div className="slider-labels">
                <span>Calm</span>
                <span>High Energy</span>
              </div>
            </label>
            <label className="form-field full">
              <span>Health Notes (optional)</span>
              <textarea
                rows="3"
                placeholder="Any health issues, medications, or special needs..."
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
              />
            </label>
          </div>
        </section>

        <div className="edit-panel-actions">
          {isEditing && (
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? "Removing..." : "Remove Dog"}
            </button>
          )}
          <div className="flex-1" />
          <button type="button" className="btn-secondary" onClick={() => onBack?.()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving || deleting}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Dog"}
          </button>
        </div>
      </form>
    </div>
  );
}
