import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


let GIS_INITIALIZED = false;

export default function GoogleSignInButton({
  text = "signin_with", //'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  size = "large",
  theme = "outline",
  shape = "rectangular",
  onSuccessNavigate = "/profile",
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { googleLogin } = useContext(AuthContext);

  useEffect(() => {
    const cid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !cid) return;

    try {
      if (!GIS_INITIALIZED) {
        window.google.accounts.id.initialize({
          client_id: cid,
          callback: async (response) => {
            if (response?.credential) {
              const ok = await googleLogin(response.credential);
              if (ok && onSuccessNavigate) navigate(onSuccessNavigate);
            }
          },
          ux_mode: "popup",
        });
        GIS_INITIALIZED = true;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme,
          size,
          text, 
          shape,
        });
      }
    } catch (e) {
    }
  }, [googleLogin, navigate, text, size, theme, shape, onSuccessNavigate]);

  return <div ref={containerRef} style={{ marginBottom: 8 }} />;
}
