import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => navigate("/profile")}
        className="bg-green-500 text-white px-6 py-3 rounded"
      >
        Log In (go to Profile)
      </button>
    </div>
  );
}
