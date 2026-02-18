import { useEffect, useState } from 'react'

export default function useRecentPassphrase() {
	const [passphrase, setPassphrase] = useState<string | null>(null)

	useEffect(() => {
		setPassphrase(localStorage.getItem('passphrase'))
	}, [])

	return passphrase
}
