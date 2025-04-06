import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (location.pathname === "/profile") {
      navigate(-1); // Go back or use navigate('/') to go home
    } else {
      navigate("/profile");
    }
  };
  const handleSettingsClick = () => {
    if (location.pathname === "/settings") {
      navigate(-1); // or navigate('/')
    } else {
      navigate("/settings");
    }
  };
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">CollabX</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSettingsClick}
              className="btn btn-sm gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            {authUser && (
              <>
                <button
                  onClick={handleProfileClick}
                  className="btn btn-sm gap-2"
                >
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
