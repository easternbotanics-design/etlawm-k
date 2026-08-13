import { useAuth } from "../../context/AuthContext";
import { colours, fonts } from "../../theme/theme";

const UserHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <div 
        className="rounded-2xl border p-8 bg-white"
        style={{ borderColor: colours.border }}
      >
        <h2 className="text-xl font-normal text-stone-800" style={{ fontFamily: fonts.primary }}>
          Dashboard Overview
        </h2>
        <p className="text-xs text-stone-400 mt-2">
          Manage your account settings, shipping addresses, past order history, and support requests.
        </p>
      </div>
    </div>
  );
};

export default UserHome;
