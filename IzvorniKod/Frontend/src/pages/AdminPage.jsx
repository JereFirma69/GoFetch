import React, { useEffect, useState, useContext } from "react";
import SearchFilterTable from "../shared_components/SearchFilterTable";
import ProfileModal from "../shared_components/ProfileModal";
import ActionModal from "../shared_components/ActionModal";
import PricingForm from "../shared_components/PricingForm";
import { adminApi } from "../utils/adminApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const [profile, setProfile] = useState(null);
  const [action, setAction] = useState({ open: false, type: "", walkerId: null });
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    if (tab === "verification") loadPending();
  }, [tab]);

  useEffect(() => {
    if (tab === "users") loadUsers();
  }, [tab, userRole, searchQ]);

  useEffect(() => {
    if (tab === "pricing") loadPricing();
  }, [tab]);

  const loadPending = async () => {
    try {
      const data = await adminApi.getPendingWalkers();
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

  const verificationColumns = [
    { key: "name", title: "Name", render: (r) => `${r.firstName} ${r.lastName}` },
    { key: "email", title: "Email" },
    { key: "location", title: "Location" },
    { key: "phone", title: "Phone" },
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
    .map((p) => ({ ...p, name: `${p.firstName} ${p.lastName}` }));

  const userColumns = [
    { key: "name", title: "Name", render: (r) => `${r.firstName || ""} ${r.lastName || ""}`.trim() },
    { key: "email", title: "Email" },
    { key: "role", title: "Role" },
    { key: "location", title: "Location" },
    { key: "phone", title: "Phone" },
    { key: "isVerified", title: "Verified", render: (r) => (r.isVerified ? "Yes" : "No") },
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
    }));

  const renderTab = () => {
    if (tab === "verification") {
      return (
        <SearchFilterTable
          title="Walker Verification"
          filters={[{ value: "pending", label: "Pending" }]}
          activeFilter="pending"
          onFilterChange={() => {}}
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
                  extra: [row.isVerified ? "Verified" : "Not verified"],
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
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <div className="text-2xl font-bold text-gray-800">Admin Dashboard</div>
      <div className="flex gap-2 flex-wrap">
        {[{ key: "verification", label: "Verification" }, { key: "users", label: "Users" }, { key: "pricing", label: "Pricing" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-semibold border ${
              tab === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}

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
  );
}
