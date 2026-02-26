import { Home, Target, CalendarDays, Trophy, BarChart3, Settings, Camera } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ChangeEvent, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "My Goals", icon: Target, path: "/goals" },
  { title: "Schedule", icon: CalendarDays, path: "/schedule" },
  { title: "Achievements", icon: Trophy, path: "/achievements" },
  { title: "Statistics", icon: BarChart3, path: "/statistics" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const { profile, user, isGuest, updateAvatar } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        updateAvatar(file)
          .then(() => toast.success("Profile photo updated."))
          .catch((error) => {
            console.error("Avatar update error:", error);
            toast.error(error?.message || "Could not update profile photo.");
          });
    };

  const displayName =
    profile?.full_name ||
    (isGuest ? "Guest User" : user?.email?.split("@")[0] || "New User");
  const heightLabel = profile?.height ? `${profile.height} cm` : "-- cm";
  const weightLabel = profile?.weight ? `${profile.weight} kg` : "-- kg";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-30">
      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-border">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          aria-label="Change profile picture"
        >
          <Avatar className="w-20 h-20 ring-3 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} alt="User avatar" className="object-cover" />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-1">
            <Camera className="w-3 h-3" />
          </span>
        </button>
        <h3 className="text-base font-semibold text-card-foreground">{displayName}</h3>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <span>{heightLabel}</span>
          <span className="text-border">|</span>
          <span>{weightLabel}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Profile
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
    </aside>
  );
};

export default Sidebar;
