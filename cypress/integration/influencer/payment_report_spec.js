describe('Verify payment report page', function () {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, pay_requests;

    before(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.search_influencer_payment_period(postgresToken, influencer).then($body => {
                pay_requests = $body.length // get total number of payment requests
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_id != parseInt(influencer)) {
                        throw 'There is one payment request from another influencer!'
                    }
                }
            })
        })
    })

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/payment')
    })

    context('Verify payment report on desktop', function () {
        it('Verify default period filter', function () {
            cy.get('app-payment-history > section > section > div.grid > div.grid-body > .row').as('pay_list')
            cy.get('@pay_list').then($rows => {
                expect($rows.length).to.be.lte(pay_requests)
            })
            cy.get('@pay_list').each($row => {
                expect(parseFloat($row.find('div.column-item.item-1 > .price').text())).to.gt(0) // check amount
                expect($row.find('div.column-item.item-1 > .currency').text()).to.equal('USD') // check currency
                expect($row.find('div.column-item.item-3 > span').text()).to.not.be.empty // check date of request
                var date_request = $row.find('div.column-item.item-3 > span').text(),
                    date_request_time = new Date(date_request).getTime(); // convert to epoch time
                if ($row.find('div > .btn.payment_status.processing').length > 0 || $row.find('div > .btn.payment_status.rejected').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.be.empty
                } else if ($row.find('div > .btn.payment_status.paid').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.not.be.empty // check date of payment
                    var date_paid = $row.find('div.column-item.item-4 > span').text(),
                        date_paid_time = new Date(date_paid).getTime(); // convert to epoch time
                    expect(date_paid_time).to.gte(date_request_time)
                }
            })
        })

        it('Verify custom period filter', function () {
            // set up fake data in db for influencer report at a specific month first
            cy.get('#period').click()
            // choose 2018
            cy.get('.year-control').click()
            cy.get('.owl-calendar-year > tbody > tr').each($row => {
                for (var i = 1; i <= $row.find('td').length; i++) {
                    if ($row.find(`td:nth-child(${i}) > a`).text() == '2018') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                        break
                    }
                }
            })
            cy.get('.year-control').then($year => {
                expect($year.text()).to.equal('2018')
            })
            // choose April
            cy.get('.month-control').click()
            cy.get('.owl-calendar-month > tbody > tr').each($row => {
                for (var i = 1; i <= $row.find('td').length; i++) {
                    if ($row.find(`td:nth-child(${i}) > a`).text() == 'Apr') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                        break
                    }
                }
            })
            cy.get('.month-control').then($month => {
                expect($month.text()).to.equal('April')
            })
            // chose full month
            cy.get('.owl-calendar-day > tbody > tr').each($row => {
                for (var i = 1; i <= $row.find('td').length; i++) {
                    if ($row.find(`td:nth-child(${i}) > a`).text() == '1') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                    } else if ($row.find(`td:nth-child(${i}) > a`).text() == '30') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                        break
                    }
                }
            })
            // apply filter
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click()
            cy.wait(3000)
            cy.get('app-payment-history > section > section > div.grid > div.grid-body > .row').as('pay_list')
            cy.get('@pay_list').then($rows => {
                expect($rows.length).to.be.lt(10)
            })
            cy.get('@pay_list').each($row => {
                expect(parseFloat($row.find('div.column-item.item-1 > .price').text())).to.gt(0) // check amount
                expect($row.find('div.column-item.item-1 > .currency').text()).to.equal('USD') // check currency
                expect($row.find('div.column-item.item-3 > span').text()).to.not.be.empty // check date of request
                var date_request = $row.find('div.column-item.item-3 > span').text(),
                    date_request_time = new Date(date_request).getTime(); // convert to epoch time
                if ($row.find('div > .btn.payment_status.processing').length > 0 || $row.find('div > .btn.payment_status.rejected').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.be.empty
                } else if ($row.find('div > .btn.payment_status.paid').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.not.be.empty // check date of payment
                    var date_paid = $row.find('div.column-item.item-4 > span').text(),
                        date_paid_time = new Date(date_paid).getTime(); // convert to epoch time
                    expect(date_paid_time).to.gte(date_request_time)
                }
            })
        })
    })

    context('Verify payment report on mobile', function () {
        it('Verify default period filter', function () {
            cy.viewport(375, 667)
            cy.get('app-payment-history > section > section > div.grid > div.grid-body > .row').as('pay_list')
            cy.get('@pay_list').then($rows => {
                expect($rows.length).to.be.lte(pay_requests)
            })
            cy.get('@pay_list').each($row => {
                expect(parseFloat($row.find('div.column-item.item-1 > .price').text())).to.gt(0) // check amount
                expect($row.find('div.column-item.item-1 > .currency').text()).to.equal('USD') // check currency
                expect($row.find('div.column-item.item-3 > span').text()).to.not.be.empty // check date of request
                var date_request = $row.find('div.column-item.item-3 > span').text(),
                    date_request_time = new Date(date_request).getTime(); // convert to epoch time
                if ($row.find('div > .btn.payment_status.processing').length > 0 || $row.find('div > .btn.payment_status.rejected').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.be.empty
                } else if ($row.find('div > .btn.payment_status.paid').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.not.be.empty // check date of payment
                    var date_paid = $row.find('div.column-item.item-4 > span').text(),
                        date_paid_time = new Date(date_paid).getTime(); // convert to epoch time
                    expect(date_paid_time).to.gte(date_request_time) // compare time
                }
            })
        })

        it('Verify custom period filter', function () {
            cy.viewport(375, 667)
            // set up fake data in db for influencer report at a specific month first
            cy.get('div.filter_title > div').click()
            cy.get('#period').click()
            // choose 2018
            cy.get('.year-control').click()
            cy.get('.owl-calendar-year > tbody > tr').each($row => {
                for (var i = 1; i <= $row.find('td').length; i++) {
                    if ($row.find(`td:nth-child(${i}) > a`).text() == '2018') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                        break
                    }
                }
            })
            cy.get('.year-control').then($year => {
                expect($year.text()).to.equal('2018')
            })
            // choose April
            cy.get('.month-control').click()
            cy.get('.owl-calendar-month > tbody > tr').each($row => {
                for (var i = 1; i <= $row.find('td').length; i++) {
                    if ($row.find(`td:nth-child(${i}) > a`).text() == 'Apr') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                        break
                    }
                }
            })
            cy.get('.month-control').then($month => {
                expect($month.text()).to.equal('April')
            })
            // chose full month
            cy.get('.owl-calendar-day > tbody > tr').each($row => {
                for (var i = 1; i <= $row.find('td').length; i++) {
                    if ($row.find(`td:nth-child(${i}) > a`).text() == '1') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                    } else if ($row.find(`td:nth-child(${i}) > a`).text() == '30') {
                        cy.wrap($row.find(`td:nth-child(${i}) > a`)).click()
                        break
                    }
                }
            })
            // apply filter
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click()
            cy.get('.filter_button > .btn').click()
            cy.wait(3000)
            cy.get('app-payment-history > section > section > div.grid > div.grid-body > .row').as('pay_list')
            cy.get('@pay_list').then($rows => {
                expect($rows.length).to.be.lt(10)
            })
            cy.get('@pay_list').each($row => {
                expect(parseFloat($row.find('div.column-item.item-1 > .price').text())).to.gt(0) // check amount
                expect($row.find('div.column-item.item-1 > .currency').text()).to.equal('USD') // check currency
                expect($row.find('div.column-item.item-3 > span').text()).to.not.be.empty // check date of request
                var date_request = $row.find('div.column-item.item-3 > span').text(),
                    date_request_time = new Date(date_request).getTime(); // convert to epoch time
                if ($row.find('div > .btn.payment_status.processing').length > 0 || $row.find('div > .btn.payment_status.rejected').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.be.empty
                } else if ($row.find('div > .btn.payment_status.paid').length > 0) {
                    expect($row.find('div.column-item.item-4 > span').text()).to.not.be.empty // check date of payment
                    var date_paid = $row.find('div.column-item.item-4 > span').text(),
                        date_paid_time = new Date(date_paid).getTime(); // convert to epoch time
                    expect(date_paid_time).to.gte(date_request_time) // compare time
                }
            })
        })
    })
})