import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideosTable from "./VideosTable";
import { colours, fonts } from "../../../theme/theme";
import videoService from "../../../services/videoService";

/* ── Action Button component matching admin style ── */
const ActionButton = ({ name, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={name}
    style={{
      borderColor: colours.border,
      backgroundColor: colours.background,
      fontFamily: fonts.secondary,
    }}
    className="group flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium duration-300 shadow-sm"
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = colours.accent;
      e.currentTarget.style.backgroundColor = colours.primary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = colours.border;
      e.currentTarget.style.backgroundColor = colours.background;
    }}
  >
    <span
      style={{ color: colours.text }}
      className="transition-colors duration-300 group-hover:text-[#A77C6B] flex items-center gap-2 font-medium"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {name}
    </span>
  </button>
);

const CMSVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await videoService.getAdminVideos();
      setVideos(data.videos ?? []);
    } catch (err) {
      setError(err.message || "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleEdit = (video) => {
    navigate(`/admin/content/video/edit/${video.id}`);
  };

  const handleDelete = async (video) => {
    await videoService.deleteVideo(video.id);
  };

  const handleDeleted = (deletedVideo) => {
    setVideos((prev) => prev.filter((v) => v.id !== deletedVideo.id));
  };

  return (
    <div
      className="px-6 py-8 animate-in fade-in duration-300 min-h-screen"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            Video Content
          </h1>

          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage uploaded videos and link them with your products catalog.
          </p>
        </div>

        <ActionButton
          name="Add Video"
          onClick={() => navigate("/admin/content/video/add")}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading video catalog...
        </p>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-8 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* Videos table */}
      {!loading && !error && (
        <VideosTable
          videos={videos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default CMSVideos;
