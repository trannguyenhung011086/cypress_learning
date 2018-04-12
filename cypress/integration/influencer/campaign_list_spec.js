describe('Verify campaign list', function () {
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
        cam_list,
        cam_amount;

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                cam_list = $cam_list
                cam_amount = $cam_list.length
            }) // get total number of campaigns
        })
        cy.visit(url + '/campaign')
    })

    context('Verify campaign list on desktop', function () {
        it('Verify display order by ending soonest time', function () {
            var start_1, end_1, start_2, end_2;
            cy.get('.campaigns_list > a').each($card => {
                start_1 = (new Date($card.find('.from.date > .day_month').text() + ' ' + $card.find('.from.date > .year').text())).getTime()
                end_1 = (new Date($card.find('.to.date > .day_month').text() + ' ' + $card.find('.to.date > .year').text())).getTime()
                start_2 = (new Date($card.next().find('.from.date > .day_month').text() + ' ' + $card.next().find('.from.date > .year').text())).getTime()
                end_2 = (new Date($card.next().find('.to.date > .day_month').text() + ' ' + $card.next().find('.to.date > .year').text())).getTime()
                if (start_2 > 0 && end_2 > 0) {
                    expect(start_1).to.lte(start_2)
                    expect(end_1).to.lte(end_2)
                }
            })            
        })

        it('Verify filter by valid keyword', function () {
            const keyword = 'test'
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].title.toLowerCase()).to.include(keyword)
                }
                cy.get('.filter_item.keyword.item_1 > div > input').type(keyword)
                cy.wait(3000)
                cy.get('.campaigns_list > a').then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.cam_title').text()).to.include(keyword)
                })
            })
        })

        it('Verify filter by invalid keyword', function () {
            const keyword = ['<script>alert("text")</script>', '#$$&^@#(*$*@#!@#$#!']
            for (var i in keyword) {
                cy.get_campaigns(postgresToken, influencer, categories, keyword[i], social_medias).then($cam_list => {
                    expect($cam_list).to.be.empty
                })
                cy.get('.filter_item.keyword.item_1 > div > input').as('keyword_filter')
                cy.get('@keyword_filter').type(keyword[i])
                cy.wait(3000)
                cy.get('.campaigns_list').should('exist').then($list => {
                    expect($list.text().trim()).to.be.empty
                })
                cy.get('@keyword_filter').clear()
            }
        })

        it('Verify filter by social network Facebook', function () {
            const social_medias = ['facebook']
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].social_media_list).to.include('facebook')
                }
                cy.get('.filter_item.multi-select.item_2 > ss-multiselect-dropdown > div').as('social_filter')
                cy.get('@social_filter').click()
                cy.get('@social_filter').find(':nth-child(1) > span > span').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.icon.grid_column_1.icon_facebook_small')).to.exist
                    expect($el.find('.icon.grid_column_1.icon_instagram_color')).to.not.exist
                })
            })
        })

        it('Verify filter by social network Instagram', function () {
            const social_medias = ['instagram']
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].social_media_list).to.include('instagram')
                }
                cy.get('.filter_item.multi-select.item_2 > ss-multiselect-dropdown > div').as('social_filter')
                cy.get('@social_filter').click()
                cy.get('@social_filter').find(':nth-child(2) > span > span').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.icon.grid_column_1.icon_facebook_small')).to.not.exist
                    expect($el.find('.icon.grid_column_1.icon_instagram_color')).to.exist
                })
            })
        })

        it('Verify filter by one category', function () {
            const categories = [1] // news
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].cat_list_id).to.include(categories[0])
                }
                cy.get('.filter_item.multi-select.item_3 > ss-multiselect-dropdown > div').as('category_filter')
                cy.get('@category_filter').find('button').click()
                cy.get('@category_filter').find(`:nth-child(${categories[0]}) > span > span`).click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.cam_category').text().toLowerCase()).to.include('news')
                })
            })
        })

        it('Verify filter by categories', function () {
            const categories = [1, 5, 7] // news, fanpage, food
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].cat_list_id).to.satisfy(function check_cat_list($num) {
                        return $num.includes(categories[0]) == true || $num.includes(categories[1]) == true
                    })
                }
                cy.get('.filter_item.multi-select.item_3 > ss-multiselect-dropdown > div').as('category_filter')
                cy.get('@category_filter').find('button').click()
                cy.get('@category_filter').find(`:nth-child(${categories[0]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[1]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[2]}) > span > span`).click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.cam_category').text().toLowerCase()).to.satisfy(function check_category($text) {
                        return $text.indexOf('news') != -1 || $text.indexOf('fanpage') != -1 || $text.indexOf('food') != -1
                    })
                })
            })
        })

        it('Verify filter by status Joined', function () {
            cy.get_campaigns_joined(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].influencer_joined).to.be.true
                    expect($cam_list[i].status).to.equal('ongoing')
                }
                cy.get('.filter_item.item_4 > select').select('1') // 1: Joined
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.campaign_info > .cam_last_row > .join_btn > button.status.joined')).to.be.visible
                })
            })
        })

        it('Verify filter by status Not Joined', function () {
            cy.get_campaigns_not_joined(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].influencer_joined).to.be.false
                    expect($cam_list[i].status).to.satisfy(function check_status($status) {
                        return $status == 'ongoing' || $status == 'planning'
                    })
                }
                cy.get('.filter_item.item_4 > select').select('2') // 2: Not Joined
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.campaign_info > .cam_last_row > .join_btn > button')).to.satisfy(function check_status($status) {
                        return $status.hasClass('status not_joined') == true || $status.hasClass('status comming_soon') == true
                    })
                })
            })
        })

        it('Verify campaign card info', function () {
            cy.wait(3000)
            cy.get('.campaigns_list > a').each($card => {
                expect($card.find('a > .campaign_img').attr('style')).to.include('https://storage.googleapis.com/casting-asia-v2/campaign/') // check thumbnail
                expect($card.find('.campaign_info > .cam_first_row > .cam_category').text().split(',').length).to.gte(2) // check category
                expect($card.find('.campaign_info > .cam_title > a').text()).to.not.be.empty // check title
                expect($card.find('.campaign_info > .cam_requirement').text()).to.not.be.empty // check post requirement
                expect($card.find('.campaign_info > .engagements > .eng_item > .icon').attr('class')).to.satisfy(function check_icon($icon) {
                    return $icon.includes('icon_facebook') == true || $icon.includes('icon_instagram') == true
                }) // check social icon
                expect($card.find('.campaign_info > .engagements > .eng_item')).to.satisfy(function check_price($item) {
                    return parseFloat($item.find('.per_eng.grid_column_2 > .price').text()) > 0 || parseFloat($item.find('.per_eng.grid_column_3 > .price').text()) > 0
                }) // check unit price
                expect($card.find('.campaign_info > .engagements > .eng_item')).to.satisfy(function check_type($item) {
                    return $item.find('.per_eng.grid_column_2 > .eng_name').text() == 'USD / Like' || $item.find('.per_eng.grid_column_3 > .eng_name').text() == 'USD / View'
                }) // check currency
                expect($card.find('.campaign_info > .cam_last_row > .period > .from.date > .day_month').text()).to.match(/[a-zA-Z]+ \d+/) // check start date
                expect($card.find('.campaign_info > .cam_last_row > .period > .from.date > .year').text()).to.match(/^\d{4}$/) // check start year
                expect($card.find('.campaign_info > .cam_last_row > .period > .to.date > .day_month').text()).to.match(/[a-zA-Z]+ \d+/) // check end date
                expect($card.find('.campaign_info > .cam_last_row > .period > .to.date > .year').text()).to.match(/^\d{4}$/) // check end year
            })
        })

        it('Verify pagination', function () {
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
        })
    })

    context('Verify campaign list on mobile', function () {
        it('Verify display order by ending soonest time', function () {
            cy.viewport(375, 667)
            var start_1, end_1, start_2, end_2;
            cy.get('.campaigns_list > a').each($card => {
                start_1 = (new Date($card.find('.from.date > .day_month').text() + ' ' + $card.find('.from.date > .year').text())).getTime()
                end_1 = (new Date($card.find('.to.date > .day_month').text() + ' ' + $card.find('.to.date > .year').text())).getTime()
                start_2 = (new Date($card.next().find('.from.date > .day_month').text() + ' ' + $card.next().find('.from.date > .year').text())).getTime()
                end_2 = (new Date($card.next().find('.to.date > .day_month').text() + ' ' + $card.next().find('.to.date > .year').text())).getTime()
                if (start_2 > 0 && end_2 > 0) {
                    expect(start_1).to.lte(start_2)
                    expect(end_1).to.lte(end_2)
                }
            })            
        })

        it('Verify filter by valid keyword', function () {
            cy.viewport(375, 667)
            const keyword = 'test'
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].title.toLowerCase()).to.include(keyword)
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.keyword.item_1 > div > input').type(keyword)
                cy.wait(3000)
                cy.get('.campaigns_list > a').then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.cam_title').text()).to.include(keyword)
                })
            })
        })

        it('Verify filter by invalid keyword', function () {
            const keyword = ['<script>alert("text")</script>', '#$$&^@#(*$*@#!@#$#!']
            cy.viewport(375, 667)
            for (var i in keyword) {
                cy.get_campaigns(postgresToken, influencer, categories, keyword[i], social_medias).then($cam_list => {
                    expect($cam_list).to.be.empty
                })
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.keyword.item_1 > div > input').as('keyword_filter')
                cy.get('@keyword_filter').type(keyword[i])
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').should('exist').then($list => {
                    expect($list.text().trim()).to.be.empty
                })
                cy.get('@keyword_filter').clear()
            }
        })

        it('Verify filter by social network Facebook', function () {
            const social_medias = ['facebook']
            cy.viewport(375, 667)
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].social_media_list).to.include('facebook')
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.multi-select.item_2 > ss-multiselect-dropdown > div').as('social_filter')
                cy.get('@social_filter').click()
                cy.get('@social_filter').find(':nth-child(1) > span > span').click()
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.icon.grid_column_1.icon_facebook_small')).to.exist
                    expect($el.find('.icon.grid_column_1.icon_instagram_color')).to.not.exist
                })
            })
        })

        it('Verify filter by social network Instagram', function () {
            const social_medias = ['instagram']
            cy.viewport(375, 667)
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].social_media_list).to.include('instagram')
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.multi-select.item_2 > ss-multiselect-dropdown > div').as('social_filter')
                cy.get('@social_filter').click()
                cy.get('@social_filter').find(':nth-child(2) > span > span').click()
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.icon.grid_column_1.icon_facebook_small')).to.not.exist
                    expect($el.find('.icon.grid_column_1.icon_instagram_color')).to.exist
                })
            })
        })

        it('Verify filter by one category', function () {
            const categories = [1] // news
            cy.viewport(375, 667)
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].cat_list_id).to.include(categories[0])
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.multi-select.item_3 > ss-multiselect-dropdown > div').as('category_filter')
                cy.get('@category_filter').find('button').click()
                cy.get('@category_filter').find(`:nth-child(${categories[0]}) > span > span`).click()
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.cam_category').text().toLowerCase()).to.include('news')
                })
            })
        })

        it('Verify filter by categories', function () {
            const categories = [1, 5, 7] // news, fanpage, food
            cy.viewport(375, 667)
            cy.get_campaigns(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].cat_list_id).to.satisfy(function check_cat_list($num) {
                        return $num.includes(categories[0]) == true || $num.includes(categories[1]) == true
                    })
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.multi-select.item_3 > ss-multiselect-dropdown > div').as('category_filter')
                cy.get('@category_filter').find('button').click()
                cy.get('@category_filter').find(`:nth-child(${categories[0]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[1]}) > span > span`).click()
                cy.get('@category_filter').find(`:nth-child(${categories[2]}) > span > span`).click()
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.cam_category').text().toLowerCase()).to.satisfy(function check_category($text) {
                        return $text.indexOf('news') != -1 || $text.indexOf('fanpage') != -1 || $text.indexOf('food') != -1
                    })
                })
            })
        })

        it('Verify filter by status Joined', function () {
            cy.viewport(375, 667)
            cy.get_campaigns_joined(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].influencer_joined).to.be.true
                    expect($cam_list[i].status).to.equal('ongoing')
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.item_4 > select').select('1') // 1: Joined
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.campaign_info > .cam_last_row > .join_btn > button.status.joined')).to.be.visible
                })
            })
        })

        it('Verify filter by status Not Joined', function () {
            cy.viewport(375, 667)
            cy.get_campaigns_not_joined(postgresToken, influencer, categories, keyword, social_medias).then($cam_list => {
                var cam_amount_filter = $cam_list.length
                expect(cam_amount).to.be.gte(cam_amount_filter)
                for (var i in $cam_list) {
                    expect($cam_list[i].influencer_joined).to.be.false
                    expect($cam_list[i].status).to.satisfy(function check_status($status) {
                        return $status == 'ongoing' || $status == 'planning'
                    })
                }
                cy.get('.filter_title > div').click()
                cy.get('.filter_item.item_4 > select').select('2') // 2: Not Joined
                cy.get('.search_done_button').click()
                cy.wait(3000)
                cy.get('.campaigns_list').children().then($el => {
                    expect($el.length).to.lte(cam_amount_filter)
                })
                cy.get('.campaigns_list > a').each($el => {
                    expect($el.find('.campaign_info > .cam_last_row > .join_btn > button')).to.satisfy(function check_status($status) {
                        return $status.hasClass('status not_joined') == true || $status.hasClass('status comming_soon') == true
                    })
                })
            })
        })

        it('Verify campaign card info', function () {
            cy.viewport(375, 667)
            cy.get('.filter_title > div').click()
            cy.get('.filter_item.item_4 > select').select('2') // 2: Not Joined
            cy.get('.search_done_button').click()
            cy.wait(3000)
            cy.get('.campaigns_list > a').each($card => {
                expect($card.find('a > .campaign_img').attr('style')).to.include('https://storage.googleapis.com/casting-asia-v2/campaign/') // check thumbnail
                expect($card.find('.campaign_info > .cam_first_row > .cam_category').text().split(',').length).to.gte(2) // check category
                expect($card.find('.campaign_info > .cam_title > a').text()).to.not.be.empty // check title
                expect($card.find('.campaign_info > .cam_requirement').text()).to.not.be.empty // check post requirement
                expect($card.find('.campaign_info > .engagements > .eng_item > .icon').attr('class')).to.satisfy(function check_icon($icon) {
                    return $icon.includes('icon_facebook') == true || $icon.includes('icon_instagram') == true
                }) // check social icon
                expect($card.find('.campaign_info > .engagements > .eng_item')).to.satisfy(function check_price($item) {
                    return parseFloat($item.find('.per_eng.grid_column_2 > .price').text()) > 0 || parseFloat($item.find('.per_eng.grid_column_3 > .price').text()) > 0
                }) // check unit price
                expect($card.find('.campaign_info > .engagements > .eng_item')).to.satisfy(function check_type($item) {
                    return $item.find('.per_eng.grid_column_2 > .eng_name').text() == 'USD / Like' || $item.find('.per_eng.grid_column_3 > .eng_name').text() == 'USD / View'
                }) // check currency
                expect($card.find('.campaign_info > .cam_last_row > .period > .from.date > .day_month').text()).to.match(/[a-zA-Z]+ \d+/) // check start date
                expect($card.find('.campaign_info > .cam_last_row > .period > .from.date > .year').text()).to.match(/^\d{4}$/) // check start year
                expect($card.find('.campaign_info > .cam_last_row > .period > .to.date > .day_month').text()).to.match(/[a-zA-Z]+ \d+/) // check end date
                expect($card.find('.campaign_info > .cam_last_row > .period > .to.date > .year').text()).to.match(/^\d{4}$/) // check end year
            })
        })

        it('Verify pagination', function () {
            cy.viewport(375, 667)
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
        })
    })
})