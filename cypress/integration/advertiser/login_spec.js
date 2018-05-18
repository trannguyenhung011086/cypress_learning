// describe('Verify login flow', () => {
//     const adv = Cypress.env('adv'),
//         url = Cypress.env('url_adv'),
//         email = 'trannguyenhung011086@gmail.com',
//         pass = '123456'

//     var postgresToken;

//     it('Verify logging using API', () => {
//         cy.login_adv(email, pass).then($db_token => {
//             postgresToken = $db_token['postgresToken']
//         })
//     })

//     it('Verify logging using UI', () => {
//         cy.visit(url)
//         cy.get('#loginForm > div:nth-child(1) > input').clear().type('test')
//         cy.get('#loginForm > div:nth-child(2) > input').clear().type('test')
//         cy.get('#loginForm > div.box-submit > button').click()
//         cy.get('.alert.alert-danger').should('be.visible')
//     })
// })