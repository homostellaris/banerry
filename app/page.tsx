'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	BookOpen,
	GraduationCap,
	Sparkles,
	Volume2,
	Users,
	Play,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from './_common/header'
import Logo from './_common/logo'
import PWAInstall from './_common/pwa-install'
import RecentLearners from './_learners/recent'

function MosaicChunk({
	className,
	style,
}: {
	className?: string
	style?: React.CSSProperties
}) {
	return (
		<div
			className={`absolute pointer-events-none ${className}`}
			style={style}
			aria-hidden
		/>
	)
}

function CTAButtons() {
	return (
		<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
			<Link href="/mentor">
				<Button className="text-lg py-6 px-8 rounded-xl bg-brand hover:bg-brand/90 text-white">
					<GraduationCap className="mr-2 h-5 w-5" />
					I&apos;m a Mentor
				</Button>
			</Link>
			<Link href="/learner">
				<Button className="text-lg py-6 px-8 rounded-xl bg-brand-highlight hover:bg-brand-highlight/90 text-foreground">
					<Sparkles className="mr-2 h-5 w-5" />
					I&apos;m a Learner
				</Button>
			</Link>
		</div>
	)
}

export default function HomePage() {
	return (
		<>
			<main className="bg-background min-h-screen">
				{/* Section A: Header */}
				<Header>
					<nav>
						<RecentLearners />
					</nav>
				</Header>

				{/* Section B: Hero */}
				<section className="relative overflow-hidden min-h-[70vh] md:min-h-[85vh] flex items-center justify-center">
					<MosaicChunk
						className="w-48 h-48 md:w-72 md:h-72 bg-brand-warm/10 -top-12 -left-16 md:-top-8 md:-left-8"
						style={{
							clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 75%)',
						}}
					/>
					<MosaicChunk
						className="w-36 h-36 md:w-56 md:h-56 bg-brand-highlight/10 top-20 right-0 md:top-16 md:right-12"
						style={{
							clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 0% 100%)',
						}}
					/>
					<MosaicChunk
						className="w-32 h-32 md:w-48 md:h-48 bg-brand-light/10 bottom-24 -left-8 md:bottom-20 md:left-16"
						style={{
							clipPath: 'polygon(20% 0%, 100% 15%, 80% 100%, 0% 85%)',
						}}
					/>
					<MosaicChunk
						className="w-40 h-40 md:w-64 md:h-64 bg-brand/10 -bottom-12 right-0 md:-bottom-8 md:right-24"
						style={{
							clipPath: 'polygon(0% 20%, 85% 0%, 100% 80%, 15% 100%)',
						}}
					/>
					<MosaicChunk
						className="hidden md:block w-28 h-28 bg-brand-warm/10 top-1/2 left-1/4"
						style={{
							clipPath: 'polygon(10% 0%, 100% 25%, 90% 100%, 0% 75%)',
						}}
					/>

					<div className="relative z-1 flex flex-col items-center text-center px-6 py-20">
						<Logo className="h-24 w-24 mb-8" />
						<h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4">
							Banerry
						</h1>
						<p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-lg text-balance mb-10">
							Communication assistance for visual and gestalt
							language learners
						</p>
						<CTAButtons />
					</div>
				</section>

				{/* Section C: GLP Explainer */}
				<section className="bg-brand/5 py-20 md:py-28 px-6">
					<div className="max-w-2xl mx-auto text-center">
						<p className="text-xs font-semibold tracking-widest uppercase text-brand mb-4">
							Understanding Language
						</p>
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
							Every child communicates differently
						</h2>
						<p className="text-lg text-muted-foreground mb-4">
							Many children learn language in whole chunks — phrases
							picked up from conversations, movies, or songs — rather
							than building words one at a time. This is called
							Gestalt Language Processing, and it&apos;s a natural,
							valid path to communication.
						</p>
						<p className="text-lg text-muted-foreground">
							The name Banerry comes from Alex the African Grey
							Parrot, who combined &ldquo;banana&rdquo; and
							&ldquo;cherry&rdquo; to describe an apple — a perfect
							example of creative, chunked language. Banerry helps
							learners and the people who support them connect
							through these unique ways of communicating.
						</p>
					</div>
				</section>

				{/* Section D: Now Next Then Board Preview */}
				<section className="py-20 md:py-28 px-6">
					<div className="max-w-4xl mx-auto">
						<div className="text-center mb-12">
							<p className="text-xs font-semibold tracking-widest uppercase text-brand-warm mb-4">
								Visual Schedules
							</p>
							<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
								Now, Next, Then boards
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Help make sense of the day with clear visual
								schedules and AI-generated pictures in any art
								style
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-6 mb-8 max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:-mx-6 max-md:px-6 max-md:gap-4">
							{[
								{
									label: 'Now',
									borderColor: 'border-t-brand',
									image: '/brushing-teeth.png',
									caption: 'Brushing teeth',
								},
								{
									label: 'Next',
									borderColor: 'border-t-brand-highlight',
									image: '/eating-breakfast.png',
									caption: 'Eating breakfast',
								},
								{
									label: 'Then',
									borderColor: 'border-t-brand-warm',
									image: '/walking-to-school.png',
									caption: 'Walking to school',
								},
							].map((column) => (
								<Card
									key={column.label}
									className={`border-t-4 ${column.borderColor} max-md:min-w-[260px] max-md:snap-center`}
								>
									<CardContent className="p-5">
										<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
											{column.label}
										</p>
										<div className="rounded-lg overflow-hidden aspect-square mb-3 relative">
											<Image
												src={column.image}
												alt={column.caption}
												fill
												className="object-cover"
											/>
										</div>
										<p className="text-base font-medium text-foreground text-center">
											{column.caption}
										</p>
									</CardContent>
								</Card>
							))}
						</div>

						<div className="flex flex-wrap justify-center gap-2">
							{[
								'Studio Ghibli',
								'Play-Doh',
								'Ladybird Books',
								'AAC Symbols',
							].map((style) => (
								<Badge
									key={style}
									variant="secondary"
									className="text-sm"
								>
									{style}
								</Badge>
							))}
						</div>
					</div>
				</section>

				{/* Section E: Scripts & Audio */}
				<section className="bg-brand-highlight/5 py-20 md:py-28 px-6">
					<div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
						<div>
							<p className="text-xs font-semibold tracking-widest uppercase text-brand mb-4">
								Scripts & Audio
							</p>
							<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
								Practise language with scripts and natural speech
							</h2>
							<p className="text-lg text-muted-foreground mb-6">
								Create scripts that capture the phrases and
								conversations your learner uses. Add stage
								directions for context, then tap to hear them
								spoken in a natural voice.
							</p>
							<ul className="space-y-4">
								<li className="flex items-start gap-3">
									<BookOpen className="h-5 w-5 text-brand mt-0.5 shrink-0" />
									<span className="text-foreground">
										Gestalt scripts with dialogue and
										parenthetical stage directions
									</span>
								</li>
								<li className="flex items-start gap-3">
									<Volume2 className="h-5 w-5 text-brand mt-0.5 shrink-0" />
									<span className="text-foreground">
										Natural text-to-speech so learners can hear
										and rehearse phrases
									</span>
								</li>
							</ul>
						</div>

						<Card className="overflow-hidden">
							<div className="bg-brand/5 px-5 py-3 border-b flex items-center justify-between">
								<span className="text-sm font-semibold text-foreground">
									Morning Greeting
								</span>
								<div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
									<Play className="h-3.5 w-3.5 text-brand ml-0.5" />
								</div>
							</div>
							<CardContent className="p-5 space-y-3">
								<p className="text-foreground">
									&ldquo;Good morning! How are you today?&rdquo;
								</p>
								<p className="text-sm text-muted-foreground italic">
									(waving with a big smile)
								</p>
								<p className="text-foreground">
									&ldquo;I&apos;m good, thank you!&rdquo;
								</p>
								<p className="text-sm text-muted-foreground italic">
									(nodding and making eye contact)
								</p>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Section F: Collaboration */}
				<section className="py-20 md:py-28 px-6">
					<div className="max-w-2xl mx-auto text-center">
						<Users className="h-8 w-8 text-brand mx-auto mb-4" />
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
							Built for teams around a learner
						</h2>
						<p className="text-lg text-muted-foreground mb-8">
							Parents, teachers, and therapists can all collaborate
							on scripts and boards — everyone stays in sync.
						</p>
						<div className="flex justify-center -space-x-3">
							<div className="w-12 h-12 rounded-full bg-brand/80 border-2 border-background" />
							<div className="w-12 h-12 rounded-full bg-brand-highlight/80 border-2 border-background" />
							<div className="w-12 h-12 rounded-full bg-brand-warm/80 border-2 border-background" />
							<div className="w-12 h-12 rounded-full bg-brand-light/80 border-2 border-background" />
						</div>
					</div>
				</section>

				{/* Section G: Bottom CTA + PWA */}
				<section className="bg-brand/5 py-20 md:py-28 px-6">
					<div className="max-w-2xl mx-auto text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
							Ready to get started?
						</h2>
						<CTAButtons />
						<div className="mt-8">
							<PWAInstall />
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
