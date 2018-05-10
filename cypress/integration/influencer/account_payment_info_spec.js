describe('Verify payment info', function () {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url'),
        country = 'VN';

    var postgresToken, bank_list;

    before(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_bank_info(postgresToken, country).then($body => {
                bank_list = $body
            })
        })
    })

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/profile')
        cy.get('div.action-edit', {
            timeout: 60000
        }).click()
        cy.url().should('equal', url + '/profile/edit')
        cy.get('div.form_group.payment > div.margin-top-24.two_collum > div:nth-child(1)').as('bank')
        cy.get('div.form_group.payment > div.margin-top-24.two_collum > div:nth-child(2)').as('branch')
        cy.get('div.form_group.payment > div:nth-child(3) > div:nth-child(1)').as('account_name')
        cy.get('div.form_group.payment > div:nth-child(3) > div:nth-child(2)').as('payment_email')
        cy.get('div.form_group.payment > div:nth-child(4) > div:nth-child(1)').as('account_number')
        cy.get('div.form_group.payment > div.form_group').as('address')
        cy.get('div.form_group.payment > div:nth-child(6) > div:nth-child(1)').as('city')
        cy.get('div.form_group.payment > div:nth-child(6) > div:nth-child(2)').as('postal')
    })

    context('Verify update payment info on desktop', function () {
        it('Verify payment email is prefilled from influencer email', function () {
            cy.get('@payment_email').find('input').invoke('attr', 'ng-reflect-model').then($payment_email => {
                cy.get('div.form_info > div.form_left > div:nth-child(4) > input').invoke('attr', 'ng-reflect-model').then($email => {
                    expect($payment_email).to.equal($email)
                })
            })
        })

        it('Verify all payment info are required', function () {
            cy.get('@bank').find('select').select(bank_list[0]['institution']) // select first bank
            cy.get('#updateInfo').click()
            cy.get('@bank').find('select').select('Select your bank')
            cy.get('@bank').find('.alert.alert-danger').should('be.visible') 
            cy.get('@branch').find('.alert.alert-danger').should('be.visible') 
            cy.get('@account_name').find('.alert.alert-danger').should('be.visible') 
            cy.get('@account_number').find('.alert.alert-danger').should('be.visible') 
            cy.get('@address').find('.alert.alert-danger').should('be.visible') 
            cy.get('@city').find('.alert.alert-danger').should('be.visible') 
            cy.get('@postal').find('.alert.alert-danger').should('be.visible') 
        })

        it('Verify update payment info', function () {
            cy.get('@bank').find('select').select(bank_list[0]['institution']) // select first bank
            cy.get('@branch')
        })
    })

    context('Verify update payment info on mobile', function () {
        it('Verify payment email is prefilled from influencer email', function () {
            cy.viewport(375, 667)
            cy.get('@payment_email').find('input').invoke('attr', 'ng-reflect-model').then($payment_email => {
                cy.get('div.form_info > div.form_left > div:nth-child(4) > input').invoke('attr', 'ng-reflect-model').then($email => {
                    expect($payment_email).to.equal($email)
                })
            })
        })

        it('Verify all payment info are required', function () {
            cy.viewport(375, 667)
            cy.get('@bank').find('select').select(bank_list[0]['institution']) // select first bank
            cy.get('.content_breadcrumbs > .btn').click()
            cy.get('@bank').find('select').select('Select your bank')
            cy.get('@bank').find('.alert.alert-danger').should('be.visible') 
            cy.get('@branch').find('.alert.alert-danger').should('be.visible') 
            cy.get('@account_name').find('.alert.alert-danger').should('be.visible') 
            cy.get('@account_number').find('.alert.alert-danger').should('be.visible') 
            cy.get('@address').find('.alert.alert-danger').should('be.visible') 
            cy.get('@city').find('.alert.alert-danger').should('be.visible') 
            cy.get('@postal').find('.alert.alert-danger').should('be.visible')
        })
    })
})