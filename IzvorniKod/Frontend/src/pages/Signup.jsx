import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => navigate("/profile")}
        className="bg-purple-500 text-white px-6 py-3 rounded"
      >
        Sign Up (go to Profile)
      </button>
    </div>
  );
}
