#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
PORT=6614
OG_PAGE="$ROOT/app/og/page.tsx"
CYPRESS_SPEC="$ROOT/cypress/e2e/og-screenshot.cy.ts"

cleanup() {
  rm -f "$OG_PAGE" && rmdir "$ROOT/app/og" 2>/dev/null || true
  rm -f "$CYPRESS_SPEC"
  kill "$(lsof -ti:$PORT)" 2>/dev/null || true
}
trap cleanup EXIT

mkdir -p "$ROOT/app/og"
cat > "$OG_PAGE" << 'EOF'
import Logo from '../_common/logo'

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

export default function OgPage() {
	return (
		<main className="bg-background h-screen flex items-center justify-center relative overflow-hidden">
			<MosaicChunk
				className="w-72 h-72 bg-brand-warm/10 -top-8 -left-8"
				style={{
					clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 75%)',
				}}
			/>
			<MosaicChunk
				className="w-56 h-56 bg-brand-highlight/10 top-16 right-12"
				style={{
					clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 0% 100%)',
				}}
			/>
			<MosaicChunk
				className="w-48 h-48 bg-brand-light/10 bottom-20 left-16"
				style={{
					clipPath: 'polygon(20% 0%, 100% 15%, 80% 100%, 0% 85%)',
				}}
			/>
			<MosaicChunk
				className="w-64 h-64 bg-brand/10 -bottom-8 right-24"
				style={{
					clipPath: 'polygon(0% 20%, 85% 0%, 100% 80%, 15% 100%)',
				}}
			/>
			<MosaicChunk
				className="w-28 h-28 bg-brand-warm/10 top-1/2 left-1/4"
				style={{
					clipPath: 'polygon(10% 0%, 100% 25%, 90% 100%, 0% 75%)',
				}}
			/>

			<div className="relative z-1 flex flex-col items-center text-center">
				<Logo className="h-24 w-24 mb-8" />
				<h1 className="text-7xl font-extrabold text-foreground mb-4">
					Banerry
				</h1>
				<p className="text-2xl font-medium text-muted-foreground max-w-lg text-balance">
					Communication assistance for visual and gestalt language
					learners
				</p>
			</div>
		</main>
	)
}
EOF

cat > "$CYPRESS_SPEC" << 'EOF'
it('captures the OG image', () => {
	cy.viewport(1200, 630)
	cy.visit('/og')
	cy.get('main').should('be.visible')
	cy.screenshot('opengraph-image', { capture: 'viewport' })
})
EOF

echo "Building..."
cd "$ROOT"
bun run build

echo "Starting production server on port $PORT..."
bun start -p "$PORT" &
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/og" 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 1
done

echo "Capturing screenshot..."
bunx cypress run --spec cypress/e2e/og-screenshot.cy.ts --config "baseUrl=http://localhost:$PORT"

cp "$ROOT/cypress/screenshots/og-screenshot.cy.ts/opengraph-image.png" "$ROOT/app/opengraph-image.png"
echo "Done — app/opengraph-image.png updated"
