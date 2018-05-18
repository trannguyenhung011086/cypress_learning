describe('Verify login flow', () => {
    const influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    context('Verify login using API', () => {
        it('Verify loging existing account with Facebook', () => {
            const accessToken = Cypress.env('facebook')['accessToken'],
                userID = Cypress.env('facebook')['userID'],
                signedRequest = Cypress.env('facebook')['signedRequest'],
                client_id = Cypress.env('facebook')['client_id'],
                client_secret = Cypress.env('facebook')['client_secret'];
            cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer)
        })

        it('Verify loging existing account with Instagram', () => {
            const access_token = Cypress.env('instagram')['access_token'];
            cy.login_instagram(access_token, influencer)
        })

        it('Verify login existing account with Twitter', () => {
            const oauth_token = Cypress.env('twitter')['oauth_token'],
                oauth_token_secret = Cypress.env('twitter')['oauth_token_secret'],
                user_id = Cypress.env('twitter')['user_id'],
                screen_name = Cypress.env('twitter')['screen_name'],
                client_id = Cypress.env('twitter')['client_id'],
                client_secret = Cypress.env('twitter')['client_secret'];
            cy.login_twitter(oauth_token, oauth_token_secret, user_id, screen_name, client_id, client_secret, influencer)
        })
    })

    context('Verify login using UI', () => {
        // to do with iframe https://github.com/cypress-io/cypress/issues/136, https://github.com/cypress-io/cypress/issues/1433

        // cy.get('#storybook-preview-iframe').then(($iframe) => {
        //     const doc = $iframe.contents();
        //     iget(doc, "#startDate").click();
        //     iget(doc, "#root > div > div:nth-child(2) > div > a").should('have.text', "Show Info");
        // })

        // function iget(doc, selector) {
        //     return cy.wrap(doc.find(selector));
        // }

    })
})