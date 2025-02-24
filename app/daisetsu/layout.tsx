"use client";

export default function DaisetsuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen">
      <style jsx global>{`
        body {
          background: black !important;
        }
        header {
          background: transparent !important;
          background-color: transparent !important;
        }
        header h1,
        header nav a {
          opacity: 0.7;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      {children}
    </div>
  );
}
