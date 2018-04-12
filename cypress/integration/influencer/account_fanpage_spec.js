describe('Verify select Facebook fan pages', function () {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, total_followers;

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/profile')
        cy.get('div.action-edit', {
            timeout: 60000
        }).click()
        cy.url().should('eq', url + '/profile/edit')
    })

    context('Verify select fan pages on desktop', function () {
        it('Verify select personal page only', function () {
            // fetch page and select
            cy.get('button.btn.blue').click()
            cy.get('#personalCheckbox').invoke('show').check().should('be.checked')
            cy.get('#fanpage_0').invoke('show').uncheck().should('not.be.checked')
            cy.get('.form_group:nth-child(1) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers = parseInt(text)
            })
            cy.get('button.btn.blue.width-128').click()
            // check updated followers
            cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
                const text = $followers.text().replace(' Followers', '')
                expect(total_followers).to.equal(parseInt(text))
            })
            // check with dashboard
            cy.get('.cursor-pointer > .material-icons').click()
            cy.url().should('eql', url + '/profile')
            cy.get(':nth-child(1) > p:first').should('be.visible').and($p => {
                const text = $p.text().replace(' Audience', '')
                expect(total_followers).to.equal(parseInt(text))
            })
        })

        it('Verify select fan page only', function () {
            // fetch page and select
            cy.get('button.btn.blue').click()
            cy.get('#fanpage_0').invoke('show').check().should('be.checked')
            cy.get('#personalCheckbox').invoke('show').uncheck().should('not.be.checked')
            cy.get('.form_group:nth-child(2) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers = parseInt(text)
            })
            cy.get('button.btn.blue.width-128').click()
            // check updated followers
            cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
                const text = $followers.text().split(' ')[0]
                expect(total_followers).to.equal(parseInt(text))
            })
            // check with dashboard
            cy.get('.cursor-pointer > .material-icons').click()
            cy.url().should('eql', url + '/profile')
            cy.get(':nth-child(1) > p:first').should('be.visible').and($p => {
                const text = $p.text().replace(' Audience', '')
                expect(total_followers).to.equal(parseInt(text))
            })
        })

        it('Verify select all', function () {
            // fetch page and select
            cy.get('button.btn.blue').click()
            cy.get('#fanpage_0').invoke('show').check().should('be.checked')
            cy.get('#personalCheckbox').invoke('show').check().should('be.checked')
            cy.get('.form_group:nth-child(1) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers = parseInt(text)
            })
            cy.get('.form_group:nth-child(2) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers += parseInt(text)
            })
            cy.get('button.btn.blue.width-128').click()
            // check updated followers
            cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
                const text = $followers.text().split(' ')[0]
                expect(total_followers).to.equal(parseInt(text))
            })
            // check with dashboard
            cy.get('.cursor-pointer > .material-icons').click()
            cy.url().should('eql', url + '/profile')
            cy.get(':nth-child(1) > p:first').should('be.visible').and($p => {
                const text = $p.text().replace(' Audience', '')
                expect(total_followers).to.equal(parseInt(text))
            })
        })

        it('Verify at least one page must be checked', function () {
            cy.get('button.btn.blue').click()
            // verify uncheck personal page
            cy.get('#personalCheckbox').invoke('show').check()
            cy.get('#fanpage_0').invoke('show').check()
            cy.get('#fanpage_0').invoke('show').uncheck().should('not.be.checked')
            cy.get('#personalCheckbox').invoke('show').uncheck().should('be.checked')
            // verify uncheck fan page
            cy.get('#personalCheckbox').invoke('show').check()
            cy.get('#fanpage_0').invoke('show').check()
            cy.get('#personalCheckbox').invoke('show').uncheck().should('not.be.checked')
            cy.get('#fanpage_0').invoke('show').uncheck().should('be.checked')
        })
    })

    context('Verify select fan pages on mobile', function () {
        it('Verify select personal page only', function () {
            cy.viewport(375, 667)
            // fetch page and select
            cy.get('button.btn.blue').click()
            cy.get('#personalCheckbox').invoke('show').check().should('be.checked')
            cy.get('#fanpage_0').invoke('show').uncheck().should('not.be.checked')
            cy.get('.form_group:nth-child(1) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers = parseInt(text)
            })
            cy.get('button.btn.blue.width-128').click()
            // check updated followers
            cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
                const text = $followers.text().split(' ')[0]
                expect(total_followers).to.equal(parseInt(text))
            })
            // check with dashboard
            cy.get('.cursor-pointer > .material-icons').click()
            cy.url().should('eql', url + '/profile')
            cy.get(':nth-child(1) > p:first').should('be.visible').and($p => {
                const text = $p.text().replace(' Audience', '')
                expect(total_followers).to.equal(parseInt(text))
            })
        })

        it('Verify select fan page only', function () {
            cy.viewport(375, 667)
            // fetch page and select
            cy.get('button.btn.blue').click()
            cy.get('#fanpage_0').invoke('show').check().should('be.checked')
            cy.get('#personalCheckbox').invoke('show').uncheck().should('not.be.checked')
            cy.get('.form_group:nth-child(2) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers = parseInt(text)
            })
            cy.get('button.btn.blue.width-128').click()
            // check updated followers
            cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
                const text = $followers.text().split(' ')[0]
                expect(total_followers).to.equal(parseInt(text))
            })
            // check with dashboard
            cy.get('.cursor-pointer > .material-icons').click()
            cy.url().should('eql', url + '/profile')
            cy.get(':nth-child(1) > p:first').should('be.visible').and($p => {
                const text = $p.text().replace(' Audience', '')
                expect(total_followers).to.equal(parseInt(text))
            })
        })

        it('Verify select all', function () {
            cy.viewport(375, 667)
            // fetch page and select
            cy.get('button.btn.blue').click()
            cy.get('#fanpage_0').invoke('show').check().should('be.checked')
            cy.get('#personalCheckbox').invoke('show').check().should('be.checked')
            cy.get('.form_group:nth-child(1) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers = parseInt(text)
            })
            cy.get('.form_group:nth-child(2) > .account_box > .info > .followers_info').should('exist').and($followers_info => {
                const text = $followers_info.text().replace(' Followers', '')
                total_followers += parseInt(text)
            })
            cy.get('button.btn.blue.width-128').click()
            // check updated followers
            cy.get('.item_face > .box_color > .info > .followers').should('exist').and($followers => {
                const text = $followers.text().split(' ')[0]
                expect(total_followers).to.equal(parseInt(text))
            })
            // check with dashboard
            cy.get('.cursor-pointer > .material-icons').click()
            cy.url().should('eql', url + '/profile')
            cy.get(':nth-child(1) > p:first').should('be.visible').and($p => {
                const text = $p.text().replace(' Audience', '')
                expect(total_followers).to.equal(parseInt(text))
            })
        })

        it('Verify at least one page must be checked', function () {
            cy.viewport(375, 667)
            cy.get('button.btn.blue').click()
            // verify uncheck personal page
            cy.get('#personalCheckbox').invoke('show').check()
            cy.get('#fanpage_0').invoke('show').check()
            cy.get('#fanpage_0').invoke('show').uncheck().should('not.be.checked')
            cy.get('#personalCheckbox').invoke('show').uncheck().should('be.checked')
            // verify uncheck fan page
            cy.get('#personalCheckbox').invoke('show').check()
            cy.get('#fanpage_0').invoke('show').check()
            cy.get('#personalCheckbox').invoke('show').uncheck().should('not.be.checked')
            cy.get('#fanpage_0').invoke('show').uncheck().should('be.checked')
        })
    })
})