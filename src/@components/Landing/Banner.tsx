export default function Banner({ landingData }: any) {
  return (
    <div className="bg-cream py-12 md:px-2 px-3">
      <div className="max-w-layout mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center premium-text-gradient">
          {landingData?.headline}
        </h1>
        <h3 className="text-lg text-center font-bold border-2 border-gold/40 rounded-xl p-5 bg-white shadow-[var(--shadow-premium)] text-primary">
          {landingData?.description}
        </h3>
      </div>
    </div>
  );
}
