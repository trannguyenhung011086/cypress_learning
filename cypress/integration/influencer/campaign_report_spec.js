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

    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/report')
    })

    context('Verify campaign report on desktop', () => {
        it('Verify campaign filter', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.multi-select.campaign-control').as('campaign_filter')
            cy.get('.grid-list').as('cam_grid')
            cy.get('.grid-total').as('cam_total')
            cy.get('@campaign_filter').find('ss-multiselect-dropdown > div > button').click()
            cy.wait(3000)
            cy.get('@campaign_filter').find('.dropdown-menu > a').then($el => {
                expect($el.length).to.equal(cam_list.length)
            }) // compare total campaigns in filter list
            cy.get('@campaign_filter').find('.dropdown-menu > a:nth-child(2) > span > span').click() // select 2nd campaign
            cy.get('@campaign_filter').find('.dropdown-menu > a:nth-child(2) > span > span').then($el => {
                cam_name = $el.text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    if (cam_list[i].title == cam_name) {
                        cam_id = cam_list[i].id
                        break
                    }
                } // get campaign id
                cy.log('check campaign id: ' + cam_id)
                cy.search_cami_campaigns_report(postgresToken, influencer, [cam_id]).then($body => {
                    cy.get('@cam_grid').find('.row-line').then($el => {
                        expect($el.length).to.equal(1)
                    }) // check displayed list
                    cy.log('check campaign name')
                    cy.get('@cam_grid').find('.left-info > .row-title > a').then($el => {
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
                    }) // check view
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
                    }) // check like
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
                    }) // check comment
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
                    }) // check share
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
                    }) // check cost
                })
            })
        })

        it('Verify social media filter Facebook', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.multi-select.medias-control').as('social')
            cy.get('@social').find('.dropdown-toggle.btn.btn-default.btn-block').click()
            cy.get('@social').find('a:nth-child(1) > span').click() // select Facebook
            cy.wait(3000)
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with facebook
                    if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'facebook') {
                        if (cam_list[i].total_views != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(1)').text())).to.equal(cam_list[i].total_views)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-')
                        } // check view
                        if (cam_list[i].total_likes != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(2)').text())).to.equal(cam_list[i].total_likes)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-')
                        } // check like
                        if (cam_list[i].total_comments != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(3)').text())).to.equal(cam_list[i].total_comments)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-')
                        } // check comment
                        if (cam_list[i].total_shares != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(4)').text())).to.equal(cam_list[i].total_shares)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-')
                        } // check share
                        if (cam_list[i].total_costs != null) {
                            expect(parseFloat($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().replace(',', ''))).to.equal(Math.round(parseFloat(cam_list[i].total_costs) * 1000) / 1000)
                        } else {
                            expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0)
                        } // check cost
                    } else if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'instagram') {
                        expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-') // check view
                        expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-') // check like
                        expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-') // check comment
                        expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-') // check share
                        expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0) // check cost
                    }
                }
            })
        })

        it('Verify social media filter Instagram', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.multi-select.medias-control').as('social')
            cy.get('@social').find('.dropdown-toggle.btn.btn-default.btn-block').click()
            cy.get('@social').find('a:nth-child(2) > span').click() // select Instagram
            cy.wait(3000)
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with instagram
                    if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'instagram') {
                        if (cam_list[i].total_views != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(1)').text())).to.equal(cam_list[i].total_views)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-')
                        } // check view
                        if (cam_list[i].total_likes != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(2)').text())).to.equal(cam_list[i].total_likes)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-')
                        } // check like
                        if (cam_list[i].total_comments != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(3)').text())).to.equal(cam_list[i].total_comments)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-')
                        } // check comment
                        if (cam_list[i].total_shares != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(4)').text())).to.equal(cam_list[i].total_shares)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-')
                        } // check share
                        if (cam_list[i].total_costs != null) {
                            expect(parseFloat($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().replace(',', ''))).to.equal(Math.round(parseFloat(cam_list[i].total_costs) * 1000) / 1000)
                        } else {
                            expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0)
                        } // check cost
                    } else if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'facebook') {
                        expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-') // check view
                        expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-') // check like
                        expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-') // check comment
                        expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-') // check share
                        expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0) // check cost
                    }
                }
            })
        })

        it('Verify default period filter', () => {
            cy.get('.grid-list > div.row-line').should('be.visible').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign in time range
                    if (cam_name == cam_list[i].title && (cam_list[i].start_period_unix <= current.getTime() <= cam_list[i].end_period_unix)) {
                        if (cam_list[i].total_views != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(1)').text())).to.equal(cam_list[i].total_views)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-')
                        } // check view
                        if (cam_list[i].total_likes != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(2)').text())).to.equal(cam_list[i].total_likes)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-')
                        } // check like
                        if (cam_list[i].total_comments != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(3)').text())).to.equal(cam_list[i].total_comments)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-')
                        } // check comment
                        if (cam_list[i].total_shares != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(4)').text())).to.equal(cam_list[i].total_shares)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-')
                        } // check share
                        if (cam_list[i].total_costs != null) {
                            expect(parseFloat($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().replace(',', ''))).to.equal(Math.round(parseFloat(cam_list[i].total_costs) * 1000) / 1000)
                        } else {
                            expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0)
                        } // check cost
                    } else if (cam_name == cam_list[i].title && (cam_list[i].start_period_unix > current.getTime() || current.getTime() > cam_list[i].end_period_unix)) {
                        expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-') // check view
                        expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-') // check like
                        expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-') // check comment
                        expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-') // check share
                        expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0) // check cost
                    }
                }
            })
        })

        it('Verify total numbers', () => {
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
        })

        it('Verify segment by day', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.select-control').click()
            cy.get('.select-options.open > div:nth-child(2)').click() // select segment by day
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with segment available
                    if (cam_name == cam_list[i].title && cam_list[i].day_segment != null) {
                        for (var j = 0; j < cam_list[i].day_segment.length; j++) {
                            expect($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(1)`).text()).to.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2})/)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(2)`).text())).to.equal(cam_list[i].day_segment[j].views)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(3)`).text())).to.equal(cam_list[i].day_segment[j].likes)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(4)`).text())).to.equal(cam_list[i].day_segment[j].comments)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(5)`).text())).to.equal(cam_list[i].day_segment[j].shares)
                        }
                    }
                }
            })
        })

        it('Verify segment by month', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.select-control').click()
            cy.get('.select-options.open > div:nth-child(3)').click() // select segment by month
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with segment available
                    if (cam_name == cam_list[i].title && cam_list[i].month_segment != null) {
                        for (var j = 0; j < cam_list[i].month_segment.length; j++) {
                            expect($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(1)`).text()).to.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(2)`).text())).to.equal(cam_list[i].month_segment[j].views)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(3)`).text())).to.equal(cam_list[i].month_segment[j].likes)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(4)`).text())).to.equal(cam_list[i].month_segment[j].comments)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(5)`).text())).to.equal(cam_list[i].month_segment[j].shares)
                        }
                    }
                }
            })
        })

        it('Verify segment by social media', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.select-control').click()
            cy.get('.select-options.open > div:nth-child(4)').click() // select segment by social media
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with segment available
                    if (cam_name == cam_list[i].title && cam_list[i].social_segment != null) {
                        for (var j = 0; j < cam_list[i].social_segment.length; j++) {
                            expect($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(1) > i`)).to.satisfy(function check_icon($i) {
                                return ($i.attr('class', 'icon icon_facebook_small').length > 0 || $i.attr('class', 'icon icon_instagram_small').length > 0)
                            })
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(2)`).text())).to.equal(cam_list[i].social_segment[j].views)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(3)`).text())).to.equal(cam_list[i].social_segment[j].likes)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(4)`).text())).to.equal(cam_list[i].social_segment[j].comments)
                            expect(parseInt($cam.find(`.segment-row:nth-child(${j + 1}) > div:nth-child(5)`).text())).to.equal(cam_list[i].social_segment[j].shares)
                        }
                    }
                }
            })
        })

        it('Verify revenue', () => {
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.wait(3000)
            cy.get('#revenueBox').find('.revenue-number > .number').then($num => {
                expect(parseFloat($num.text().replace(',', ''))).to.equal(Math.round(revenue[0].revenue * 1000) / 1000)
                expect(parseFloat($num.text().replace(',', ''))).to.gte(0)
            })
            cy.get('#revenueBox').find('.revenue-number > .currency').then($currency => {
                expect($currency.text().trim()).to.equal('usd')
            })
            cy.get('#revenueBox').find('.request-payment-button > div > span > i').should('be.visible').and('have.attr', 'ng-reflect-message', 'You can only withdraw money wh')
            cy.get('#revenueBox').find('.request-payment-button > button').click()
            if ((Math.round(revenue[0].revenue * 1000) / 1000) >= 50) {
                cy.get('#requestPaymentPopup').should('be.visible')
                cy.get('#requestPaymentPopup').find('.revenue-number > .number').then($num => {
                    expect(parseFloat($num.text().replace(',', ''))).to.equal(Math.round(revenue[0].revenue * 1000) / 1000)
                })
                cy.get('#requestPaymentPopup').find('input.read_only').should('be.visible')
                cy.get('#requestPaymentPopup').find('input.btn.default').click()
                cy.get('#requestPaymentPopup').find('input.read_only').should('not.be.visible')
            } else {
                cy.get('#requestPaymentPopup').should('not.be.visible')
            }
        })
    })

    context('Verify campaign report on mobile', () => {
        it('Verify campaign filter', () => {
            cy.viewport(375, 667)
            cy.get('div.filter_title > div').click()
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').scrollIntoView({
                duration: 2000
            }).click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.multi-select.campaign-control').as('campaign_filter')
            cy.get('.grid-list').as('cam_grid')
            cy.get('.grid-total').as('cam_total')
            cy.get('@campaign_filter').find('ss-multiselect-dropdown > div > button').click()
            cy.wait(3000)
            cy.get('@campaign_filter').find('.dropdown-menu > a').then($el => {
                expect($el.length).to.equal(cam_list.length)
            }) // compare total campaigns in filter list
            cy.get('@campaign_filter').find('.dropdown-menu > a:nth-child(2) > span > span').click() // select 2nd campaign
            cy.get('@campaign_filter').find('.dropdown-menu > a:nth-child(2) > span > span').then($el => {
                cam_name = $el.text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    if (cam_list[i].title == cam_name) {
                        cam_id = cam_list[i].id
                        break
                    }
                } // get campaign id
                cy.log('check campaign id: ' + cam_id)
                cy.get('.search_done_button').click()
                cy.search_cami_campaigns_report(postgresToken, influencer, [cam_id]).then($body => {
                    cy.get('@cam_grid').find('.row-line').then($el => {
                        expect($el.length).to.equal(1)
                    }) // check displayed list
                    cy.log('check campaign name')
                    cy.get('@cam_grid').find('.left-info > .row-title > a').then($el => {
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
                    }) // check view
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
                    }) // check like
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
                    }) // check comment
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
                    }) // check share
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
                    }) // check cost
                })
            })
        })

        it('Verify social media filter Facebook', () => {
            cy.viewport(375, 667)
            cy.get('div.filter_title > div').click()
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').scrollIntoView({
                duration: 2000
            }).click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.multi-select.medias-control').as('social')
            cy.get('@social').find('.dropdown-toggle.btn.btn-default.btn-block').click()
            cy.get('@social').find('a:nth-child(1) > span').click() // select Facebook
            cy.get('.search_done_button').click()
            cy.wait(3000)
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with facebook
                    if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'facebook') {
                        if (cam_list[i].total_views != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(1)').text())).to.equal(cam_list[i].total_views)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-')
                        } // check view
                        if (cam_list[i].total_likes != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(2)').text())).to.equal(cam_list[i].total_likes)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-')
                        } // check like
                        if (cam_list[i].total_comments != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(3)').text())).to.equal(cam_list[i].total_comments)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-')
                        } // check comment
                        if (cam_list[i].total_shares != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(4)').text())).to.equal(cam_list[i].total_shares)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-')
                        } // check share
                        if (cam_list[i].total_costs != null) {
                            expect(parseFloat($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().replace(',', ''))).to.equal(Math.round(parseFloat(cam_list[i].total_costs) * 1000) / 1000)
                        } else {
                            expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0)
                        } // check cost
                    } else if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'instagram') {
                        expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-') // check view
                        expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-') // check like
                        expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-') // check comment
                        expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-') // check share
                        expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0) // check cost
                    }
                }
            })
        })

        it('Verify social media filter Instagram', () => {
            cy.viewport(375, 667)
            cy.get('div.filter_title > div').click()
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').scrollIntoView({
                duration: 2000
            }).click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.multi-select.medias-control').as('social')
            cy.get('@social').find('.dropdown-toggle.btn.btn-default.btn-block').click()
            cy.get('@social').find('a:nth-child(2) > span').click() // select Instagram
            cy.get('.search_done_button').click()
            cy.wait(3000)
            cy.get('.grid-list > div.row-line').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign with instagram
                    if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'instagram') {
                        if (cam_list[i].total_views != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(1)').text())).to.equal(cam_list[i].total_views)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-')
                        } // check view
                        if (cam_list[i].total_likes != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(2)').text())).to.equal(cam_list[i].total_likes)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-')
                        } // check like
                        if (cam_list[i].total_comments != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(3)').text())).to.equal(cam_list[i].total_comments)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-')
                        } // check comment
                        if (cam_list[i].total_shares != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(4)').text())).to.equal(cam_list[i].total_shares)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-')
                        } // check share
                        if (cam_list[i].total_costs != null) {
                            expect(parseFloat($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().replace(',', ''))).to.equal(Math.round(parseFloat(cam_list[i].total_costs) * 1000) / 1000)
                        } else {
                            expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0)
                        } // check cost
                    } else if (cam_name == cam_list[i].title && cam_list[i].social_media_list[0] == 'facebook') {
                        expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-') // check view
                        expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-') // check like
                        expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-') // check comment
                        expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-') // check share
                        expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0) // check cost
                    }
                }
            })
        })

        it('Verify default period filter', () => {
            cy.viewport(375, 667)
            cy.get('.grid-list > div.row-line').should('be.visible').each($cam => {
                cam_name = $cam.find('.left-info > .row-title > a').text().trim()
                for (var i = 0; i < cam_list.length; i++) {
                    // find campaign in time range
                    if (cam_name == cam_list[i].title && (cam_list[i].start_period_unix <= current.getTime() <= cam_list[i].end_period_unix)) {
                        if (cam_list[i].total_views != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(1)').text())).to.equal(cam_list[i].total_views)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-')
                        } // check view
                        if (cam_list[i].total_likes != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(2)').text())).to.equal(cam_list[i].total_likes)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-')
                        } // check like
                        if (cam_list[i].total_comments != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(3)').text())).to.equal(cam_list[i].total_comments)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-')
                        } // check comment
                        if (cam_list[i].total_shares != null) {
                            expect(parseInt($cam.find('.right-info > div:nth-child(4)').text())).to.equal(cam_list[i].total_shares)
                        } else {
                            expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-')
                        } // check share
                        if (cam_list[i].total_costs != null) {
                            expect(parseFloat($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text().replace(',', ''))).to.equal(Math.round(parseFloat(cam_list[i].total_costs) * 1000) / 1000)
                        } else {
                            expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0)
                        } // check cost
                    } else if (cam_name == cam_list[i].title && (cam_list[i].start_period_unix > current.getTime() || current.getTime() > cam_list[i].end_period_unix)) {
                        expect($cam.find('.right-info > div:nth-child(1)').text().trim()).to.equal('-') // check view
                        expect($cam.find('.right-info > div:nth-child(2)').text().trim()).to.equal('-') // check like
                        expect($cam.find('.right-info > div:nth-child(3)').text().trim()).to.equal('-') // check comment
                        expect($cam.find('.right-info > div:nth-child(4)').text().trim()).to.equal('-') // check share
                        expect(parseInt($cam.find('.right-info > div:nth-child(5) > .cost > div > span').text())).to.equal(0) // check cost
                    }
                }
            })
        })

        it('Verify total numbers', () => {
            cy.viewport(375, 667)
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
        })

        it('Verify revenue', () => {
            cy.viewport(375, 667)
            cy.get('div.filter_title > div').click()
            cy.get('#period').click()
            cy.get('div.owl-dateTime-inputWrapper > i').scrollIntoView({
                duration: 2000
            }).click()
            cy.get('div.owl-dateTime-btn.owl-corner-bottomLeft.owl-dateTime-btnConfirm').click() // clear default period filter
            cy.get('.search_done_button').click()
            cy.wait(3000)
            cy.get('#revenueBox').find('.revenue-number > .number').then($num => {
                expect(parseFloat($num.text().replace(',', ''))).to.equal(Math.round(revenue[0].revenue * 1000) / 1000)
                expect(parseFloat($num.text().replace(',', ''))).to.gte(0)
            })
            cy.get('#revenueBox').find('.revenue-number > .currency').then($currency => {
                expect($currency.text().trim()).to.equal('usd')
            })
            cy.get('#revenueBox').find('.request-payment-button > div > span > i').should('be.visible').and('have.attr', 'ng-reflect-message', 'You can only withdraw money wh')
            cy.get('#revenueBox').find('.request-payment-button > button').click()
            if ((Math.round(revenue[0].revenue * 1000) / 1000) >= 50) {
                cy.get('#requestPaymentPopup').should('be.visible')
                cy.get('#requestPaymentPopup').find('.revenue-number > .number').then($num => {
                    expect(parseFloat($num.text().replace(',', ''))).to.equal(Math.round(revenue[0].revenue * 1000) / 1000)
                })
                cy.get('#requestPaymentPopup').find('input.read_only').should('be.visible')
                cy.get('#requestPaymentPopup').find('input.btn.default').click()
                cy.get('#requestPaymentPopup').find('input.read_only').should('not.be.visible')
            } else {
                cy.get('#requestPaymentPopup').should('not.be.visible')
            }
        })
    })
})