describe('Log out', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');
    
    var postgresToken;

    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/campaign')
    })

    it('Select logout on desktop', () => {
        cy.get('.header_right > .logout').click()
        cy.contains('Sign In')
        cy.url().should('equal', url + '/')
    })

    it('Select logout on mobile', () => {
        cy.viewport(375, 667)
        cy.get('#pageInformation > header > div > div.menu > div:nth-child(2) > i').click()
        cy.get('#listMenu > div').click()
        cy.contains('Sign In')
        cy.url().should('equal', url + '/')
    })
})