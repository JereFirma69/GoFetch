import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeHero() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Dobrodošli u <span className="text-teal-500">PawPal</span> 🐾
      </h1>

      <p className="text-gray-600 text-lg max-w-xl mb-8">
        Povežite se s vlasnicima pasa i šetačima u vašem gradu.
        Organizirajte šetnje, dijelite iskustva i pronađite nove prijatelje –
        za vas i vašeg psa!
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium"
        >
          Započni odmah
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Već imam račun
        </button>
      </div>
    </section>
  );
}
