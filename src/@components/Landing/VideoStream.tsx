export default function VideoStream({ landingData }: any) {
  // Convert normal YouTube URL to embed + autoplay
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2] ? match[2] : null;
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
      : "";
  };

  return (
    <div className="bg-cream py-4">
      <div className="max-w-layout mx-auto">
        <div className="premium-section-title py-4 rounded-xl lg:w-[500px] mx-auto mb-4">
          <h2 className="text-center text-2xl font-extrabold">
            আমাদের সম্মানিত কাস্টমারদের মতামত ⬇
          </h2>
        </div>
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src={getYouTubeEmbedUrl(landingData?.video_url)}
            title="YouTube video player"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
