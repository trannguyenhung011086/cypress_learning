describe('Verify campaign report page', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, cam_list, cam_name, cam_id, revenue,
        current = new Date();

    // call API to get data
    before(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.search_cami_campaigns_report(postgresToken, influencer).then($body => {
                cam_list = $body
            })
            cy.get_influencer_revenue(postgresToken, influencer).then($body => {
                revenue = $body
            })
        })
    })

    // log in
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
        cy.visit(url + '/report')
    })

    // helper functions grouping test steps
    function clear_period(env='') {
        if (env == 'mobile') {
            cy.get('div.filter_title > div').click()
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').scrollIntoView({
                duration: 2000
            }).click()
        } else {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
        }  
        cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click()
        cy.wait(3000)
    }

    function open_cam_list(env='') {
        cy.get('.multi-select.campaign-control').as('campaign_filter')
        cy.get('.grid-list').as('cam_grid')
        cy.get('.grid-total').as('cam_total')
        cy.get('@campaign_filter').find('ss-multiselect-dropdown > div > button').click()
        if (env == 'mobile') {
            cy.get('.search_done_button').click()
        }
        cy.wait(3000)

        // compare total campaigns in filter list
        cy.get('@campaign_filter').find('.dropdown-menu > a').then($el => {
            expect($el.length).to.equal(cam_list.length)
        }) 
    }

    function verify_campaign_data() {
        // select 2nd campaign
        cy.get('@campaign_filter').find('.dropdown-menu > a:nth-child(2) > span > span').click() 

        cy.get('@campaign_filter').find('.dropdown-menu > a:nth-child(2) > span > span').then($el => {
            cam_name = $el.text().trim()

            // get campaign id
            for (var i = 0; i < cam_list.length; i++) {
                if (cam_list[i].title == cam_name) {
                    cam_id = cam_list[i].id
                    break
                }
            } 

            cy.log('check campaign id: ' + cam_id)
            cy.search_cami_campaigns_report(postgresToken, influencer, [cam_id]).then($body => {
                // check displayed list
                cy.get('@cam_grid').find('.row-line').then($el => {
                    expect($el.length).to.equal(1)
                }) 

                cy.log('check campaign name')
                cy.get('@cam_grid').find('.left-info > .row-title > .title-campaign').then($el => {
                    expect($el.text().trim()).to.equal(cam_name)
                })

                cy.log('check campaign view')
                cy.get('@cam_grid').find('.right-info > div:nth-child(1)').then($el => {
                    if ($body[0].total_views != null) {
                        expect(parseInt($el.text())).to.equal($body[0].total_views)
                        cy.get('@cam_total').find(':nth-child(1) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(parseInt($el.text()))
                        })
                    } else {
                        expect($el.text().trim()).to.equal('-')
                        cy.get('@cam_total').find(':nth-child(1) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(0)
                        })
                    }
                }) 

                cy.log('check campaign like')
                cy.get('@cam_grid').find('.right-info > div:nth-child(2)').then($el => {
                    if ($body[0].total_likes != null) {
                        expect(parseInt($el.text())).to.equal($body[0].total_likes)
                        cy.get('@cam_total').find(':nth-child(2) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(parseInt($el.text()))
                        })
                    } else {
                        expect($el.text().trim()).to.equal('-')
                        cy.get('@cam_total').find(':nth-child(2) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(0)
                        })
                    }
                }) 

                cy.log('check campaign comment')
                cy.get('@cam_grid').find('.right-info > div:nth-child(3)').then($el => {
                    if ($body[0].total_comments != null) {
                        expect(parseInt($el.text())).to.equal($body[0].total_comments)
                        cy.get('@cam_total').find(':nth-child(3) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(parseInt($el.text()))
                        })
                    } else {
                        expect($el.text().trim()).to.equal('-')
                        cy.get('@cam_total').find(':nth-child(3) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(0)
                        })
                    }
                }) 

                cy.log('check campaign share')
                cy.get('@cam_grid').find('.right-info > div:nth-child(4)').then($el => {
                    if ($body[0].total_shares != null) {
                        expect(parseInt($el.text())).to.equal($body[0].total_shares)
                        cy.get('@cam_total').find(':nth-child(4) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(parseInt($el.text()))
                        })
                    } else {
                        expect($el.text().trim()).to.equal('-')
                        cy.get('@cam_total').find(':nth-child(4) > .number').then($num => {
                            expect(parseInt($num.text())).to.equal(0)
                        })
                    }
                })

                cy.log('check campaign cost')
                cy.get('@cam_grid').find('.right-info > div:nth-child(5) > .cost').then($el => {
                    if ($body[0].total_costs != null) {
                        expect(parseFloat($el.find('div > span').text())).to.equal(Math.round(parseFloat($body[0].total_costs) * 1000) / 1000)
                        cy.get('@cam_total').find(':nth-child(5) > .number > span:nth-child(1)').then($num => {
                            expect(parseFloat($num.text().replace(',', ''))).to.equal(parseFloat($el.text()))
                        })
                    } else {
                        expect(parseInt($el.find('div > span').text())).to.equal(0)
                        cy.get('@cam_total').find(':nth-child(5) > .number > span:nth-child(1)').then($num => {
                            expect(parseInt($num.text())).to.equal(0)
                        })
                    }
                    expect($el.find('.text').text().trim()).to.equal('usd')
                    cy.get('@cam_total').find(':nth-child(5) > .number > .currency').then($currency => {
                        expect($currency.text().trim()).to.equal('usd')
                    })
                }) 
            })
        })
    }

    function verify_engagement() {
        var total_view = 0,
                total_like = 0,
                total_comment = 0,
                total_share = 0,
                total_cost = 0;
        cy.get('.grid-list > div.row-line').each($cam => {
            cam_name = $cam.find('.left-info > .row-title > a').text().trim()
            var view = $cam.find('.right-info > div:nth-child(1)').text().trim(),
                like = $cam.find('.right-info > div:nth-child(2)').text().trim(),
                comment = $cam.find('.right-info > div:nth-child(3)').text().trim(),
                share = $cam.find('.right-info > div:nth-child(4)').text().trim(),
                cost = $cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().trim();
            if (view == '-') {
                view = 0
            }
            if (like == '-') {
                like = 0
            }
            if (comment == '-') {
                comment = 0
            }
            if (share == '-') {
                share = 0
            }
            total_view += parseInt(view)
            total_like += parseInt(like)
            total_comment += parseInt(comment)
            total_share += parseInt(share)
            total_cost += parseFloat(cost)
            cy.log('Check campaign: ' + cam_name)
            cy.get('.grid-total-item.item-1 > .number').then($num => {
                expect(parseInt($num.text())).to.gte(total_view)
            })
            cy.get('.grid-total-item.item-2 > .number').then($num => {
                expect(parseInt($num.text())).to.gte(total_like)
            })
            cy.get('.grid-total-item.item-3 > .number').then($num => {
                expect(parseInt($num.text())).to.gte(total_comment)
            })
            cy.get('.grid-total-item.item-4 > .number').then($num => {
                expect(parseInt($num.text())).to.gte(total_share)
            })
            cy.get('.grid-total-item.item-5 > .number > span:nth-child(1)').then($num => {
                expect(parseFloat($num.text().replace(',', ''))).to.gte(total_cost)
            })
        })
    }

    function verify_revenue() {
        cy.get('#revenueBox').find('.revenue-number > .number').then($num => {
            expect(parseFloat($num.text().replace(/,/g, ''))).to.equal(Math.round(revenue[0].revenue * 1000) / 1000)
            expect(parseFloat($num.text().replace(/,/g, ''))).to.gte(0)
        })
        cy.get('#revenueBox').find('.revenue-number > .currency').then($currency => {
            expect($currency.text().trim()).to.equal('usd')
        })
    }

    function verify_request_popup() {
        // click Request
        cy.get('#revenueBox').find('.request-payment-button > button').click()

        // check if revenue >= threshold
        if ((Math.round(revenue[0].revenue * 1000) / 1000) >= 50) {
            cy.get('#requestPaymentPopup').should('be.visible')
            cy.get('#requestPaymentPopup').find('.revenue-number > .number').then($num => {
                expect(parseFloat($num.text().replace(/,/g, ''))).to.equal(Math.round(revenue[0].revenue * 1000) / 1000)
            })
            // click Cancel
            cy.get('#requestPaymentPopup').find('.default').click()
        } else {
            cy.get('#requestPaymentPopup').should('not.be.visible')
        }
    }

    // test cases for desktop theme
    context('Verify campaign report on desktop', () => {
        it('Verify campaign filter', () => {
            clear_period()
            open_cam_list()
            verify_campaign_data()
        })

        it('Verify engagement', () => {
            verify_engagement()
        })

        it('Verify revenue', () => {
            clear_period()
            verify_revenue()
        })

        it('Verify request popup', () => {
            clear_period()
            verify_request_popup()
        })
    })
})