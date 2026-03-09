import { MentorActivityCardDisplay } from '@/app/mentor/learner/[id]/activities/mentor-activity-card-display'

const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

function mountCard({
	title = 'Brush Teeth',
	onSaveTitle = cy.stub().resolves(),
	onGenerateImage = cy.stub().resolves(),
	onSelect = cy.stub(),
}: {
	title?: string
	onSaveTitle?: Cypress.Agent<sinon.SinonStub>
	onGenerateImage?: Cypress.Agent<sinon.SinonStub>
	onSelect?: Cypress.Agent<sinon.SinonStub>
} = {}) {
	cy.mount(
		<MentorActivityCardDisplay
			title={title}
			imageUrl={imageUrl}
			defaultPrompt="a child brushing teeth"
			onSelect={onSelect}
			onSaveTitle={onSaveTitle}
			onGenerateImage={onGenerateImage}
		/>,
	)
}

describe('MentorActivityCardDisplay – title display', () => {
	it('shows the activity title', () => {
		mountCard({ title: 'Brush Teeth' })
		cy.getByName('activity-title').should('contain', 'Brush Teeth')
	})

	it('shows the activity image', () => {
		mountCard()
		cy.getByName('activity-image').should('exist')
	})

	it('shows the edit title button', () => {
		mountCard()
		cy.getByName('activity-edit-title-button').should('exist')
	})
})

describe('MentorActivityCardDisplay – title editing', () => {
	it('shows title input when pencil clicked', () => {
		mountCard()
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-title-input').should('be.visible')
	})

	it('pre-fills the input with the current title', () => {
		mountCard({ title: 'Brush Teeth' })
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-title-input').should('have.value', 'Brush Teeth')
	})

	it('saves title when check button clicked', () => {
		const onSaveTitle = cy.stub().resolves()
		mountCard({ onSaveTitle })
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-title-input').clear().type('Wash Hands')
		cy.getByName('activity-save-title-button').click()
		cy.wrap(onSaveTitle).should('have.been.calledWith', 'Wash Hands')
	})

	it('saves title when Enter pressed', () => {
		const onSaveTitle = cy.stub().resolves()
		mountCard({ onSaveTitle })
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-title-input').clear().type('Wash Hands{enter}')
		cy.wrap(onSaveTitle).should('have.been.calledWith', 'Wash Hands')
	})

	it('cancels editing when X clicked', () => {
		mountCard({ title: 'Brush Teeth' })
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-title-input').clear().type('Something Else')
		cy.getByName('activity-cancel-title-button').click()
		cy.getByName('activity-title').should('contain', 'Brush Teeth')
		cy.getByName('activity-title-input').should('not.exist')
	})

	it('cancels editing when Escape pressed', () => {
		mountCard({ title: 'Brush Teeth' })
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-title-input').type('{esc}')
		cy.getByName('activity-title-input').should('not.exist')
	})

	it('does not call onSaveTitle when title is unchanged', () => {
		const onSaveTitle = cy.stub().resolves()
		mountCard({ title: 'Brush Teeth', onSaveTitle })
		cy.getByName('activity-edit-title-button').click()
		cy.getByName('activity-save-title-button').click()
		cy.wrap(onSaveTitle).should('not.have.been.called')
	})
})

describe('MentorActivityCardDisplay – image prompt', () => {
	it('shows image prompt area when sparkle button clicked', () => {
		mountCard()
		// sparkle button is only visible on hover, force the click
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-prompt-area').should('be.visible')
	})

	it('pre-fills prompt with defaultPrompt', () => {
		mountCard()
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-prompt-input').should(
			'have.value',
			'a child brushing teeth',
		)
	})

	it('calls onGenerateImage with the prompt when generate button clicked', () => {
		const onGenerateImage = cy.stub().resolves()
		mountCard({ onGenerateImage })
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-prompt-input').clear().type('a boy brushing teeth')
		cy.getByName('activity-generate-image-button').click()
		cy.wrap(onGenerateImage).should('have.been.calledWith', 'a boy brushing teeth')
	})

	it('calls onGenerateImage when Enter pressed in prompt input', () => {
		const onGenerateImage = cy.stub().resolves()
		mountCard({ onGenerateImage })
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-prompt-input')
			.clear()
			.type('morning routine{enter}')
		cy.wrap(onGenerateImage).should('have.been.calledWith', 'morning routine')
	})

	it('hides prompt area when cancel clicked', () => {
		mountCard()
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-prompt-area').should('be.visible')
		cy.getByName('activity-cancel-image-button').click()
		cy.getByName('activity-image-prompt-area').should('not.exist')
	})

	it('hides prompt area after successful generation', () => {
		const onGenerateImage = cy.stub().resolves()
		mountCard({ onGenerateImage })
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-prompt-input').clear().type('new prompt')
		cy.getByName('activity-generate-image-button').click()
		cy.getByName('activity-image-prompt-area').should('not.exist')
	})
})

describe('MentorActivityCardDisplay – select', () => {
	it('calls onSelect when image tapped (not editing)', () => {
		const onSelect = cy.stub()
		mountCard({ onSelect })
		cy.getByName('activity-image-button').click({ force: true })
		cy.wrap(onSelect).should('have.been.called')
	})

	it('does not call onSelect when image prompt is open', () => {
		const onSelect = cy.stub()
		mountCard({ onSelect })
		cy.getByName('activity-change-image-button').click({ force: true })
		cy.getByName('activity-image-button').click()
		cy.wrap(onSelect).should('not.have.been.called')
	})
})
