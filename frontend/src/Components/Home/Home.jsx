import React from "react";
import DarkVeil from "../../../Components/DarkVeil/DarkVeil.jsx";
import TextType from "../../../Components/TextType/TextType.jsx";
import CardNav from "../../../Components/CardNav/CardNav.jsx";
import Scanner from "../Scanner/Scanner.jsx";

const Home = () => {
  const username = localStorage.getItem("username") || "User";

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        <span className="text-white font-medium">Hello, {username}</span>
        <a
          href="/logout"
          className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </a>
      </div>
      <DarkVeil />
      <CardNav
        items={[
          {
            label: "Navigation",
            bgColor: "#3b82f6",
            textColor: "#ffffff",
            links: [
              { label: "New Scan", href: "/", ariaLabel: "Start a new scan" },
              { label: "Scan History", href: "/history", ariaLabel: "View past scans" },
              { label: "About Project", href: "/about", ariaLabel: "Learn more" }
            ]
          },
          {
            label: "Resources",
            bgColor: "#8b5cf6",
            textColor: "#ffffff",
            links: [
              { label: "Privacy Guide", href: "#", ariaLabel: "Read privacy guide" },
              { label: "Tracker List", href: "#", ariaLabel: "View tracker list" }
            ]
          }
        ]}
      />
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <TextType
          text={"Website Scanner"}
          typingSpeed={100}
          showCursor={true}
          cursorCharacter={"_"}
        />
        <Scanner />
      </div>
    </>
  );
};

export default Home;
