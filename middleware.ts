import { NextResponse } from 'next/server'
import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from './convex/_generated/api'

const isSignInPage = createRouteMatcher(['/signin'])
const isProtectedRoute = createRouteMatcher(['/mentor', '/mentor/(.*)'])
const isProtectedApiRoute = createRouteMatcher(['/api/(.*)'])

export default convexAuthNextjsMiddleware(
	async (request, { convexAuth }) => {
		if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
			return nextjsMiddlewareRedirect(request, '/mentor')
		}
		if (isProtectedApiRoute(request) && !(await convexAuth.isAuthenticated())) {
			const passphrase = request.headers.get('X-Learner-Passphrase')
			if (passphrase) {
				const learner = await fetchQuery(api.learners.getLearnerByPassphrase, {
					passphrase,
				})
				if (learner) return
			}
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
			return nextjsMiddlewareRedirect(request, '/signin')
		}
	},
	{ cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
)

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
