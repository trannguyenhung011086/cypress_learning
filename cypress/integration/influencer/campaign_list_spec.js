describe('Verify campaign list', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var categories = null,
        categories = null,
        keyword = null,
        social_medias = null,
        postgresToken,
        cam_amount;

    // log in
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                cam_amount = $cam_list.length
            }) // get total number of campaigns
        })
        cy.visit(url + '/campaign')
    })

    // helper functions grouping test steps
    function verify_order() {
        var start_1, end_1, start_2, end_2;
        cy.get('.campaigns_list > a').each($card => {
            // convert end time to unix 
            end_1 = (new Date($card.find('.to.date > .day_month').text() + ' ' + $card.find('.to.date > .year').text())).getTime()
            end_2 = (new Date($card.next().find('.to.date > .day_month').text() + ' ' + $card.next().find('.to.date > .year').text())).getTime()
            if (end_2 > 0) {
                expect(end_1).to.lte(end_2)
            }
        })       
    }

    function verify_valid_keyword(keyword, env='') {
        cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
            var cam_amount_filter = $cam_list.length

            // check API result
            expect(cam_amount).to.be.gte(cam_amount_filter)
            for (var i in $cam_list) {
                expect($cam_list[i].title.toLowerCase()).to.include(keyword)
            }

            // type keyword
            if (env=='mobile') {
                cy.get('.filter_title').click()
                cy.get('.filter_item.keyword.item_1 > div > input').scrollIntoView().type(keyword)
                cy.get('.search_done_button').click()
            } else {
                cy.get('.filter_item.keyword.item_1 > div > input').scrollIntoView().type(keyword)
            }
            cy.wait(3000)

            // check display result
            cy.get('.campaigns_list > a').then($el => {
                expect($el.length).to.lte(cam_amount_filter)
            })
            cy.get('.campaigns_list > a').each($el => {
                expect($el.find('.cam_title').text().toLowerCase()).to.include(keyword)
            })
        })
    }

    function verify_invalid_keyword(keyword, env='') {
        cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
            // check API result
            expect($cam_list).to.be.empty

            // type keyword
            if (env == 'mobile') {
                cy.get('.filter_title').click()
                cy.get('.filter_item.keyword.item_1 > div > input').scrollIntoView().type(keyword)
                cy.get('.search_done_button').click()
            } else {
                cy.get('.filter_item.keyword.item_1 > div > input').scrollIntoView().type(keyword)
            }
            cy.wait(3000)

            // check display result
            cy.get('.campaigns_list').should('exist').then($list => {
                expect($list.text().trim()).to.be.empty
            })
        })
    }

    function select_sns_filter(sns, env='') {
        cy.get('.filter_item.multi-select.item_2 > ss-multiselect-dropdown > div').as('social_filter')
        if (env == 'mobile') {
            cy.get('.filter_title').click()
            cy.get('@social_filter').click()
            if (sns == 'facebook') {
                cy.get('@social_filter').find(':nth-child(1) > span > span').click()
            } else if (sns == 'instagram') {
                cy.get('@social_filter').find(':nth-child(2) > span > span').click()
            }
            cy.get('.search_done_button').click()
        } else {
            cy.get('@social_filter').click()
            if (sns == 'facebook') {
                cy.get('@social_filter').find(':nth-child(1) > span > span').click()
            } else if (sns == 'instagram') {
                cy.get('@social_filter').find(':nth-child(2) > span > span').click()
            }
        }
    }

    function verify_sns(social_medias, env='') {
        cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
            var cam_amount_filter = $cam_list.length
            expect(cam_amount).to.be.gte(cam_amount_filter)

            if (social_medias[0] == 'facebook') {
                // check API result
                for (var i in $cam_list) {
                    expect($cam_list[i].social_media_list).to.include(social_medias[0])
                }

                select_sns_filter(social_medias[0], env)

                cy.wait(3000)
                // check display result
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                    expect($el.find('.icon.grid_column_1.icon_facebook_small')).to.be.visible
                    expect($el.find('.icon.grid_column_1.icon_instagram_color')).to.not.be.visible
                })
            } else if (social_medias[0] == 'instagram') {
                // check API result
                for (var i in $cam_list) {
                    expect($cam_list[i].social_media_list).to.include(social_medias[0])
                }

                select_sns_filter(social_medias[0], env)
                
                // check display result
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                    expect($el.find('.icon.grid_column_1.icon_facebook_small')).to.not.be.visible
                    expect($el.find('.icon.grid_column_1.icon_instagram_color')).to.be.visible
                })
            }
        })
    }

    function verify_categories(categories, env='') {
        var cat_list = ['News', 'Beauty', 'Comedy', 'Sports', 'Fanpage', 'Celebrity', 'Food & Drink', 'Kid & Family', 'Technology',
                        'Real Estate', 'Pets & Animals', 'Games & Gadgets', 'Autos & Vehicles', 'Fitness & Health', 'Leisure & Travel',
                        'Finance & Banking', 'Fashion & Lifestyle', 'Arts & Entertainment', 'Businees & Industrial'];

        cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
            var cam_amount_filter = $cam_list.length

            // check API result
            expect(cam_amount).to.be.gte(cam_amount_filter)
            for (var i in $cam_list) {
                expect($cam_list[i].cat_list_id).to.satisfy(function check_cat_list($num) {
                    return $num.includes(categories[0]) == true || $num.includes(categories[1]) == true
                })
            }

            // select categories
            if (env == 'mobile') {
                cy.get('.filter_title').click()
                cy.get('.filter_item.multi-select.item_3 > ss-multiselect-dropdown > div').as('category_filter')
                cy.get('@category_filter').find('button').click()
                cy.get('@category_filter').find(`:nth-child(${categories[0]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[1]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[2]}) > span > span`).click()
                cy.get('.search_done_button').click()
            } else {
                cy.get('.filter_item.multi-select.item_3 > ss-multiselect-dropdown > div').as('category_filter')
                cy.get('@category_filter').find('button').click()
                cy.get('@category_filter').find(`:nth-child(${categories[0]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[1]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[2]}) > span > span`).click()
            }
            cy.wait(3000)

            // check display result
            cy.get('.campaigns_list').children().then($el => {
                expect($el.length).to.lte(cam_amount_filter)
            })
            cy.get('.campaigns_list > a').each($el => {
                expect($el.find('.cam_category').text().toLowerCase()).to.satisfy(function check_category($text) {
                    return $text.indexOf(cat_list[0].toLowerCase()) != -1 || $text.indexOf(cat_list[1].toLowerCase()) != -1 || $text.indexOf(cat_list[2].toLowerCase()) != -1
                })
            })
        })
    }

    function verify_joined_status(env='') {
        cy.get_campaigns_joined(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
            var cam_amount_filter = $cam_list.length

            // check API result
            expect(cam_amount).to.be.gte(cam_amount_filter)
            for (var i in $cam_list) {
                expect($cam_list[i].influencer_joined).to.be.true
                expect($cam_list[i].status).to.equal('ongoing')
            }

            // select status
            if (env == 'mobile') {
                cy.get('.filter_title').click()
                cy.get('.filter_item.item_4 > select').select('1') // 1: Joined
                cy.get('.search_done_button').click()
            } else {
                cy.get('.filter_item.item_4 > select').select('1') // 1: Joined
            }
            cy.wait(3000)

            // check display result
            cy.get('.campaigns_list').children().then($el => {
                expect($el.length).to.lte(cam_amount_filter)
            })
            cy.get('.campaigns_list > a').each($el => {
                expect($el.find('.campaign_info > .cam_last_row > .join_btn > button.status.joined')).to.be.visible
            })
        })
    }

    function verify_not_joined_status(env='') {
        cy.get_campaigns_not_joined(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
            var cam_amount_filter = $cam_list.length

            // check API result
            expect(cam_amount).to.be.gte(cam_amount_filter)
            for (var i in $cam_list) {
                expect($cam_list[i].influencer_joined).to.be.false
                expect($cam_list[i].status).to.satisfy(function check_status($status) {
                    return $status == 'ongoing' || $status == 'planning'
                })
            }

            // select status
            if (env == 'mobile') {
                cy.get('.filter_title').click()
                cy.get('.filter_item.item_4 > select').select('2') // 2: Not Joined
                cy.get('.search_done_button').click()
            } else {
                cy.get('.filter_item.item_4 > select').select('2') // 2: Not Joined
            }
            cy.wait(3000)

            // check display result
            cy.get('.campaigns_list').children().then($el => {
                expect($el.length).to.lte(cam_amount_filter)
            })
            cy.get('.campaigns_list > a').each($el => {
                expect($el.find('.campaign_info > .cam_last_row > .join_btn > button')).to.satisfy(function check_status($status) {
                    return $status.hasClass('status not_joined') == true || $status.hasClass('status comming_soon') == true
                })
            })
        })
    }

    function verify_card_info() {
        cy.get('.campaigns_list > a').each($card => {
            // check thumbnail
            expect($card.find('a > .campaign_img').attr('style')).to.include('https://storage.googleapis.com/casting-asia-v2/campaign/') 

            // check category
            expect($card.find('.campaign_info > .cam_first_row > .cam_category').text().split(',').length).to.gte(2) 

            // check title
            expect($card.find('.campaign_info > .cam_title > a').text()).to.not.be.empty 

            // check post requirement
            expect($card.find('.campaign_info > .cam_requirement').text()).to.not.be.empty 

            // check social icon
            expect($card.find('.campaign_info > .engagements > .eng_item > .icon').attr('class')).to.satisfy(function check_icon($icon) {
                return $icon.includes('icon_facebook') == true || $icon.includes('icon_instagram') == true
            }) 

            // check unit price
            expect($card.find('.campaign_info > .engagements > .eng_item')).to.satisfy(function check_price($item) {
                return parseFloat($item.find('.per_eng.grid_column_2 > .price').text()) > 0 || parseFloat($item.find('.per_eng.grid_column_3 > .price').text()) > 0
            }) 

            // check currency
            expect($card.find('.campaign_info > .engagements > .eng_item')).to.satisfy(function check_type($item) {
                return $item.find('.per_eng.grid_column_2 > .eng_name').text() == 'USD / Like' || $item.find('.per_eng.grid_column_3 > .eng_name').text() == 'USD / View'
            }) 

            // check period
            expect($card.find('.campaign_info > .cam_last_row > .period > .from.date > .day_month').text()).to.match(/[a-zA-Z]+ \d+/) 
            expect($card.find('.campaign_info > .cam_last_row > .period > .from.date > .year').text()).to.match(/^\d{4}$/) 
            expect($card.find('.campaign_info > .cam_last_row > .period > .to.date > .day_month').text()).to.match(/[a-zA-Z]+ \d+/) 
            expect($card.find('.campaign_info > .cam_last_row > .period > .to.date > .year').text()).to.match(/^\d{4}$/)  
        })
    }

    function verify_pagination() {
        cy.get('ul.pagination > li').then($li => {
            $li = $li.length

            // check current page is 1st page
            cy.get('ul.pagination > li:nth-child(3)').should('have.attr', 'class', 'active').find('a').should('have.text', '1')
            cy.get('ul.pagination > li:nth-child(1)').should('have.attr', 'class', 'disabled')
            cy.get('ul.pagination > li:nth-child(2)').should('have.attr', 'class', 'disabled')

            // check 2nd page is available
            cy.get('ul.pagination > li:nth-child(4)').then($page => {
                if ($page.find('a').text() != '2') {
                    cy.get('ul.pagination > li:nth-child(4)').should('have.attr', 'class', 'disabled')
                } else {
                    
                    // check move to next page
                    cy.get(`ul.pagination > li:nth-child(${$li - 1}) > a > i`).click()
                    cy.get('ul.pagination > li:nth-child(4)').should('have.attr', 'class', 'active').find('a').should('have.text', '2')
                    
                    // check move to previous page
                    cy.get('ul.pagination > li:nth-child(2) > a > i').click()
                    cy.get('ul.pagination > li:nth-child(3)').should('have.attr', 'class', 'active').find('a').should('have.text', '1')
                }
            })
        })
    }

    // test cases for desktop theme
    context('Verify campaign list on desktop', () => {
        it('Verify display order by ending soonest time', () => {
            verify_order()    
        })

        it('Verify filter by valid keyword', () => {
            verify_valid_keyword('test')
        })

        it('Verify filter by invalid keyword', () => {
            verify_invalid_keyword('#$$&^@#(*$*  @#!@#$#! ')
        })

        it('Verify filter by social network Facebook', () => {
            verify_sns(['facebook'])
        })

        it('Verify filter by social network Instagram', () => {
            verify_sns(['instagram'])
        })

        it('Verify filter by categories', () => {
            const categories = [1, 5, 7] // news, fanpage, food
            verify_categories(categories)
        })

        it('Verify filter by status Joined', () => {
            verify_joined_status()
        })

        it('Verify filter by status Not Joined', () => {
            verify_not_joined_status()
        })

        it('Verify campaign card info', () => {
            cy.wait(3000)
            verify_card_info()
        })

        it('Verify pagination', () => {
            verify_pagination()
        })
    })

    // test cases for mobile theme
    context('Verify campaign list on mobile', () => {
        it('Verify display order by ending soonest time', () => {
            cy.viewport(375, 667)
            verify_order()           
        })

        it('Verify filter by valid keyword', () => {
            cy.viewport(375, 667)
            verify_valid_keyword('test',  'mobile')
        })

        it('Verify filter by invalid keyword', () => {
            cy.viewport(375, 667)
            verify_invalid_keyword('#$$&^@#(*$*  @#!@#$#! ', 'mobile')
        })

        it('Verify filter by social network Facebook', () => {
            cy.viewport(375, 667)
            verify_sns(['facebook'], 'mobile')
        })

        it('Verify filter by social network Instagram', () => {
            cy.viewport(375, 667)
            verify_sns(['instagram'], 'mobile')
        })

        it('Verify filter by categories', () => {
            cy.viewport(375, 667)
            const categories = [1, 5, 7] // news, fanpage, food
            verify_categories(categories, 'mobile')
        })

        it('Verify filter by status Joined', () => {
            cy.viewport(375, 667)
            verify_joined_status('mobile')
        })

        it('Verify filter by status Not Joined', () => {
            cy.viewport(375, 667)
            verify_not_joined_status('mobile')
        })

        it('Verify campaign card info', () => {
            cy.viewport(375, 667)
            cy.wait(3000)
            verify_card_info()
        })

        it('Verify pagination', () => {
            cy.viewport(375, 667)
            verify_pagination()
        })
    })
})