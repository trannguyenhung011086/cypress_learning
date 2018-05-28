describe('Verify FAQ info', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url'),
        lang_pair = {
            'en': 'English',
            'vi': 'Việt Nam',
            'th': 'ภาษาไทย',
            'id': 'Indonesian',
            'jp': '日本語',
            'tw': 'Taiwanese',
            'hk': 'Hongkongese'
        };

    var postgresToken, content;

    // log in and load FAQ page
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
        cy.visit(url + '/faq')
    })

    // helper functions grouping test steps
    function check_expand_collapse_all() {
        // click Expand All
        cy.get('.btn:nth-child(1)').click()
        cy.get('.answer-content').should('be.visible')

        // click Collapse All
        cy.get('.btn:nth-child(2)').click()
        cy.get('.answer-content').should('not.be.visible')
    }

    function check_expand_collapse_each() {
        cy.get('.list-question').find('.item-question').each($el => {
            // click header to expand
            cy.wrap($el).find('mat-expansion-panel-header').click()
            cy.wrap($el).find('.answer-content').should('be.visible')

            // click header to collapse
            cy.wrap($el).find('mat-expansion-panel-header').click()
            cy.wrap($el).find('.answer-content').should('not.be.visible')
        })
    }

    function check_language_content(lang) {
        cy.get_qna(postgresToken, lang).then($content => {
            content = $content

            // check total questions
            cy.get('.list-question').find('.item-question').should('have.length', content.length)

            // check each question
            for (var i = 0; i < content.length; i++) {
                cy.get(`.item-question:nth-child(${i+1})`).find('.mat-expansion-panel-header > .mat-content > mat-panel-title > p').invoke('text').invoke('trim').should('equal', content[i].question)
                cy.get(`.item-question:nth-child(${i+1})`).find('.answer-content').invoke('text').invoke('trim').should('equal', content[i].answer)
            }
        })
    }

    function change_language(lang, env = 'desktop') {
        if (env == 'mobile') {
            cy.get('.show-on-mobile-768').as('language_selector')
        } else {
            cy.get('.hide-on-mobile-768').as('language_selector')
        }
        cy.get('@language_selector').find('.language_text').click()
        cy.get('@language_selector').find('.list_languages.show').find('li').each($el => {
            if ($el.text() == lang_pair[lang]) {
                cy.wrap($el).click()
            }
        })
    }

    function check_all_languages(env = 'desktop') {
        const lang_list = Object.keys(lang_pair)
        for (var i in lang_list) {
            change_language(lang_list[i], env)
            cy.get('.btn:nth-child(1)').click() // click Expand All
            check_language_content(lang_list[i])
        }
    }

    // test cases for desktop theme
    context('Verify on desktop', () => {
        it('Verify expand and collapse view', () => {
            check_expand_collapse_all()
            check_expand_collapse_each()
        })

        it('Verify change language', () => {
            check_all_languages()
        })
    })

    // test cases for mobile theme
    context('Verify on mobile', () => {
        it('Verify expand and collapse view', () => {
            cy.viewport(375, 667)
            check_expand_collapse_all()
            check_expand_collapse_each()
        })

        it('Verify change language', () => {
            cy.viewport(375, 667)
            check_all_languages('mobile')
        })
    })
})