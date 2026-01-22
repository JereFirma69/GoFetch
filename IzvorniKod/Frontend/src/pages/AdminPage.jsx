import React, { useEffect, useState, useContext } from "react";
import SearchFilterTable from "../shared_components/SearchFilterTable";
import ProfileModal from "../shared_components/ProfileModal";
import ActionModal from "../shared_components/ActionModal";
import PricingForm from "../shared_components/PricingForm";
import { adminApi } from "../utils/adminApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import verifiedBadge from "../assets/verification.png";

function useAdminGuard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const currentUser = user || parsed;
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/homepage", { replace: true });
    }
  }, [user, navigate]);
}

export default function AdminPage() {
  useAdminGuard();

  const [tab, setTab] = useState("verification");
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [userRole, setUserRole] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [profile, setProfile] = useState(null);
  const [action, setAction] = useState({ open: false, type: "", walkerId: null });
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    if (tab === "verification") loadPending();
  }, [tab, verificationStatus]);

  useEffect(() => {
    if (tab === "users") loadUsers();
  }, [tab, userRole, searchQ]);

  useEffect(() => {
    if (tab === "pricing") loadPricing();
  }, [tab]);

  const loadPending = async () => {
    try {
      const data = await adminApi.getWalkers(verificationStatus);
      setPending(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers({ role: userRole, q: searchQ });
      setUsers(data?.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPricing = async () => {
    try {
      const data = await adminApi.getPricing();
      setPricing({
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        currency: data.currency,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const approve = async (walkerId) => {
    setLoading(true);
    try {
      await adminApi.approveWalker(walkerId);
      await loadPending();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setAction({ open: false, type: "", walkerId: null });
    }
  };

  const reject = async (walkerId) => {
    setLoading(true);
    try {
      await adminApi.rejectWalker(walkerId);
      await loadPending();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setAction({ open: false, type: "", walkerId: null });
    }
  };

  const onSavePricing = async (values) => {
    setSavingPrice(true);
    try {
      const data = await adminApi.updatePricing({
        monthlyPrice: values.monthlyPrice,
        yearlyPrice: values.yearlyPrice,
        currency: values.currency,
      });
      setPricing({
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        currency: data.currency,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrice(false);
    }
  };

  const avatarCell = (pic, name) => (
    <div className="flex items-center gap-2">
      {pic ? (
        <img src={pic} alt={name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
          {name?.charAt(0) || "?"}
        </div>
      )}
    </div>
  );

  const verificationColumns = [
    { key: "profilePicture", title: "", render: (r) => avatarCell(r.profilePicture, `${r.firstName} ${r.lastName}`) },
    { key: "name", title: "Name", render: (r) => `${r.firstName} ${r.lastName}` },
    { key: "email", title: "Email" },
    { key: "location", title: "Location" },
    { key: "phone", title: "Phone" },
    { key: "verificationStatus", title: "Status", render: (r) => r.verificationStatus },
  ];

  const verificationData = pending
    .filter((p) => {
      if (!searchQ) return true;
      const q = searchQ.toLowerCase();
      return (
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    })
    .map((p) => ({
      ...p,
      name: `${p.firstName} ${p.lastName}`,
      isVerified: p.isVerified === true,
    }));

  const userColumns = [
    { key: "profilePicture", title: "", render: (r) => avatarCell(r.profilePicture, r.name) },
    { key: "name", title: "Name", render: (r) => `${r.firstName || ""} ${r.lastName || ""}`.trim() },
    { key: "email", title: "Email" },
    { key: "role", title: "Role" },
    { key: "location", title: "Location" },
    { key: "phone", title: "Phone" },
    {
      key: "isVerified",
      title: "Verified",
      render: (r) =>
        r.isVerified === true ? (
          <div className="flex items-center justify-center">
            <img src={verifiedBadge} alt="Verified" className="w-5 h-5" />
          </div>
        ) : (
          ""
        ),
    },
  ];

  const userData = users
    .filter((u) => {
      if (!searchQ) return true;
      const q = searchQ.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    })
    .map((u) => ({
      ...u,
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      bio: u.bio,
      isVerified: u.isVerified === true,
    }));

  const renderTab = () => {
    if (tab === "verification") {
      return (
        <SearchFilterTable
          title="Walker Verification"
          filters={[
            { value: "", label: "All" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
          activeFilter={verificationStatus}
          onFilterChange={setVerificationStatus}
          searchValue={searchQ}
          onSearchChange={setSearchQ}
          columns={verificationColumns}
          data={verificationData}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                onClick={() => setProfile({
                  name: `${row.firstName} ${row.lastName}`,
                  email: row.email,
                  location: row.location,
                  phone: row.phone,
                  profilePicture: row.profilePicture,
                  bio: row.bio,
                  walkerId: row.walkerId,
                  isVerified: row.isVerified === true,
                })}
                className="px-3 py-1 text-sm rounded border border-gray-300"
              >
                View
              </button>
              <button
                onClick={() => setAction({ open: true, type: "approve", walkerId: row.walkerId })}
                className="px-3 py-1 text-sm rounded bg-emerald-600 text-white"
              >
                Approve
              </button>
              <button
                onClick={() => setAction({ open: true, type: "reject", walkerId: row.walkerId })}
                className="px-3 py-1 text-sm rounded bg-red-600 text-white"
              >
                Reject
              </button>
            </div>
          )}
        />
      );
    }

    if (tab === "users") {
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {[
              { value: "", label: "All" },
              { value: "owner", label: "Owners" },
              { value: "walker", label: "Walkers" },
              { value: "admin", label: "Admins" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setUserRole(f.value)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  userRole === f.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <SearchFilterTable
            title="Users"
            filters={[]}
            activeFilter=""
            onFilterChange={() => {}}
            searchValue={searchQ}
            onSearchChange={setSearchQ}
            columns={userColumns}
            data={userData}
            actions={(row) => (
              <button
                onClick={() => setProfile({
                  name: row.name,
                  email: row.email,
                  location: row.location,
                  phone: row.phone,
                  role: row.role,
                  profilePicture: row.profilePicture,
                  bio: row.bio,
                  isVerified: row.isVerified === true,
                  walkerId: row.role === "walker" ? row.userId : undefined,
                  extra: [],
                })}
                className="px-3 py-1 text-sm rounded border border-gray-300"
              >
                View
              </button>
            )}
          />
        </div>
      );
    }

    if (tab === "pricing") {
      return <PricingForm initial={pricing} onSave={onSavePricing} loading={savingPrice} />;
    }

    return null;
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Admin Dashboard</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ key: "verification", label: "Verification" }, { key: "users", label: "Users" }, { key: "pricing", label: "Pricing" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid",
                  borderColor: tab === t.key ? "#2563eb" : "#e5e7eb",
                  background: tab === t.key ? "#2563eb" : "#fff",
                  color: tab === t.key ? "#fff" : "#0f172a",
                  fontWeight: 600,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 8px 30px rgba(0,0,0,0.05)", padding: 18 }}>
          {renderTab()}
        </div>

        <ProfileModal open={!!profile} onClose={() => setProfile(null)} profile={profile} />

        <ActionModal
          open={action.open}
          title={action.type === "approve" ? "Approve walker" : "Reject walker"}
          message={action.type === "approve" ? "Approve this walker?" : "Reject this walker?"}
          confirmText={action.type === "approve" ? "Approve" : "Reject"}
          onConfirm={() => {
            if (action.type === "approve") approve(action.walkerId);
            else reject(action.walkerId);
          }}
          onCancel={() => setAction({ open: false, type: "", walkerId: null })}
        />
      </div>
    </div>
  );
}
