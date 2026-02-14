import { Email } from '@convex-dev/auth/providers/Email'
import { Resend as ResendAPI } from 'resend'
import { alphabet, generateRandomString } from 'oslo/crypto'

export const ResendOTP = Email({
	id: 'resend-otp',
	apiKey: process.env.AUTH_RESEND_KEY,
	maxAge: 60 * 15, // 15 minutes
	// This function can be asynchronous
	generateVerificationToken() {
		return generateRandomString(8, alphabet('0-9'))
	},
	async sendVerificationRequest({ identifier: email, provider, token }) {
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
