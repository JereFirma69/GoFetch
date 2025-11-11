import React from "react";

export default function HomeFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} PawPal. All rights reserved.
    </footer>
  );
}
