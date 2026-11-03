import { useState } from "react";
import { colours, fonts } from "../../../theme/theme";
import videoService from "../../../services/videoService";
import TableTemplate from "../TableTemplate";

const EditIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const VideosTable = ({ videos = [], onEdit, onDelete, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);

  const handleDelete = async (video) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete video "${video.title || video.product_name || "Video#" + video.id}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(video.id);

      if (onDelete) {
        await onDelete(video);
      } else {
        await videoService.deleteVideo(video.id);
      }

      onDeleted?.(video);
    } catch (err) {
      alert(err.message || "Failed to delete video.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "video",
      label: "VIDEO PREVIEW",
      render: (video) => (
        <div className="flex items-center gap-3">
          <div
            className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-black group cursor-pointer"
            onClick={() => setActivePreviewUrl(video.video_url)}
            style={{ borderColor: colours.border }}
          >
            <video
              src={video.video_url}
              className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors text-white">
              <PlayIcon />
            </div>
          </div>

          <div>
            <h3
              className="text-sm font-semibold truncate max-w-xs"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              {video.title || "Untitled Video"}
            </h3>
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs truncate block max-w-[200px] hover:underline"
              style={{ color: colours.accent }}
              onClick={(e) => e.stopPropagation()}
            >
              Open File Link
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "PRODUCT",
      render: (video) => (
        <span
          className="text-sm font-medium"
          style={{ color: colours.text }}
        >
          {video.product_name || "General / Unlinked"}
        </span>
      ),
    },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (video) => (
        <p
          className="text-xs leading-relaxed line-clamp-2 max-w-xs"
          style={{ color: colours.mutedText }}
        >
          {video.description || "—"}
        </p>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (video) => {
        const isPublished = video.status === "published" && video.is_active;
        return (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: isPublished ? colours.primary : "#FEF3C7",
              color: isPublished ? colours.accent : "#92400E",
            }}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "DATE",
      render: (video) => (
        <span className="text-sm" style={{ color: colours.mutedText }}>
          {video.created_at
            ? new Date(video.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (video) => {
        const isDeleting = deletingId === video.id;
        return (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(video)}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: colours.accent,
                backgroundColor: colours.background,
              }}
              aria-label={`Edit video ${video.title}`}
            >
              <EditIcon />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(video)}
              disabled={isDeleting}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: "#A44A3F",
                backgroundColor: colours.background,
              }}
              aria-label={`Delete video ${video.title}`}
            >
              {isDeleting ? "..." : <DeleteIcon />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="mt-8">
      <TableTemplate
        columns={columns}
        data={videos}
        emptyLabel="No video content uploaded yet."
      />

      {/* Video Modal Preview */}
      {activePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer border-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full">
              <video
                src={activePreviewUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosTable;
