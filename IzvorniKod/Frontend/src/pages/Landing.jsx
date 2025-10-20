import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <button
        onClick={() => navigate("/login")}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Go to Login
      </button>
      <button
        onClick={() => navigate("/signup")}
        className="bg-purple-500 text-white px-6 py-3 rounded"
      >
        Go to Signup
      </button>
    </div>
  );
}
