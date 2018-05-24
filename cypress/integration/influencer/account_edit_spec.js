describe('Verify edit account info', () => {    
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var randomInt = Math.floor(Math.random() * Math.floor(50)),
        test_name = 'Dong Chào ' + randomInt,
        test_introduce = 'test introduce '.repeat(randomInt),
        test_url = 'http://test_url_' + randomInt + '.com',
        test_phone = randomInt.toString().repeat(5),
        postgresToken;

    // log in and load profile page
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
        cy.visit(url + '/profile')
    })

    // helper functions used in test cases
    function click_edit(env='desktop') {
        if (env == 'mobile') {
            cy.get('.btn').as('edit_button')
        } else {
            cy.get('div.action-edit').as('edit_button')
        }
        cy.get('@edit_button', {
            timeout: 60000
        }).click()
        cy.url().should('equal', url + '/profile/edit')
    }

    function click_update(env='desktop') {
        if (env == 'mobile') {
            cy.get('.content_breadcrumbs > .btn').as('update_button')
        } else {
            cy.get('#updateInfo').as('update_button')
        }
        cy.get('@update_button').click()
    }

    function edit_valid_data(env='desktop') {
        cy.get('#name').clear().type(test_name)
        cy.get('textarea[name="introduce"]').clear().type(test_introduce)
        cy.get('input[name="blogUrl"]').clear().type(test_url)
        cy.get('input[name="phoneNumber"]').clear().type(test_phone)
        click_update(env)
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')
        cy.get('h2').contains(test_name)
        cy.get(':nth-child(3) > .introduce').contains(test_introduce)
    }

    function edit_empty_data(env='desktop') {
        cy.get('#name').clear()
        cy.get('.alert > div').should('exist')
        cy.get('#name').type(test_name)
        cy.get('input[name="email"]').clear()
        cy.get('.alert.alert-danger').should('exist')
        click_update(env)
        cy.url().should('equal', url + '/profile/edit')
    }

    function edit_birthday(env='desktop') {
        cy.get('#birthDay').click()
            cy.get('.owl-calendar-control').should('visible')
            cy.get('i[class="icon icon-owl-right-open"]:first').click().click()
            cy.get('i[class="icon icon-owl-left-open"]:first').click().click().click()
            cy.get('tbody.ng-tns-c6-0 > :nth-child(2) > :nth-child(4) > .ng-tns-c6-0').click()
            click_update(env)
            cy.url().should('equal', url + '/profile?update=true')
            cy.get('.mess-congrats').should('exist')
    }

    function edit_gender(env='desktop') {
        var gender_value = Math.floor(Math.random() * Math.floor(2))
        cy.get('select[name="gender"]').select(gender_value.toString())
        cy.get('div > ss-multiselect-dropdown > div > button').click()
        click_update(env)
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')
        if (gender_value == 2) {
            cy.get(':nth-child(2) > ul > :nth-child(2) > p:first').invoke('text').should('equal', 'Male')
        } else if (gender_value == 0) {
            cy.get(':nth-child(2) > ul > :nth-child(2) > p:first').invoke('text').should('equal', 'Other')
        } else if (gender_value == 1) {
            cy.get(':nth-child(2) > ul > :nth-child(2) > p:first').invoke('text').should('equal', 'Female')
        }
    }

    function edit_categories(env='desktop') {
        cy.get('.dropdown-toggle').click()
        cy.get('ss-multiselect-dropdown > div > .dropdown-menu').as('categories')
        cy.get('@categories').find('a').should('have.length', 19).each($el => {
            if ($el.attr('class') == 'dropdown-item active') {
                cy.wrap($el.find('span > span')).click()
            }
        }) // uncheck all categories
        cy.get('.multi-select > .alert').should('exist')
        cy.get('@categories').find('a:nth-child(1) > span > span').click()  // news
        cy.get('@categories').find('a:nth-child(2) > span > span').click()  // beauty
        cy.get('@categories').find('a:nth-child(3) > span > span').click()  // comedy
        click_update(env)
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')
        cy.get(':nth-child(4) > p.introduce_item').invoke('text').then(text => {
            expect(text.trim()).to.equal('News, Beauty, Comedy')
        })
    }

    // test cases for desktop theme
    context('Verify edit on desktop', () => {
        it('Verify edit text fields with valid data', () => {
            click_edit()
            edit_valid_data()
        })

        it('Verify edit required text fields with empty data', () => {
            click_edit()
            edit_empty_data()
        })

        it('Verify edit birthday', () => {
            click_edit()
            edit_birthday()
        })

        it('Verify edit gender', () => {
            click_edit()
            edit_gender()
        })
         
        it('Verify edit categories', () => {
            click_edit()
            edit_categories()
        })
    })

    // test cases for mobile theme
    context('Verify edit on mobile', () => {
        it('Verify edit text fields with valid data', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            edit_valid_data('mobile')
        })

        it('Verify edit required text fields with empty data', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            edit_empty_data('mobile')
        })

        it('Verify edit birthday', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            edit_birthday('mobile')
        })

        it('Verify edit gender', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            edit_gender('mobile')
        })

        it('Verify edit categories', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            edit_categories('mobile')
        })
    })
})