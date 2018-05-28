describe('Verify edit account info', () => {    
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url'),
        country = 'VN';

    var randomInt = randomInRange(3, 19),
        test_name = 'Dong Chào ' + randomInt,
        test_introduce = 'test introduce '.repeat(randomInt),
        test_url = 'http://test_url_' + randomInt + '.com',
        test_phone = randomInt.toString().repeat(5),
        test_address = 'test address '.repeat(randomInt),
        postgresToken, bank_name, branch_name, city_name;

    // call APIs to get data
    before(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']

            cy.get_bank(postgresToken, country).then($bank => {
                var bank_index = randomInRange(0, $bank.length - 1)
                bank_name = $bank[bank_index].institution

                cy.get_branch(postgresToken, $bank[bank_index].main_code).then($branch => {
                    if ($branch.length > 1) {
                        var branch_index = randomInRange(0, $branch.length - 1)
                        branch_name = $branch[branch_index].branch_name.replace(/(|)/, '')
                    } else {
                        branch_name = $branch[0].city
                    }                  
                })
            })

            cy.get_city(postgresToken, country).then($city => {
                var city_index = randomInRange(0, $city.length - 1)
                city_name = $city[city_index].city
            })
        })
    })
    
    // log in and load profile page
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
        cy.visit(url + '/profile')
    })

    // helper functions grouping test steps
    function randomInRange(from, to) {
        var r = Math.random();
        return Math.floor(r * (to - from) + from);
    }

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

    function locate_elements() {
        return cy.get('.form_group').each($el => {
            var label = $el.find('label').text();
            if (label == 'Full Name') {
                return cy.wrap($el).as('name')
            } else if (label == 'Date of birth') {
                return cy.wrap($el).as('birthday')
            } else if (label == 'Gender') {
                return cy.wrap($el).as('gender')
            } else if (label == 'Categories') {
                return cy.wrap($el).as('categories')
            } else if (label == 'Country') {
                return cy.wrap($el).as('country')
            } else if (label == 'Email') {
                return cy.wrap($el).as('email')
            } else if (label == 'Introduce') {
                return cy.wrap($el).as('introduce')
            } else if (label == 'Blog URL') {
                return cy.wrap($el).as('blog')
            } else if (label == 'Phone Number') {
                return cy.wrap($el).as('phone')
            } else if (label == 'Bank name') {
                return cy.wrap($el).as('bank')
            } else if (label == 'Branch name') {
                return cy.wrap($el).as('branch')
            } else if (label == 'Account holder name') {
                return cy.wrap($el).as('account_name')
            } else if (label == 'Payment Email') {
                return cy.wrap($el).as('payment_email')
            } else if (label == 'Account number') {
                return cy.wrap($el).as('account_number')
            } else if (label == 'Address') {
                return cy.wrap($el).as('address')
            } else if (label == 'City') {
                return cy.wrap($el).as('city')
            } else if (label == 'Postal code') {
                return cy.wrap($el).as('postal')
            }
        })
    }

    function edit_basic_info(env='desktop') {
        // clear fields and input new data
        cy.get('@name').find('input').clear().type(test_name)
        cy.get('@introduce').find('textarea').clear().type(test_introduce)
        cy.get('@blog').find('input').clear().type(test_url)
        cy.get('@phone').find('input').clear().type(test_phone)

        click_update(env)

        // check sussessful message
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')

        // check updated data
        cy.get('h2').contains(test_name)
        cy.get(':nth-child(3) > .introduce').contains(test_introduce)
    }

    function edit_empty_data(env='desktop') {
        // clear fields
        cy.get('@name').find('input').clear()
        cy.get('@birthday').find('input').clear()
        cy.get('@email').find('input').clear({force: true})
        cy.get('@introduce').find('textarea').clear()
        cy.get('@blog').find('input').clear()
        cy.get('@phone').find('input').clear()
        cy.get('@bank').find('select').select('Select your bank')
        cy.get('@branch').find('select').select('Select your branch name')
        cy.get('@account_name').find('input').clear()
        cy.get('@account_number').find('input').clear()
        cy.get('@payment_email').find('input').clear()
        cy.get('@address').find('textarea').clear()
        cy.get('@city').find('select').select('Select your city')
        cy.get('@postal').find('input').clear()

        click_update(env)
        
        // check alerts
        cy.get('.alert-danger').should('be.visible')

        // check cannot update page
        cy.url().should('equal', url + '/profile/edit')
    }

    function edit_birthday(env='desktop') {
        // select new birthday
        cy.get('@birthday').find('input').click()
        cy.get('.owl-calendar-control').should('be.visible')
        cy.get('i[class="icon icon-owl-right-open"]:first').click().click()
        cy.get('i[class="icon icon-owl-left-open"]:first').click().click().click()
        cy.get('.owl-calendar-day > tbody.ng-tns-c7-0 > :nth-child(2) > :nth-child(3) > .ng-tns-c7-0').click()

        click_update(env)

        // check sussessful message
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')
    }

    function edit_gender(env='desktop') {
        var gender_value = Math.floor(Math.random() * Math.floor(2))

        cy.get('@gender').find('select').select(gender_value.toString())

        click_update(env)

        // check sussessful message
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')

        // check updated gender
        if (gender_value == 2) {
            cy.get(':nth-child(2) > ul > :nth-child(2) > p:first').invoke('text').should('equal', 'Male')
        } else if (gender_value == 0) {
            cy.get(':nth-child(2) > ul > :nth-child(2) > p:first').invoke('text').should('equal', 'Other')
        } else if (gender_value == 1) {
            cy.get(':nth-child(2) > ul > :nth-child(2) > p:first').invoke('text').should('equal', 'Female')
        }
    }

    function edit_categories(env='desktop') {
        // deselect all categories and check alert
        cy.get('@categories').click().find('a').should('have.length', 19).each($el => {
            if ($el.attr('class') == 'dropdown-item active') {
                cy.wrap($el.find('span > span')).click()
            }
        }) 
        cy.get('.multi-select > .alert').should('exist')

        var cat_1 = Math.floor(19 - randomInt + 1),
            cat_2 = Math.floor(19 - randomInt + 2),
            cat_3 = Math.floor(19 - randomInt + 3),
            cat_list = ['News', 'Beauty', 'Comedy', 'Sports', 'Fanpage', 'Celebrity', 'Food & Drink', 'Kid & Family', 'Technology',
                        'Real Estate', 'Pets & Animals', 'Games & Gadgets', 'Autos & Vehicles', 'Fitness & Health', 'Leisure & Travel',
                        'Finance & Banking', 'Fashion & Lifestyle', 'Arts & Entertainment', 'Businees & Industrial'];

        // select only 1 category and check alert
        cy.get('@categories').find(`a:nth-child(${cat_1}) > span > span`).click() 
        cy.get('.multi-select > .alert').should('exist')

        // select 3 categories
        cy.get('@categories').find(`a:nth-child(${cat_2}) > span > span`).click()  
        cy.get('@categories').find(`a:nth-child(${cat_3}) > span > span`).click()  
        
        click_update(env)

        // check sussessful message
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')

        // check updated categories
        cy.get(':nth-child(4) > p.introduce_item').invoke('text').then(text => {
            expect(text.split(',')[0].trim()).to.equal(cat_list[cat_1 - 1])
            expect(text.split(',')[1].trim()).to.equal(cat_list[cat_2 - 1])
            expect(text.split(',')[2].trim()).to.equal(cat_list[cat_3 - 1])
        })
    }

    function edit_payment(env='desktop') {
        // update new payment info
        cy.get('@bank').find('select').select(bank_name)
        cy.get('@branch').find('select').select(branch_name)
        cy.get('@city').find('select').select(city_name)
        cy.get('@account_name').find('input').clear().type(test_name)
        cy.get('@account_number').find('input').clear().type(randomInt.toString().repeat())
        cy.get('@address').find('textarea').clear().type(test_address)
        cy.get('@postal').find('input').clear().type(randomInt*randomInt)

        click_update(env)

        // check sussessful message
        cy.url().should('equal', url + '/profile?update=true')
        cy.get('.mess-congrats').should('exist')
    }

    // test cases for desktop theme
    context('Verify edit on desktop', () => {
        it('Verify edit basic info', () => {
            click_edit()
            locate_elements()
            edit_basic_info()
        })

        it('Verify edit fields with empty data', () => {
            click_edit()
            locate_elements()
            edit_empty_data()
        })

        it('Verify edit birthday', () => {
            click_edit()
            locate_elements()
            edit_birthday()
        })

        it('Verify edit gender', () => {
            click_edit()
            locate_elements()
            edit_gender()
        })
         
        it('Verify edit categories', () => {
            click_edit()
            locate_elements()
            edit_categories()
        })

        it('Verify edit payment', () => {
            click_edit()
            locate_elements()
            edit_payment()
        })
    })

    // test cases for mobile theme
    context('Verify edit on mobile', () => {
        it('Verify edit basic info', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            locate_elements()
            edit_basic_info('mobile')
        })

        it('Verify edit fields with empty data', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            locate_elements()
            edit_empty_data('mobile')
        })

        it('Verify edit birthday', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            locate_elements()
            edit_birthday('mobile')
        })

        it('Verify edit gender', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            locate_elements()
            edit_gender('mobile')
        })

        it('Verify edit categories', () => {
            cy.viewport(375, 667)
            click_edit('mobile')
            locate_elements()
            edit_categories('mobile')
        })

        it('Verify edit payment', () => {
            click_edit('mobile')
            locate_elements()
            edit_payment('mobile')
        })
    })
})