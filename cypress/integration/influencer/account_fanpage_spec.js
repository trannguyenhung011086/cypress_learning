describe('Verify select Facebook fan pages', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, total_followers, fanpage_list;

    // log in and load edit account page
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
        cy.visit(url + '/profile/edit')
    })

    // helper functions grouping test steps
    function select_personal_only() {
        // click Choose Page
        cy.get('button.btn.blue').click()

        cy.get('#personalCheckbox').invoke('show').check().should('be.checked')
        cy.get('#fanpage_0').invoke('show').uncheck().should('not.be.checked')
    }

    function get_personal_followers() {
        cy.get('.form_group:nth-child(1) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
            const text = $followers_info.text().split(' ')[0]
            total_followers = parseInt(text)
        })
    }

    function select_fan_only() {
        // click Choose Page
        cy.get('button.btn.blue').click()

        cy.get('#fanpage_0').invoke('show').check().should('be.checked')
        cy.get('#personalCheckbox').invoke('show').uncheck().should('not.be.checked')
    }

    function get_fan_followers() {
        cy.get('.form_group:nth-child(2) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
            const text = $followers_info.text().split(' ')[0]
            total_followers = parseInt(text)
        })
    }

    function check_fanpage_info() {
        cy.fetch_facebook_fanpage(postgresToken, influencer).then($body => {
            fanpage_list = $body
            for (var i = 0; i < fanpage_list.length; i++) {
                cy.get(`.form_group:nth-child(${i+2}) > .account_box > .info`).find('.name').invoke('text').should('equal', fanpage_list[i].fanpage_name)
                cy.get(`.form_group:nth-child(${i+2}) > .account_box > .info`).find('.followers_info').invoke('text').should('equal', fanpage_list[i].followers.toString() + ' Followers')
            }
        })
    }

    function select_all() {
        // click Choose Page
        cy.get('button.btn.blue').click()

        cy.get('#fanpage_0').invoke('show').check().should('be.checked')
        cy.get('#personalCheckbox').invoke('show').check().should('be.checked')
    }

    function get_all_followers() {
        cy.get('.form_group:nth-child(1) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
            const text = $followers_info.text().split(' ')[0]
            total_followers = parseInt(text)
        })
        cy.get('.form_group:nth-child(2) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
            const text = $followers_info.text().split(' ')[0]
            total_followers += parseInt(text)
        })
    }

    function check_total_followers() {
        // click Done
        cy.get('button.btn.blue.width-128').click()

        // check updated followers
        cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
            const text = $followers.text().split(' ')[0]
            expect(total_followers).to.equal(parseInt(text))
        })

        // check with dashboard
        cy.get('.cursor-pointer > .material-icons').click()
        cy.url().should('eql', url + '/profile')
        cy.get(':nth-child(1) > p:first').should('be.visible').and($audience => {
            const text = $audience.text().split(' ')[0]
            expect(total_followers).to.equal(parseInt(text))
        })
    }

    // test cases for desktop theme
    context('Verify select fan pages on desktop', () => {
        it('Verify select personal page only', () => {
            select_personal_only()
            get_personal_followers()
            check_total_followers()
        })

        it('Verify select fan page only', () => {
            select_fan_only()
            get_fan_followers()
            check_fanpage_info()
            check_total_followers()
        })

        it('Verify select all', () => {
            select_all()
            get_all_followers()
            check_total_followers()
        })
    })

    // test cases for mobile theme
    context('Verify select fan pages on mobile', () => {
        it('Verify select personal page only', () => {
            cy.viewport(375, 667)
            select_personal_only()
            get_personal_followers()
            check_total_followers()
        })

        it('Verify select fan page only', () => {
            cy.viewport(375, 667)
            select_fan_only()
            get_fan_followers()
            check_fanpage_info()
            check_total_followers()
        })

        it('Verify select all', () => {
            cy.viewport(375, 667)
            select_all()
            get_all_followers()
            check_total_followers()
        })
    })
})