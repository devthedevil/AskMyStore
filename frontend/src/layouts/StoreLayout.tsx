import { Outlet } from "react-router-dom";
import StoreNavbar from "../components/StoreNavbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <StoreNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
