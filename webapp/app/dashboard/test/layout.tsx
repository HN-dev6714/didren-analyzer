export default function TestLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-8">
      {children}   
      {modal}
    </div>
  );
}