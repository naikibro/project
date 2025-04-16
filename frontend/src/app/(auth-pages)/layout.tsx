import Footer from "src/components/common/Footer";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>{children}</div>
      <Footer />
    </>
  );
}
