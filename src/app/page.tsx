"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { InteractivePlayground } from "@/components/sections/InteractivePlayground";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { Footer } from "@/components/sections/Footer";
import { AboutModal } from "@/components/modals/AboutModal";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("ipv4");
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  const handleExploreClick = () => {
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative selection:bg-brand-purple/30 selection:text-white">
      {/* Top Fixed / Sticky Navigation Bar */}
      <Navbar
        onOpenAbout={() => setAboutModalOpen(true)}
        onSelectTab={handleSelectTab}
        activeTab={activeTab}
      />

      {/* Semantic Main Content Container */}
      <main className="flex-1 flex flex-col">
        {/* Flagship Hero with Interactive 3D WebGL Torus & Spatial Nodes */}
        <HeroSection onExploreClick={handleExploreClick} />

        {/* Live Interactive Calculators Suite */}
        <InteractivePlayground
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Feature Grid with Layered Glassmorphic Cards */}
        <FeaturesGrid onSelectFeature={handleSelectTab} />
      </main>

      {/* Semantic Footer with Hardened Links & Developer Attribution */}
      <Footer
        onOpenAbout={() => setAboutModalOpen(true)}
        onSelectTab={handleSelectTab}
      />

      {/* Accessible Dialog Modal for About & Quick Start RFC Guide */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
}

