import Timer from '@/app/_common/timer'
import { TimerProvider } from '@/app/_common/timer-context'

function mountTimer() {
	cy.mount(
		<TimerProvider>
			<Timer />
		</TimerProvider>,
	)
}

it('displays timer controls', () => {
	mountTimer()
	cy.contains('Set Timer').should('be.visible')
	cy.contains('Quick Timers').should('be.visible')
	cy.contains('Start').should('be.visible')
})

it('sets a preset timer', () => {
	mountTimer()
	cy.contains('5 sec').click()
	cy.get('#seconds').should('have.value', '5')
})

it('starts, pauses, and resumes a timer', () => {
	cy.clock()
	mountTimer()
	cy.contains('10 sec').click()
	cy.contains('Start').click()

	cy.contains('Pause').should('be.visible')
	cy.tick(3000)

	cy.contains('Pause').click()
	cy.contains('Resume').should('be.visible')

	cy.contains('Resume').click()
	cy.contains('Pause').should('be.visible')
	cy.clock().then(clock => clock.restore())
})

it('completes a timer and shows completion state', () => {
	cy.clock()
	mountTimer()
	cy.contains('5 sec').click()
	cy.contains('Start').click()

	cy.tick(6000)
	cy.contains("Time's Up!").should('be.visible')
	cy.clock().then(clock => clock.restore())
})

it('stops a running timer', () => {
	cy.clock()
	mountTimer()
	cy.contains('10 sec').click()
	cy.contains('Start').click()
	cy.tick(2000)
	cy.contains('Stop').click()

	cy.contains('Start').should('be.visible')
	cy.clock().then(clock => clock.restore())
})

it('resets the timer', () => {
	mountTimer()
	cy.contains('30 sec').click()
	cy.contains('Reset').click()
	cy.get('#seconds').should('have.value', '0')
})
