"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "./_common/header";
import PWAInstall from "./_common/pwa-install";
import RecentLearners from "./_learners/recent";

export default function HomePage() {
  return (
    <>
      <main>
        <Header>
          <nav>
            <RecentLearners />
          </nav>
        </Header>

        {/* Hero Section */}
        <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-purple-700 mb-4">
                Banerry
              </h1>
              <p className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
                Unlock the Power of Scripts
              </p>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Communication assistance designed for gestalt language processors—helping learners and mentors bridge understanding through meaningful scripts
              </p>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/mentor">
                <Button className="text-xl py-6 px-10 w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-shadow">
                  Start as Mentor
                </Button>
              </Link>
              <Link href="/learner">
                <Button
                  className="text-xl text-purple-700 py-6 px-10 w-full sm:w-auto min-w-[200px] border-2 border-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all"
                  variant="outline"
                >
                  Start as Learner
                </Button>
              </Link>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8 pt-12 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🗣️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Text-to-Speech
                </h3>
                <p className="text-gray-600">
                  High-quality audio playback with customizable voices, making communication accessible and natural
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Works Offline
                </h3>
                <p className="text-gray-600">
                  Progressive Web App that works anywhere, anytime—even without an internet connection
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Mentor Support
                </h3>
                <p className="text-gray-600">
                  Connect mentors with learners to build contextual understanding and meaningful communication
                </p>
              </div>
            </div>

            {/* What is Gestalt Language Processing */}
            <div className="pt-12 pb-8">
              <div className="bg-purple-100 p-8 rounded-lg max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-purple-900 mb-4">
                  What is Gestalt Language Processing?
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Some people learn language in chunks or "scripts"—whole phrases picked up from conversations, media, or experiences. Banerry helps decode these scripts by providing context and meaning, making communication clearer for both learners and those supporting them.
                </p>
              </div>
            </div>

            <PWAInstall />
          </div>
        </div>
      </main>
    </>
  );
}
