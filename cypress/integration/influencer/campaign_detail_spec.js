describe('Verify campaign detail', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, cam_id, revenue_limit;

    function replaceInArray(str) {
        return str.replace(/\s/, '')
    }

    // log in
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
    })

    // helper functions grouping test steps
    function get_ongoing_campaign() {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            for (var i = 0; i < $body.length; i++) {
                if ($body[i].status == 'ongoing') {
                    cam_id = $body[i].id
                    break
                }
            }
            if (cam_id == undefined) {
                throw 'No campaign satisfied the filter!'
            }
            return cam_id
        })
    }

    function get_ongoing_list() {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            var cam_list = []

            // get list of ongoing campaigns
            for (var i = 0; i < $body.length; i++) {
                if ($body[i].status == 'ongoing') {
                    cam_list.push($body[i].id)
                }
            }
            return cam_list
        })
    }

    function get_click_join_status(click) {
        return get_ongoing_list(postgresToken, influencer).then(cam_list => {
            cam_list.forEach(cam => {
                return cy.check_click_join(postgresToken, influencer, cam).then($body => {
                    if ($body.length == 0 && click == 'not_click') {
                        cam_id = cam
                    } else if ($body.length > 0 && click == 'click') {
                        cam_id = cam
                    }
                    return cam_id
                })
            })
        })
    }

    function get_basic_info() {
        cy.get('.left-form > .form_group:nth-child(1) > p').as('advertiser')
        cy.get('.left-form > .form_group:nth-child(2) > p').as('cam_name')
        cy.get('.left-form > .two_collum > .form_group:nth-child(1) > a').as('landing_url')
        cy.get('.left-form > .two_collum > .form_group:nth-child(2) > a').as('youtube_url')
        cy.get('.left-form > .form_group:nth-child(4) > p').as('product_info')
        cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
        cy.get('.left-form > .form_group:nth-child(7) > p').as('categories')
        cy.get('.box > .form_group > .form_group > .day_month:nth-child(2)').as('start_date')
        cy.get('.box > .form_group > .form_group > .year:nth-child(3)').as('start_year')
        cy.get('.box > .form_group > .form_group > .day_month:nth-child(5)').as('end_date')
        cy.get('.box > .form_group > .form_group > .year:nth-child(6)').as('end_year')
    }

    function verify_basic_info(cam_id) {
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            // check campaign id
            expect($body[0].id).to.equal(parseInt(cam_id))

            cy.get('@advertiser').invoke('text').should('equal', $body[0].name)
            cy.get('@cam_name').invoke('text').should('equal', $body[0].title)

            cy.get('@landing_url').invoke('text').then($landing_url => {
                if ($body[0].info_url.length == 0) {
                    expect($landing_url).to.equal('-')
                } else {
                    expect($landing_url).to.equal($body[0].info_url)
                }
            })

            cy.get('@youtube_url').invoke('text').then($youtube_url => {
                if ($body[0].youtube_url.length == 0) {
                    expect($youtube_url).to.equal('-')
                } else {
                    expect($youtube_url).to.equal($body[0].youtube_url)
                }
            })

            cy.get('@product_info').invoke('text').should('equal', $body[0].product_info)
            cy.get('@post_req').invoke('text').should('equal', $body[0].requirements)

            cy.get('@categories').invoke('text').then($categories => {
                var arr = $categories.split(',');
                expect(arr.map(str => str.replace(/\s/, ''))).to.have.members($body[0].cat_list)
            })

            // convert time to same format then compare
            var start = new Date($body[0].start_period),
                end = new Date($body[0].end_period);
            start = start.toString().split(' ')
            end = end.toString().split(' ')

            cy.get('@start_date').invoke('text').then($time => {
                $time = $time.split(' ').sort()
                expect(start[1]).to.equal($time[2])
                expect(parseInt(start[2])).to.equal(parseInt($time[1]))
            })
            cy.get('@start_year').invoke('text').then($time => {
                expect(parseInt(start[3])).to.equal(parseInt($time))
            })
            cy.get('@end_date').invoke('text').then($time => {
                $time = $time.split(' ').sort()
                expect(end[1]).to.equal($time[2])
                expect(parseInt(end[2])).to.equal(parseInt($time[1]))
            })
            cy.get('@end_year').invoke('text').then($time => {
                expect(parseInt(end[3])).to.equal(parseInt($time))
            })
        })
    }

    function check_hashtags(cam_id) {
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            cy.get('.left-form > .form_group:nth-child(6) > .hashtag').each($label => {
                expect($body[0].hashtags).to.include($label.text().trim())
            })
        })
    }

    function get_joined_campaign() {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            for (var i = 0; i < $body.length; i++) {
                if ($body[i].influencer_joined == true && $body[i].status == 'ongoing') {
                    cam_id = $body[i].id
                    break
                }
            }
            if (cam_id == undefined) {
                throw 'No campaign satisfied the filter!'
            }
            return cam_id
        })
    }

    function verify_joined_status(cam_id) {
        // check top join button and rules
        cy.get('button.joined_campaign').invoke('text').should('equal', 'Joined')
        cy.get('.form-group.box-rule-click').find('.rule-campaign').should('be.visible')

        // check status in API
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            expect($body[0].id).to.equal(parseInt(cam_id))
            expect($body[0].influencer_joined).to.be.true
            expect($body[0].status).to.equal('ongoing')
        })
    }

    function call_join_api(cam_id) {
        cy.join_campaign(postgresToken, influencer, cam_id) 
        cy.wait(3000)
    }

    function check_popup_content(cam_id) {
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            // check step 1
            cy.get('@popup').find('.guiline_item > p').then($req => {
                expect($req.text()).to.equal($body[0].requirements)
            })

            // click Accept
            cy.get('@popup').find('.next-step > span').click() 

            // check step 2
            cy.get('@popup').find('.guiline_item > ul > li').each($term => {
                expect($term.text()).to.not.be.empty
            })

            // check campaign period
            cy.get('@popup').find('.guiline_item > ul > li > .date').invoke('text').then($text => {
                var start_date = $text.split('to')[0].split(',')[0].trim(),
                    start_year = $text.split('to')[0].split(',')[1].trim(),
                    end_date = $text.split('to')[1].split(',')[0].trim(),
                    end_year = $text.split('to')[1].split(',')[1].trim();
                cy.get('@start_date').invoke('text').invoke('trim').should('equal', start_date)
                cy.get('@start_year').invoke('text').invoke('trim').should('equal', start_year)
                cy.get('@end_date').invoke('text').invoke('trim').should('equal', end_date)
                cy.get('@end_year').invoke('text').invoke('trim').should('equal', end_year)
            })

            // check revenue limit
            cy.get('@popup').find('.guiline_item > ul > li:nth-child(2) > span:nth-child(2)').invoke('text').then($revenue_limit => {
                expect(parseFloat($revenue_limit.replace(',', ''))).to.equal(Math.round($body[0].influencer_revenue_limit * 1000) / 1000)
            })
            cy.get('@popup').find('.guiline_item > ul > li:nth-child(2) > span:nth-child(3)').contains(/USD/)

            // click Accept
            cy.get('@popup').find('.next-step > span').click() 

            // check step 3
            cy.get('@popup').find('.list_hastags > label').each($label => {
                expect($body[0].hashtags).to.include($label.text().trim())
            })

            // click Copy
            cy.get('@popup').find('.btn.copy').click() 
            cy.get('.copy_inform_box').should('be.visible').contains('Hashtags copied to Clipboard')

            // check SNS button
            cy.get('@popup').find('div.social_buttons > .media_item').then($el => {
                if ($body[0].social_media_list[0] == 'facebook') {
                    expect($el.attr('href')).to.include('https://www.facebook.com')
                } else if ($body[0].social_media_list[0] == 'instagram') {
                    expect($el.attr('href')).to.include('https://www.instagram.com')
                }
            })
        })
    }

    function close_popup() {
        cy.get('.material-icons.close_popup').click()
        cy.get('@popup').should('not.be.visible')
    }

    function verify_rules_popup(cam_id) {
        call_join_api(cam_id)
        cy.get('.rule-campaign').click()
        cy.get('app-guidline-popup').as('popup')
        cy.get('.box > .form_group > .form_group > .day_month:nth-child(2)').as('start_date')
        cy.get('.box > .form_group > .form_group > .year:nth-child(3)').as('start_year')
        cy.get('.box > .form_group > .form_group > .day_month:nth-child(5)').as('end_date')
        cy.get('.box > .form_group > .form_group > .year:nth-child(6)').as('end_year')
        check_popup_content(cam_id)
        close_popup()
    }

    function verify_join_popup(cam_id, env='desktop') {
        call_join_api(cam_id)
        if (env == 'mobile') {
            cy.get('.content_breadcrumbs > div > .join_campaign_mobile').scrollIntoView().click() 
        } else {
            cy.get('button.btn.join_campaign.width-180.float_right').scrollIntoView().click() 
        }
        cy.get('app-guidline-popup').as('popup')
        cy.get('.box > .form_group > .form_group > .day_month:nth-child(2)').as('start_date')
        cy.get('.box > .form_group > .form_group > .year:nth-child(3)').as('start_year')
        cy.get('.box > .form_group > .form_group > .day_month:nth-child(5)').as('end_date')
        cy.get('.box > .form_group > .form_group > .year:nth-child(6)').as('end_year')
        check_popup_content(cam_id)
        close_popup()
    }

    function get_not_join_campaign(type='') {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            if (type == '') {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
            } else if (type == 'facebook') {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'facebook' && $body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
            } else if (type == 'instagram') {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'instagram' && $body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
            }
            return cam_id
        }).then(cam_id => {
            if (cam_id == undefined) {
                throw 'No campaign satisfied the filter!'
            }
        })
    }

    function verify_not_join_status(cam_id) {
        cy.get('.content_breadcrumbs > div> button.join_campaign').invoke('text').should('equal', 'Join Campaign')
        cy.get('.box > div > button.btn.join_campaign').invoke('text').should('equal', 'Join Campaign')
        cy.get('.form-group.box-rule-click.hidden').should('exist')
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            expect($body[0].id).to.equal(parseInt(cam_id))
            expect($body[0].influencer_joined).to.be.false
            expect($body[0].status).to.satisfy(function check_status($status) {
                return $status == 'ongoing' || $status == 'planning'
            })
        })
    }

    function get_upcoming_campaign() {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            for (var i = 0; i < $body.length; i++) {
                if ($body[i].status == 'planning') {
                    cam_id = $body[i].id
                    break
                }
            }
            if (cam_id == undefined) {
                throw 'No campaign satisfied the filter!'
            }
            return cam_id
        })
    }

    function verify_upcoming_status(cam_id) {
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            expect($body[0].id).to.equal(parseInt(cam_id))
            expect($body[0].influencer_joined).to.be.false
            expect($body[0].status).to.equal('planning')
        })
        cy.get('.content_breadcrumbs > div> button.btn.up_coming').invoke('text').should('equal', 'UpComing')
        cy.get('.form-group.box-rule-click.hidden').should('exist')
    }

    function verify_social(cam_id, social) {
        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            expect($body[0].id).to.equal(parseInt(cam_id))

            // check social
            if (social == 'facebook') {
                cy.get('.price_column:nth-child(1) > div > i').invoke('hasClass', 'icon icon_facebook_line').should('be.true')
                expect($body[0].social_media_list[0]).to.equal('facebook')
            } else if (social == 'instagram') {
                cy.get('.price_column:nth-child(1) > div > i').invoke('hasClass', 'icon icon_instagram_color').should('be.true')
                expect($body[0].social_media_list[0]).to.equal('instagram')
            }

            // check like price
            if ($body[0].units_engagement[0].price == 0) {
                cy.get('.price_column:nth-child(2)').should('not.exist')
            } else {
                cy.get('.price_column:nth-child(2)').as('like')
                cy.get('@like').find('div > div').invoke('text').then($like_price => {
                    expect(parseFloat($like_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[0].price * 1000) / 1000)
                })
                cy.get('@like').find('div > div > span').invoke('text').then($like_currency => {
                    expect($like_currency).to.match(/usd/)
                })
            }

            // check view price
            if ($body[0].units_engagement[1].price == 0) {
                cy.get('.price_column:nth-child(3)').should('not.exist')
            } else {
                cy.get('.price_column:nth-child(3)').as('view')
                cy.get('@view').find('div > div').invoke('text').then($view_price => {
                    expect(parseFloat($view_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[1].price * 1000) / 1000)
                })
                cy.get('@view').find('div > div > span').invoke('text').then($view_currency => {
                    expect($view_currency).to.match(/usd/)
                })
            }

            // check revenue limit
            cy.get('.form_group.revenue_limit').find('div > div').invoke('text').then($revenue_limit => {
                expect(parseFloat($revenue_limit.replace(',', ''))).to.equal(Math.round($body[0].influencer_revenue_limit * 1000) / 1000)
            })
            cy.get('.form_group.revenue_limit').find('.currency').contains(/usd/)
        })
    }

    function get_blank_image_campaign() {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            for (var i = 0; i < $body.length; i++) {
                if ($body[i].medias.length == 1 && $body[i].status == 'ongoing') {
                    cam_id = $body[i].id
                    break
                }
            }
            if (cam_id == undefined) {
                throw 'No campaign satisfied the filter!'
            }
            return cam_id
        })
    }

    function verify_blank_image() {
        cy.get('.right-form.media > div').as('media')
        cy.get('@media').should('be.empty')
    }

    function get_multi_image_campaign() {
        return cy.get_campaigns(postgresToken, influencer).then($body => {
            for (var i = 0; i < $body.length; i++) {
                if ($body[i].medias.length > 2 && $body[i].status == 'ongoing') {
                    cam_id = $body[i].id
                    break
                }
            }
            if (cam_id == undefined) {
                throw 'No campaign satisfied the filter!'
            }
            return cam_id
        })
    }

    function verify_multi_image(cam_id) {
        cy.get('.ngxcarousel > div > div.ngxcarousel-items').as('media')
        cy.get('.ngxcarouselPointDefault > .ngxcarouselPoint').as('carousel')
        cy.get('.ngxcarousel > button.leftRs > i').as('left')
        cy.get('.ngxcarousel > button.rightRs > i').as('right')

        cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
            expect($body[0].id).to.equal(parseInt(cam_id))

            // check number of images
            cy.get('@media').children().should('have.length', $body[0].medias.length - 1)
            cy.get('@carousel').children().should('have.length', $body[0].medias.length - 1)
            
            // check image url and carousel
            for (var i = 1; i <= $body[0].medias.length - 1; i++) {
                cy.get('@media').find(`ngx-item:nth-child(${i}) > div > img`).should('have.attr', 'src', $body[0].medias[i])
                cy.get('@carousel').find(`li:nth-child(${i})`).click().should('have.class', 'active')
            }
        })
    }

    // test cases for desktop theme
    context('Verify campaign detail on desktop', () => {
        it('Verify basic campaign info', () => {
            get_ongoing_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                get_basic_info()
                verify_basic_info(cam_id)
            })
        })

        it('Verify hashtags hidden before click Join', () => {
            get_click_join_status('not_click').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').should('not.be.visible')
            })
        })

        it('Verify hashtags display after click Join', () => {
            get_click_join_status('click').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').should('be.visible')
                check_hashtags(cam_id)
            })
        })

        it('Verify Joined status', () => {
            get_joined_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_joined_status(cam_id)
            })
        })

        it('Verify Not Join status', () => {
            get_not_join_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_not_join_status(cam_id)
            })
        })

        it('Verify rules popup', () => {
            get_joined_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_rules_popup(cam_id)
            })
        })

        it('Verify joining popup', () => {
            get_not_join_campaign('instagram').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_join_popup(cam_id)
            })
        })

        it('Verify Upcoming status', () => {
            get_upcoming_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_upcoming_status(cam_id)
            })
        })

        it('Verify social network Facebook', () => {
            get_not_join_campaign('facebook').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_social(cam_id, 'facebook')
            })
        })

        it('Verify social network Instagram', () => {
            get_not_join_campaign('instagram').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_social(cam_id, 'instagram')
            })
        })

        it('Verify blank image', () => {
            get_blank_image_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_blank_image()
            })
        })

        it('Verify multiple images', () => {
            get_multi_image_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_multi_image(cam_id)
            })
        })
    })

    // test cases for desktop theme
    context('Verify campaign detail on mobile', () => {
        it('Verify basic campaign info', () => {
            cy.viewport(375, 667)
            get_ongoing_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                get_basic_info()
                verify_basic_info(cam_id)
            })
        })

        it('Verify hashtags hidden before click Join', () => {
            cy.viewport(375, 667)
            get_click_join_status('not_click').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').should('not.be.visible')
            })
        })

        it('Verify hashtags display after click Join', () => {
            cy.viewport(375, 667)
            get_click_join_status('click').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').should('be.visible')
                check_hashtags(cam_id)
            })
        })

        it('Verify Joined status', () => {
            cy.viewport(375, 667)
            get_joined_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_joined_status(cam_id)
            })
        })

        it('Verify Not Join status', () => {
            cy.viewport(375, 667)
            get_not_join_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_not_join_status(cam_id)
            })
        })

        it('Verify rules popup', () => {
            cy.viewport(375, 667)
            get_joined_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_rules_popup(cam_id)
            })
        })

        it('Verify joining popup', () => {
            cy.viewport(375, 667)
            get_not_join_campaign('instagram').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_join_popup(cam_id, 'mobile')
            })
        })

        it('Verify Upcoming status', () => {
            cy.viewport(375, 667)
            get_upcoming_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_upcoming_status(cam_id)
            })
        })

        it('Verify social network Facebook', () => {
            cy.viewport(375, 667)
            get_not_join_campaign('facebook').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_social(cam_id, 'facebook')
            })
        })

        it('Verify social network Instagram', () => {
            cy.viewport(375, 667)
            get_not_join_campaign('instagram').then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_social(cam_id, 'instagram')
            })
        })

        it('Verify blank image', () => {
            cy.viewport(375, 667)
            get_blank_image_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_blank_image()
            })
        })

        it('Verify multiple images', () => {
            cy.viewport(375, 667)
            get_multi_image_campaign().then(cam_id => {
                cy.visit(url + '/campaign/' + cam_id)
                verify_multi_image(cam_id)
            })
        })
    })
})