import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
  if (!videoUrl) return <div className="video-placeholder glass-panel text-center">لم يتم تحديد فيديو</div>;

  // Simple heuristic: if it's youtube, convert to embed. Otherwise standard video tag
  const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  let embedUrl = videoUrl;
  if (isYoutube) {
    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }

  return (
    <div className="video-player-container">
      {isYoutube ? (
        <iframe
          src={embedUrl}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-iframe glass-panel"
        ></iframe>
      ) : (
        <video controls className="video-html5 glass-panel">
          <source src={videoUrl} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
