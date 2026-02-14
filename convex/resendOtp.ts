import { Email } from '@convex-dev/auth/providers/Email'
import { Resend as ResendAPI } from 'resend'
import { alphabet, generateRandomString } from 'oslo/crypto'

const useOtpOverride =
	process.env.OTP_OVERRIDE &&
	!(
		process.env.VERCEL_PROJECT_PRODUCTION_URL &&
		process.env.CONVEX_SITE_URL?.includes(
			process.env.VERCEL_PROJECT_PRODUCTION_URL,
		)
	)

export const ResendOTP = Email({
	id: 'resend-otp',
	apiKey: process.env.AUTH_RESEND_KEY,
	maxAge: 60 * 15,
	generateVerificationToken() {
		if (useOtpOverride) {
			return process.env.OTP_OVERRIDE!
		}
		return generateRandomString(8, alphabet('0-9'))
	},
	async sendVerificationRequest({ identifier: email, provider, token }) {
		if (useOtpOverride) {
			return
		}

		const resend = new ResendAPI(provider.apiKey)
		const { error } = await resend.emails.send({
			from: 'no-reply@banerry.app',
			to: [email],
			subject: `Sign in to Banerry`,
			text: 'Your code is ' + token,
		})

		if (error) {
			throw new Error(JSON.stringify(error))
		}
	},
})
