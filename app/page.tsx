'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Header from './_common/header'
import Logo from './_common/logo'
import PWAInstall from './_common/pwa-install'
import RecentLearners from './_learners/recent'

export default function HomePage() {
	return (
		<>
			<main className="bg-gradient-to-b from-green-50 via-amber-50 to-emerald-50 min-h-screen">
				<Header>
					<nav>
						<RecentLearners />
					</nav>
				</Header>

				<div className="flex flex-col items-center justify-center p-6 pt-24 text-center">
					<div className="max-w-5xl mx-auto space-y-12">
						<div className="space-y-6">
							<div className="inline-block animate-bounce">
								<Logo className="h-20 w-20" />
							</div>
							<h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-brand via-brand-highlight to-brand-warm bg-clip-text text-transparent">
								Banerry
							</h1>
							<p className="text-2xl md:text-3xl font-bold text-brand">
								Communication assistance for visual and gestalt language
								learners
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
							<Link href="/mentor">
								<Button className="text-xl py-8 px-12 rounded-full bg-brand-warm hover:bg-brand-warm/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
									<span className="mr-2">👩‍🏫</span>
									I&apos;m a Mentor
								</Button>
							</Link>
							<Link href="/learner">
								<Button className="text-xl py-8 px-12 rounded-full bg-brand-light hover:bg-brand-light/90 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
									<span className="mr-2">🌟</span>
									I&apos;m a Learner
								</Button>
							</Link>
						</div>

						<div className="grid md:grid-cols-3 gap-6 pt-8">
							<div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-brand/20">
								<div className="text-5xl mb-4">📋</div>
								<h3 className="text-xl font-bold text-brand mb-2">
									Now Next Then Boards
								</h3>
								<p className="text-gray-600">
									See what&apos;s happening with colorful pictures that make
									schedules easy to understand
								</p>
							</div>

							<div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-brand-warm/30">
								<div className="text-5xl mb-4">🔊</div>
								<h3 className="text-xl font-bold text-brand-warm mb-2">
									Listen &amp; Learn
								</h3>
								<p className="text-gray-600">
									Tap to hear words spoken out loud with friendly voices
								</p>
							</div>

							<div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-brand-light/30">
								<div className="text-5xl mb-4">🤝</div>
								<h3 className="text-xl font-bold text-brand-light mb-2">
									Collaborate
								</h3>
								<p className="text-gray-600">
									Shared access to edit learner scripts & boards
								</p>
							</div>
						</div>

						<div className="pt-8">
							<div className="bg-gradient-to-r from-brand/10 via-brand-warm/10 to-brand-highlight/10 p-8 rounded-3xl max-w-4xl mx-auto border-2 border-brand/20">
								<h2 className="text-2xl md:text-3xl font-bold text-brand mb-6">
									Now Next Then Boards
								</h2>
								<p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
									Help make sense of the day with visual schedules and beautiful
									AI-generated pictures
								</p>
								<div className="grid md:grid-cols-3 gap-4">
									<div className="bg-white/90 p-6 rounded-2xl shadow-md border-2 border-green-300">
										<div className="text-4xl mb-2">🟢</div>
										<div className="text-2xl font-bold text-green-600 mb-1">
											Now
										</div>
										<p className="text-gray-600 text-sm">
											What we&apos;re doing right now
										</p>
									</div>
									<div className="bg-white/90 p-6 rounded-2xl shadow-md border-2 border-yellow-300">
										<div className="text-4xl mb-2">🟡</div>
										<div className="text-2xl font-bold text-yellow-600 mb-1">
											Next
										</div>
										<p className="text-gray-600 text-sm">
											What comes after this
										</p>
									</div>
									<div className="bg-white/90 p-6 rounded-2xl shadow-md border-2 border-blue-300">
										<div className="text-4xl mb-2">🔵</div>
										<div className="text-2xl font-bold text-blue-600 mb-1">
											Then
										</div>
										<p className="text-gray-600 text-sm">
											What happens at the end
										</p>
									</div>
								</div>
								<div className="mt-8 flex flex-wrap justify-center gap-3">
									<span className="bg-white/80 px-4 py-2 rounded-full text-sm font-medium text-brand border border-brand/20">
										🎨 Fun art styles
									</span>
									<span className="bg-white/80 px-4 py-2 rounded-full text-sm font-medium text-brand-warm border border-brand-warm/20">
										🎤 Voice input
									</span>
									<span className="bg-white/80 px-4 py-2 rounded-full text-sm font-medium text-brand-light border border-brand-light/30">
										⏱️ Built-in timers
									</span>
									<span className="bg-white/80 px-4 py-2 rounded-full text-sm font-medium text-brand-highlight border border-brand-highlight/40">
										🤖 AI pictures
									</span>
								</div>
							</div>
						</div>

						<div className="pt-8 pb-8">
							<div className="bg-white/70 backdrop-blur p-8 rounded-3xl max-w-3xl mx-auto border-2 border-brand/20">
								<h2 className="text-xl md:text-2xl font-bold text-brand mb-4">
									What is Gestalt Language Processing?
								</h2>
								<p className="text-gray-700 leading-relaxed">
									Some people learn language in chunks—whole phrases from
									conversations, movies, or songs. Banerry helps everyone
									understand these special ways of communicating, making it
									easier for learners and the people who love them to connect.
								</p>
							</div>
						</div>

						<PWAInstall />
					</div>
				</div>
			</main>
		</>
	)
}
