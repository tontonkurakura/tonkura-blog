"use client";

export default function PhotographsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <style jsx global>{`
        header {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>
      {children}
    </div>
  );
}
