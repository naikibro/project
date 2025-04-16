import Footer from "src/components/common/Footer";
import Navbar from "src/components/common/navbar/Navbar";
import ThemeRegistry from "src/themes/ThemeRegistry";
import "../../styles/globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeRegistry>
      <Navbar />
      {children}
      <Footer />
      <Toaster />
    </ThemeRegistry>
  );
}
