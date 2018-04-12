describe('Verify campaign detail', function () {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken;

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
    })

    context('Verify campaign detail on desktop', function () {
        it('Verify basic campaign info', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(1) > p').as('advertiser')
                cy.get('.left-form > .form_group:nth-child(2) > p').as('cam_name')
                cy.get('.left-form > .two_collum > .form_group:nth-child(1) > a').as('landing_url')
                cy.get('.left-form > .two_collum > .form_group:nth-child(2) > a').as('youtube_url')
                cy.get('.left-form > .form_group:nth-child(4) > p').as('product_info')
                cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').as('hashtags')
                cy.get('.left-form > .form_group:nth-child(7) > p').as('categories')
                cy.get('.box > .form-group > .form_group > .day_month:nth-child(2)').as('start_date')
                cy.get('.box > .form-group > .form_group > .year:nth-child(3)').as('start_year')
                cy.get('.box > .form-group > .form_group > .day_month:nth-child(5)').as('end_date')
                cy.get('.box > .form-group > .form_group > .year:nth-child(6)').as('end_year')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
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
                    cy.get('@hashtags').each($label => {
                        expect($body[0].hashtags).to.include($label.text().trim())
                    })
                    cy.get('@categories').invoke('text').then($categories => {
                        expect($categories.replace(/\s/g, '').split(',')).to.have.members($body[0].cat_list)
                    })
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
            })
        })

        it('Verify Joined status', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == true && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('button.joined_campaign').as('top_button')
                cy.get('.form-group.box-rule-click').as('rules')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].influencer_joined).to.be.true
                    expect($body[0].status).to.equal('ongoing')
                })
                cy.get('@top_button').invoke('text').should('equal', 'Joined')
                cy.get('@rules').find('.icon').should('be.visible')
                cy.get('@rules').find('.rule-campaign').should('be.visible')
            })
        })

        it('Verify rules popup', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == true && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').as('hashtags')
                cy.join_campaign(postgresToken, influencer, cam_id) // call Join API
                cy.wait(3000)
                cy.get('.rule-campaign').click()
                cy.get('app-guidline-popup').as('popup')
                cy.log('check step 1')
                cy.get('@popup').find('.guiline_item > p').then($req => {
                    cy.get('@post_req').contains($req.text())
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 2')
                cy.get('@popup').find('.guiline_item > ul > li').each($term => {
                    expect($term.text()).to.not.be.empty
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 3')
                cy.get('@popup').find('.list_hastags > label').each($label => {
                    cy.get('@hashtags').contains($label.text().trim())
                })
                cy.get('@popup').find('.btn.copy').click() // click Copy
                cy.get('.copy_inform_box').should('be.visible').contains('Hashtags copied to Clipboard')
                cy.log('check SNS button link')
                cy.get('@popup').find('div.social_buttons > .media_item').should('be.visible').then($el => {
                    expect($el.attr('href')).to.satisfy(function check_social_url($href) {
                        return ($href.indexOf('https://www.facebook.com') != -1 || $href.indexOf('https://www.instagram.com') != -1)
                    })
                })
                cy.get('.material-icons.close_popup').click()
                cy.get('@popup').should('not.be.visible')
            })
        })

        it('Verify Not Joined status', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.content_breadcrumbs > div> button.join_campaign').as('top_button')
                cy.get('.box > div > button.btn.join_campaign').as('bottom_button')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].influencer_joined).to.be.false
                    expect($body[0].status).to.satisfy(function check_status($status) {
                        return $status == 'ongoing' || $status == 'planning'
                    })
                })
                cy.get('@top_button').invoke('text').should('equal', 'Join Campaign')
                cy.get('@bottom_button').invoke('text').should('equal', 'Join Campaign')
                cy.get('.form-group.box-rule-click.hidden').should('exist')
            })
        })

        it('Verify joining popup', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'instagram' && $body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').as('hashtags')
                cy.join_campaign(postgresToken, influencer, cam_id) // call Join API
                cy.wait(3000)
                cy.get('button.btn.join_campaign.width-180.float_right').scrollIntoView().click() // click bottom Join button
                cy.get('app-guidline-popup').as('popup')
                cy.log('check step 1')
                cy.get('@popup').find('.guiline_item > p').then($req => {
                    cy.get('@post_req').contains($req.text())
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 2')
                cy.get('@popup').find('.guiline_item > ul > li').each($term => {
                    expect($term.text()).to.not.be.empty
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 3')
                cy.get('@popup').find('.list_hastags > label').each($label => {
                    cy.get('@hashtags').contains($label.text().trim())
                })
                cy.get('@popup').find('.btn.copy').click() // click Copy
                cy.get('.copy_inform_box').should('be.visible').contains('Hashtags copied to Clipboard')
                cy.log('check SNS button link')
                cy.get('@popup').find('div.social_buttons > .media_item').should('be.visible').then($el => {
                    expect($el.attr('href')).to.satisfy(function check_social_url($href) {
                        return ($href.indexOf('https://www.facebook.com') != -1 || $href.indexOf('https://www.instagram.com') != -1)
                    })
                })
                cy.get('.material-icons.close_popup').click()
                cy.get('@popup').should('not.be.visible')
            })
        })

        it('Verify Upcoming status', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == false && $body[i].status == 'planning') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].influencer_joined).to.be.false
                    expect($body[0].status).to.equal('planning')
                })
                cy.get('.content_breadcrumbs > div> button.btn.up_coming').invoke('text').should('equal', 'UpComing')
                cy.get('.form-group.box-rule-click.hidden').should('exist')
            })
        })

        it('Verify social network Facebook', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'facebook' && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.price_column:nth-child(1) > div > i').as('icon')
                cy.get('.price_column:nth-child(2)').as('like')
                cy.get('.price_column:nth-child(3)').as('view')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].social_media_list.length).to.equal(1)
                    expect($body[0].social_media_list[0]).to.equal('facebook')
                    expect($body[0].units_engagement[0].engagement_unit_desc).to.equal('like')
                    expect($body[0].units_engagement[1].engagement_unit_desc).to.equal('view')
                    cy.get('@icon').invoke('hasClass', 'icon icon_facebook_line').should('be.true')
                    if ($body[0].units_engagement[0].price == 0) {
                        cy.get('@like').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@like').find('div > div').invoke('text').then($like_price => {
                            expect(parseFloat($like_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[0].price * 1000) / 1000)
                        })
                        cy.get('@like').find('div > div > span').invoke('text').then($like_currency => {
                            expect($like_currency.trim()).to.equal('usd')
                        })
                    }
                    if ($body[0].units_engagement[1].price == 0) {
                        cy.get('@view').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@view').find('div > div').invoke('text').then($view_price => {
                            expect(parseFloat($view_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[1].price * 1000) / 1000)
                        })
                        cy.get('@view').find('div > div > span').invoke('text').then($view_currency => {
                            expect($view_currency.trim()).to.equal('usd')
                        })
                    }
                })
            })
        })

        it('Verify social network Instagram', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'instagram' && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.price_column:nth-child(1) > div > i').as('icon')
                cy.get('.price_column:nth-child(2)').as('like')
                cy.get('.price_column:nth-child(3)').as('view')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].social_media_list.length).to.equal(1)
                    expect($body[0].social_media_list[0]).to.equal('instagram')
                    expect($body[0].units_engagement[0].engagement_unit_desc).to.equal('like')
                    expect($body[0].units_engagement[1].engagement_unit_desc).to.equal('view')
                    cy.get('@icon').invoke('hasClass', 'icon icon_instagram_color').should('be.true')
                    if ($body[0].units_engagement[0].price == 0) {
                        cy.get('@like').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@like').find('div > div').invoke('text').then($like_price => {
                            expect(parseFloat($like_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[0].price * 1000) / 1000)
                        })
                        cy.get('@like').find('div > div > span').invoke('text').then($like_currency => {
                            expect($like_currency.trim()).to.equal('usd')
                        })
                    }
                    if ($body[0].units_engagement[1].price == 0) {
                        cy.get('@view').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@view').find('div > div').invoke('text').then($view_price => {
                            expect(parseFloat($view_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[1].price * 1000) / 1000)
                        })
                        cy.get('@view').find('div > div > span').invoke('text').then($view_currency => {
                            expect($view_currency.trim()).to.equal('usd')
                        })
                    }
                })
            })
        })

        it('Verify blank image', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].medias.length == 1 && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.right-form.media > div').as('media')
                cy.get('@media').should('be.empty')
            })
        })

        it('Verify one image', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].medias.length == 2 && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.ngxcarousel > div > div.ngxcarousel-items > ngx-item > div > img').as('media')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    cy.get('@media').should('have.attr', 'src', $body[0].medias[1])
                })
            })
        })

        it('Verify multiple images', function () {
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].medias.length > 2 && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.ngxcarousel > div > div.ngxcarousel-items').as('media')
                cy.get('.ngxcarouselPointDefault > .ngxcarouselPoint').as('carousel')
                cy.get('.ngxcarousel > button.leftRs > i').as('left')
                cy.get('.ngxcarousel > button.rightRs > i').as('right')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    cy.log('check number of images')
                    cy.get('@media').children().should('have.length', $body[0].medias.length - 1)
                    cy.get('@carousel').children().should('have.length', $body[0].medias.length - 1)
                    cy.log('check image url and carousel')
                    for (var i = 1; i <= $body[0].medias.length - 1; i++) {
                        cy.get('@media').find(`ngx-item:nth-child(${i}) > div > img`).should('have.attr', 'src', $body[0].medias[i])
                        cy.get('@carousel').find(`li:nth-child(${i})`).click().should('have.class', 'active')
                        if (i < $body[0].medias.length - 1) {
                            cy.get('@right').click().get('@carousel').find(`li:nth-child(${i + 1})`).should('have.class', 'active')
                            cy.get('@left').click().get('@carousel').find(`li:nth-child(${i})`).should('have.class', 'active')
                        }
                    }
                })
            })
        })
    })

    context('Verify campaign detail on mobile', function () {
        it('Verify basic campaign info', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(1) > p').as('advertiser')
                cy.get('.left-form > .form_group:nth-child(2) > p').as('cam_name')
                cy.get('.left-form > .two_collum > .form_group:nth-child(1) > a').as('landing_url')
                cy.get('.left-form > .two_collum > .form_group:nth-child(2) > a').as('youtube_url')
                cy.get('.left-form > .form_group:nth-child(4) > p').as('product_info')
                cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').as('hashtags')
                cy.get('.left-form > .form_group:nth-child(7) > p').as('categories')
                cy.get('.box > .form-group > .form_group > .day_month:nth-child(2)').as('start_date')
                cy.get('.box > .form-group > .form_group > .year:nth-child(3)').as('start_year')
                cy.get('.box > .form-group > .form_group > .day_month:nth-child(5)').as('end_date')
                cy.get('.box > .form-group > .form_group > .year:nth-child(6)').as('end_year')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
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
                    cy.get('@hashtags').each($label => {
                        expect($body[0].hashtags).to.include($label.text().trim())
                    })
                    cy.get('@categories').invoke('text').then($categories => {
                        expect($categories.replace(/\s/g, '').split(',')).to.have.members($body[0].cat_list)
                    })
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
            })
        })

        it('Verify Joined status', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == true && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('button.joined_campaign').as('top_button')
                cy.get('.form-group.box-rule-click').as('rules')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].influencer_joined).to.be.true
                    expect($body[0].status).to.equal('ongoing')
                })
                cy.get('@top_button').invoke('text').should('equal', 'Joined')
                cy.get('@rules').find('.icon').should('be.visible')
                cy.get('@rules').find('.rule-campaign').should('be.visible')
            })
        })

        it('Verify rules popup', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == true && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').as('hashtags')
                cy.join_campaign(postgresToken, influencer, cam_id) // call Join API
                cy.wait(3000)
                cy.get('.rule-campaign').click()
                cy.get('app-guidline-popup').as('popup')
                cy.log('check step 1')
                cy.get('@popup').find('.guiline_item > p').then($req => {
                    cy.get('@post_req').contains($req.text())
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 2')
                cy.get('@popup').find('.guiline_item > ul > li').each($term => {
                    expect($term.text()).to.not.be.empty
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 3')
                cy.get('@popup').find('.list_hastags > label').each($label => {
                    cy.get('@hashtags').contains($label.text().trim())
                })
                cy.get('@popup').find('.btn.copy').click() // click Copy
                cy.get('.copy_inform_box').should('be.visible').contains('Hashtags copied to Clipboard')
                cy.log('check SNS button link')
                cy.get('@popup').find('div.social_buttons > .media_item').should('be.visible').then($el => {
                    expect($el.attr('href')).to.satisfy(function check_social_url($href) {
                        return ($href.indexOf('https://www.facebook.com') != -1 || $href.indexOf('https://www.instagram.com') != -1)
                    })
                })
                cy.get('.material-icons.close_popup').click()
                cy.get('@popup').should('not.be.visible')
            })
        })

        it('Verify Not Joined status', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.content_breadcrumbs > div> button.join_campaign').as('top_button')
                cy.get('.box > div > button.btn.join_campaign').as('bottom_button')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].influencer_joined).to.be.false
                    expect($body[0].status).to.satisfy(function check_status($status) {
                        return $status == 'ongoing' || $status == 'planning'
                    })
                })
                cy.get('@top_button').invoke('text').should('equal', 'Join Campaign')
                cy.get('@bottom_button').invoke('text').should('equal', 'Join Campaign')
                cy.get('.form-group.box-rule-click.hidden').should('exist')
            })
        })

        it('Verify joining popup', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'instagram' && $body[i].influencer_joined == false && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.left-form > .form_group:nth-child(5) > p').as('post_req')
                cy.get('.left-form > .form_group:nth-child(6) > .hashtag').as('hashtags')
                cy.join_campaign(postgresToken, influencer, cam_id) // call Join API
                cy.wait(3000)
                cy.get('.content_breadcrumbs > div > .join_campaign_mobile').scrollIntoView().click() // click Join button
                cy.get('app-guidline-popup').as('popup')
                cy.log('check step 1')
                cy.get('@popup').find('.guiline_item > p').then($req => {
                    cy.get('@post_req').contains($req.text())
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 2')
                cy.get('@popup').find('.guiline_item > ul > li').each($term => {
                    expect($term.text()).to.not.be.empty
                })
                cy.get('@popup').find('.next-step > span').click() // click Accept
                cy.log('check step 3')
                cy.get('@popup').find('.list_hastags > label').each($label => {
                    cy.get('@hashtags').contains($label.text().trim())
                })
                cy.get('@popup').find('.btn.copy').click() // click Copy
                cy.get('.copy_inform_box').should('be.visible').contains('Hashtags copied to Clipboard')
                cy.log('check SNS button link')
                cy.get('@popup').find('div.social_buttons > .media_item').should('be.visible').then($el => {
                    expect($el.attr('href')).to.satisfy(function check_social_url($href) {
                        return ($href.indexOf('https://www.facebook.com') != -1 || $href.indexOf('https://www.instagram.com') != -1)
                    })
                })
                cy.get('.material-icons.close_popup').click()
                cy.get('@popup').should('not.be.visible')
            })
        })

        it('Verify Upcoming status', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].influencer_joined == false && $body[i].status == 'planning') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].influencer_joined).to.be.false
                    expect($body[0].status).to.equal('planning')
                })
                cy.get('.content_breadcrumbs > div> button.btn.up_coming').invoke('text').should('equal', 'UpComing')
                cy.get('.form-group.box-rule-click.hidden').should('exist')
            })
        })

        it('Verify social network Facebook', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'facebook' && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.price_column:nth-child(1) > div > i').as('icon')
                cy.get('.price_column:nth-child(2)').as('like')
                cy.get('.price_column:nth-child(3)').as('view')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].social_media_list.length).to.equal(1)
                    expect($body[0].social_media_list[0]).to.equal('facebook')
                    expect($body[0].units_engagement[0].engagement_unit_desc).to.equal('like')
                    expect($body[0].units_engagement[1].engagement_unit_desc).to.equal('view')
                    cy.get('@icon').invoke('hasClass', 'icon icon_facebook_line').should('be.true')
                    if ($body[0].units_engagement[0].price == 0) {
                        cy.get('@like').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@like').find('div > div').invoke('text').then($like_price => {
                            expect(parseFloat($like_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[0].price * 1000) / 1000)
                        })
                        cy.get('@like').find('div > div > span').invoke('text').then($like_currency => {
                            expect($like_currency.trim()).to.equal('usd')
                        })
                    }
                    if ($body[0].units_engagement[1].price == 0) {
                        cy.get('@view').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@view').find('div > div').invoke('text').then($view_price => {
                            expect(parseFloat($view_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[1].price * 1000) / 1000)
                        })
                        cy.get('@view').find('div > div > span').invoke('text').then($view_currency => {
                            expect($view_currency.trim()).to.equal('usd')
                        })
                    }
                })
            })
        })

        it('Verify social network Instagram', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].social_media_list[0] == 'instagram' && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.price_column:nth-child(1) > div > i').as('icon')
                cy.get('.price_column:nth-child(2)').as('like')
                cy.get('.price_column:nth-child(3)').as('view')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    expect($body[0].social_media_list.length).to.equal(1)
                    expect($body[0].social_media_list[0]).to.equal('instagram')
                    expect($body[0].units_engagement[0].engagement_unit_desc).to.equal('like')
                    expect($body[0].units_engagement[1].engagement_unit_desc).to.equal('view')
                    cy.get('@icon').invoke('hasClass', 'icon icon_instagram_color').should('be.true')
                    if ($body[0].units_engagement[0].price == 0) {
                        cy.get('@like').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@like').find('div > div').invoke('text').then($like_price => {
                            expect(parseFloat($like_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[0].price * 1000) / 1000)
                        })
                        cy.get('@like').find('div > div > span').invoke('text').then($like_currency => {
                            expect($like_currency.trim()).to.equal('usd')
                        })
                    }
                    if ($body[0].units_engagement[1].price == 0) {
                        cy.get('@view').invoke('text').then(text => {
                            expect(text.trim().length).to.equal(0)
                        })
                    } else {
                        cy.get('@view').find('div > div').invoke('text').then($view_price => {
                            expect(parseFloat($view_price.replace(',', ''))).to.equal(Math.round($body[0].units_engagement[1].price * 1000) / 1000)
                        })
                        cy.get('@view').find('div > div > span').invoke('text').then($view_currency => {
                            expect($view_currency.trim()).to.equal('usd')
                        })
                    }
                })
            })
        })

        it('Verify blank image', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].medias.length == 1 && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.right-form.media > div').as('media')
                cy.get('@media').should('be.empty')
            })
        })

        it('Verify one image', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].medias.length == 2 && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.ngxcarousel > div > div.ngxcarousel-items > ngx-item > div > img').as('media')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    cy.get('@media').should('have.attr', 'src', $body[0].medias[1])
                })
            })
        })

        it('Verify multiple images', function () {
            cy.viewport(375, 667)
            var cam_id;
            cy.get_campaigns(postgresToken, influencer).then($body => {
                for (var i = 0; i < $body.length; i++) {
                    if ($body[i].medias.length > 2 && $body[i].status == 'ongoing') {
                        cam_id = $body[i].id
                        break
                    }
                }
                if (cam_id == undefined) {
                    throw 'No campaign satisfied the filter!'
                }
                cy.visit(url + '/campaign/' + cam_id)
                cy.get('.ngxcarousel > div > div.ngxcarousel-items').as('media')
                cy.get('.ngxcarouselPointDefault > .ngxcarouselPoint').as('carousel')
                cy.get('.ngxcarousel > button.leftRs > i').as('left')
                cy.get('.ngxcarousel > button.rightRs > i').as('right')
                cy.get_cam_influencer_campaign_detail(postgresToken, influencer, cam_id).then($body => {
                    expect($body[0].id).to.equal(parseInt(cam_id))
                    cy.log('check number of images')
                    cy.get('@media').children().should('have.length', $body[0].medias.length - 1)
                    cy.get('@carousel').children().should('have.length', $body[0].medias.length - 1)
                    cy.log('check image url and carousel')
                    for (var i = 1; i <= $body[0].medias.length - 1; i++) {
                        cy.get('@media').find(`ngx-item:nth-child(${i}) > div > img`).should('have.attr', 'src', $body[0].medias[i])
                        cy.get('@carousel').find(`li:nth-child(${i})`).click().should('have.class', 'active')
                        if (i < $body[0].medias.length - 1) {
                            cy.get('@right').click().get('@carousel').find(`li:nth-child(${i + 1})`).should('have.class', 'active')
                            cy.get('@left').click().get('@carousel').find(`li:nth-child(${i})`).should('have.class', 'active')
                        }
                    }
                })
            })
        })
    })
})