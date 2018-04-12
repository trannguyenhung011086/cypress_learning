describe('Verify contact form', function () {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, name, email, phone, nation;

    before(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_influencers_detail_view_influencer_frontend(postgresToken, influencer).then($body => {
                name = $body[0].name
                email = $body[0].email
                phone = $body[0].phone_number
                nation = $body[0].nation
            })
        })
    })

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/contact')
    })

    it('Verify submit contact form using API', function () {
        cy.request({
            method: 'POST',
            url: Cypress.env('api_host') + '/rpc/cam_send_email_contact_page',
            headers: {
                Authorization: 'Bearer ' + postgresToken
            },
            body: {
                "email": email,
                "user_name": name,
                "phone": phone,
                "type_user": "influencer",
                "enquiry": "test email contact form",
                "user_id": influencer
            }
        }).then(resp => {
            expect(resp.status).to.eq(200)
        })
    })

    context('Verify contact form on desktop', function () {
        it('Verify submit empty data', function () {
            email = email.slice(0, 30)
            cy.get(`#name[ng-reflect-model="${name}"]`).clear().should('be.empty')
            cy.get(`input[name="email"][ng-reflect-model="${email}"]`).clear().should('be.empty')
            cy.get(`input[name="phoneNumber"][ng-reflect-model="${phone}"]`).clear().should('be.empty')
            cy.get('textarea[name="enquiry"]').clear().should('be.empty')
            cy.get('.btn').click()
            cy.get(':nth-child(1) > .alert > div').should('exist')
            cy.get(':nth-child(2) > .alert > div').should('exist')
            cy.get(':nth-child(3) > .alert > div').should('exist')
            cy.get('.two_collum > :nth-child(1) > :nth-child(3) > :nth-child(1)').should('exist')
            cy.get('.two_collum > :nth-child(1) > :nth-child(3) > :nth-child(2)').should('exist')
        })

        it('Verify submit required data', function () {
            cy.get(`input[name="phoneNumber"][ng-reflect-model="${phone}"]`).clear().type('123456789')
            cy.get('textarea[name="enquiry"]').type('testing enquire email')
            cy.get('.btn').click()
            cy.url().should('eql', url + '/contact/finished')
            cy.get('img[src="../../assets/images/received-enquiry-icon.svg"]').should('be.visible')
            cy.get('.thank_title').should('be.visible')
            cy.get('.thank_text').should('be.visible')
        })
    })

    context('Verify contact form on mobile', function () {
        it('Verify submit empty data', function () {
            email = email.slice(0, 30)
            cy.viewport(375, 667)
            cy.get(`#name[ng-reflect-model="${name}"]`).clear().should('be.empty')
            cy.get(`input[name="email"][ng-reflect-model="${email}"]`).clear().should('be.empty')
            cy.get(`input[name="phoneNumber"][ng-reflect-model="${phone}"]`).clear().should('be.empty')
            cy.get('textarea[name="enquiry"]').clear().should('be.empty')
            cy.get('.btn').click()
            cy.get(':nth-child(1) > .alert > div').should('exist')
            cy.get(':nth-child(2) > .alert > div').should('exist')
            cy.get(':nth-child(3) > .alert > div').should('exist')
            cy.get('.two_collum > :nth-child(1) > :nth-child(3) > :nth-child(1)').should('exist')
            cy.get('.two_collum > :nth-child(1) > :nth-child(3) > :nth-child(2)').should('exist')
        })

        it('Verify submit required data', function () {
            cy.viewport(375, 667)
            cy.get(`input[name="phoneNumber"][ng-reflect-model="${phone}"]`).clear().type('123456789')
            cy.get('textarea[name="enquiry"]').type('testing enquire email')
            cy.get('.btn').click()
            cy.url().should('eql', url + '/contact/finished')
            cy.get('img[src="../../assets/images/received-enquiry-icon.svg"]').should('be.visible')
            cy.get('.thank_title').should('be.visible')
            cy.get('.thank_text').should('be.visible')
        })
    })
})