describe('Verify account dashboard info', function () {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, categories, introduce, birthday, gender, name, nation, paypal, phone,
        facebook_username, facebook_followers, facebook_avatar, instagram_username, instagram_followers, instagram_avatar,
        twitter_username, twitter_followers, twitter_avatar, youtube_username, youtube_followers, youtube_avatar, youtube_is_channel,
        facebook_likes, facebook_comments, instagram_likes, instagram_comments, twitter_likes, twitter_replies, twitter_retweets,
        youtube_comments, youtube_likes, youtube_views, total_audience, reach, avg_age,
        gender_list, nation_list, female_count, male_count, female_percent, male_percent;

    before(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_influencers_detail_view_influencer_frontend(postgresToken, influencer).then($body => {
                categories = $body[0].categories
                introduce = $body[0].introduce
                if (introduce == null) {
                    introduce = '-'
                }
                birthday = $body[0].birthday
                gender = $body[0].gender_desc
                name = $body[0].name
                nation = $body[0].nation_desc
                paypal = $body[0].paypal_email
                phone = $body[0].phone_number
            })
            cy.get_influencers_social_medias_view(postgresToken, influencer).then($body => {
                if ($body[0].facebook !== null) {
                    facebook_avatar = $body[0].facebook[0].avatar
                }
                if ($body[0].instagram !== null) {
                    instagram_avatar = $body[0].instagram[0].avatar
                }
                if ($body[0].twitter !== null) {
                    twitter_avatar = $body[0].twitter[0].avatar
                }
                if ($body[0].youtube !== null) {
                    youtube_avatar = $body[0].youtube[0].avatar
                }
            })
            cy.get_influencers_social_media_detail_view(postgresToken, influencer).then($body => {
                facebook_username = $body[0].facebook_username
                facebook_followers = $body[0].facebook_followers
                facebook_likes = $body[0].facebook_likes
                facebook_comments = $body[0].facebook_comments
                instagram_username = $body[0].instagram_username
                instagram_followers = $body[0].instagram_followers
                instagram_likes = $body[0].instagram_likes
                instagram_comments = $body[0].instagram_comments
                twitter_username = $body[0].twitter_username
                twitter_followers = $body[0].twitter_followers
                twitter_likes = $body[0].twitter_likes
                twitter_retweets = $body[0].twitter_retweets
                twitter_replies = $body[0].twitter_replies
                youtube_username = $body[0].youtube_username
                youtube_followers = $body[0].youtube_followers
                youtube_comments = $body[0].youtube_comments
                youtube_likes = $body[0].youtube_likes
                youtube_views = $body[0].youtube_views
                youtube_is_channel = $body[0].youtube_is_channel
                reach = $body[0].reach
                total_audience = $body[0].audience
            })
            cy.get_influencer_followers_analytics(postgresToken, influencer).then($body => {
                avg_age = $body[0].summary.avg_age
                gender_list = $body[0].summary.gender
                nation_list = $body[0].summary.nation
                for (var i in gender_list) {
                    if (gender_list[i]["gender"] == '1') {
                        female_count = gender_list[i]["count"]
                    } else if (gender_list[i]["gender"] == '2') {
                        male_count = gender_list[i]["count"]
                    }
                }
                female_percent = female_count / (female_count + male_count) * 100
                male_percent = male_count / (female_count + male_count) * 100
            })
        })
    })

    beforeEach(function () {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
        })
        cy.visit(url + '/profile')
        cy.get('div.basic-info > div:nth-child(4) > p').as('category')
        cy.get('div.basic-info > div:nth-child(3) > p').as('introduce')
        cy.get('div.basic-info > div:nth-child(2) > ul > li:nth-child(1) > p').as('age')
        cy.get('div.basic-info > div:nth-child(2) > ul > li:nth-child(2) > p').as('gender')
        cy.get('div.basic-info > div > h2').as('name')
        cy.get('div.basic-info > div:nth-child(2) > ul > li:nth-child(3) > p').as('country')
        cy.get('.list_social > a').as('social_list')
        cy.get('div.body_avatar').as('main_avatar')
        cy.get('div.action-edit').as('edit_button')
        cy.get('.btn').as('edit_button_mobile')
        cy.get('.sns_infomation_reach > h5').as('total_reach')
        cy.get(':nth-child(1) > .engagement_item > :nth-child(1) > :nth-child(1)').as('facebook_likes')
        cy.get(':nth-child(1) > .engagement_item > :nth-child(2) > :nth-child(1)').as('facebook_comments')
        cy.get(':nth-child(2) > .engagement_item > :nth-child(1) > :nth-child(1)').as('instagram_likes')
        cy.get(':nth-child(2) > .engagement_item > :nth-child(2) > :nth-child(1)').as('instagram_comments')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(1) > :nth-child(1)').as('twitter_retweets')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(2) > :nth-child(1)').as('twitter_replies')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(3) > :nth-child(1)').as('twitter_likes')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(1) > :nth-child(1)').as('youtube_likes')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(2) > :nth-child(1)').as('youtube_comments')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(3) > :nth-child(1)').as('youtube_views')
        cy.get('.audience_chart_total > h5').as('total_audience')
        cy.get('div.facebook-fill.circle').as('facebook_circle')
        cy.get('div.instagram-fill.circle').as('instagram_circle')
        cy.get('div.twitter-fill.circle').as('twitter_circle')
        cy.get('div.youtube-fill.circle').as('youtube_circle')
        cy.get('div.sns_data > h5').as('avg_age')
        cy.get(':nth-child(1) > .percent').as('female')
        cy.get(':nth-child(2) > .percent').as('male')
        cy.get('.sns_infomation_countries').as('countries')
    })

    context('Verify dashboard on desktop', function () {
        it('Verify personal info', function () {
            cy.get('@category').invoke('text').then(text => {
                text = text.split(',')
                for (var i in text) {
                    expect(categories).to.include(text[i].trim())
                }
            })
            cy.get('@introduce').invoke('text').then(text => {
                if (introduce.length == 0) {
                    expect(text).to.equal('-')
                } else {
                    expect(introduce).to.equal(text)
                }
            })
            cy.get('@age').invoke('text').then(text => {
                var age = new Date().getFullYear() - birthday.slice(0, 4);
                expect(age).to.equal(parseInt(text))
            })
            cy.get('@gender').invoke('text').should('equal', gender)
            cy.get('@name').invoke('text').should('equal', name)
            cy.get('@country').invoke('text').should('equal', nation)
            cy.get('@social_list').each($social => {
                var link_social = $social.attr('href'),
                    follower_social = parseInt($social.find('p').text().replace(' Audience', ''));
                if ($social.find('div').hasClass('facebook') == true) {
                    expect(link_social).to.equal('https://www.facebook.com/' + facebook_username)
                    expect(follower_social).to.equal(facebook_followers)
                } else if ($social.find('div').hasClass('instagram') == true) {
                    expect(link_social).to.equal('https://www.instagram.com/' + instagram_username)
                    expect(follower_social).to.equal(instagram_followers)
                } else if ($social.find('div').hasClass('twitter') == true) {
                    expect(link_social).to.equal('https://www.twitter.com/' + twitter_username)
                    expect(follower_social).to.equal(twitter_followers)
                } else if ($social.find('div').hasClass('youtube') == true) {
                    if (youtube_is_channel == true) {
                        expect(link_social).to.equal('https://www.youtube.com/channel/' + youtube_username)
                    } else {
                        expect(link_social).to.equal('https://www.youtube.com/user/' + youtube_username + '/featured')
                    }
                    expect(follower_social).to.equal(youtube_followers)
                } else {
                    throw 'No social account is connected!'
                }
            })
        })

        it('Verify social network avatar', function () {
            if (facebook_followers > 0) {
                cy.get('@main_avatar').then($el => {
                    expect($el.attr('style')).to.include(facebook_avatar)
                })
            } // check main avatar has priority for facebook
            cy.get('@edit_button', {
                timeout: 60000
            }).click()
            cy.url().should('equal', url + '/profile/edit') // go to edit page to check avatars
            if (facebook_followers == null) {
                cy.get('.item_face > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_face > .box_color > img').should('have.attr', 'src', facebook_avatar)
            }
            if (instagram_followers == null) {
                cy.get('.item_insta > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_insta > .box_color > img').should('have.attr', 'src', instagram_avatar)
            }
            if (twitter_followers == null) {
                cy.get('.item_tw > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_tw > .box_color > img').should('have.attr', 'src', twitter_avatar)
            }
            if (youtube_followers == null) {
                cy.get('.item_google > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_google > .box_color > img').should('have.attr', 'src', youtube_avatar)
            }
        })

        it('Verify social network reach and engagement', function () {
            cy.get('@total_reach').invoke('text').then(text => {
                expect(Math.round(reach)).to.equal(parseInt(text))
            })
            if (facebook_followers == null) {
                cy.get('@facebook_likes').invoke('text').should('equal', '-')
                cy.get('@facebook_comments').invoke('text').should('equal', '-')
            } else {
                cy.get('@facebook_likes').invoke('text').then(text => {
                    expect(Math.round(facebook_likes)).to.equal(parseInt(text))
                })
                cy.get('@facebook_comments').invoke('text').then(text => {
                    expect(Math.round(facebook_comments)).to.equal(parseInt(text))
                })
            }
            if (instagram_followers == null) {
                cy.get('@instagram_likes').invoke('text').should('equal', '-')
                cy.get('@instagram_comments').invoke('text').should('equal', '-')
            } else {
                cy.get('@instagram_likes').invoke('text').then(text => {
                    expect(Math.round(instagram_likes)).to.equal(parseInt(text))
                })
                cy.get('@instagram_comments').invoke('text').then(text => {
                    expect(Math.round(instagram_comments)).to.equal(parseInt(text))
                })
            }
            if (twitter_followers == null) {
                cy.get('@twitter_likes').invoke('text').should('equal', '-')
                cy.get('@twitter_comments').invoke('text').should('equal', '-')
                cy.get('@twitter_likes').invoke('text').should('equal', '-')
            } else {
                cy.get('@twitter_likes').invoke('text').then(text => {
                    expect(Math.round(twitter_likes)).to.equal(parseInt(text))
                })
                cy.get('@twitter_retweets').invoke('text').then(text => {
                    expect(Math.round(twitter_retweets)).to.equal(parseInt(text))
                })
                cy.get('@twitter_replies').invoke('text').then(text => {
                    expect(Math.round(twitter_replies)).to.equal(parseInt(text))
                })
            }
            if (youtube_followers == null) {
                cy.get('@youtube_likes').invoke('text').should('equal', '-')
                cy.get('@youtube_comments').invoke('text').should('equal', '-')
                cy.get('@youtube_views').invoke('text').should('equal', '-')
            } else {
                cy.get('@youtube_likes').invoke('text').then(text => {
                    expect(Math.round(youtube_likes)).to.equal(parseInt(text))
                })
                cy.get('@youtube_comments').invoke('text').then(text => {
                    expect(Math.round(youtube_comments)).to.equal(parseInt(text))
                })
                cy.get('@youtube_views').invoke('text').then(text => {
                    expect(Math.round(youtube_views)).to.equal(parseInt(text))
                })
            }
        })

        it('Verify social network audience', function () {
            var total = 0;
            cy.get('@total_audience').invoke('text').then(text => {
                expect(total_audience).to.equal(parseInt(text))
            })
            if (facebook_followers == null) {
                cy.get('@facebook_circle').should('not.exist')
            } else {
                cy.get('@facebook_circle').should('exist')
                total += facebook_followers
            }
            if (instagram_followers == null) {
                cy.get('@instagram_circle').should('not.exist')
            } else {
                cy.get('@instagram_circle').should('exist')
                total += instagram_followers
            }
            if (twitter_followers == null) {
                cy.get('@twitter_circle').should('not.exist')
            } else {
                cy.get('@twitter_circle').should('exist')
                total += twitter_followers
            }
            if (youtube_followers == null) {
                cy.get('@youtube_circle').should('not.exist')
            } else {
                cy.get('@youtube_circle').should('exist')
                total += youtube_followers
            }
            expect(total_audience).to.equal(total)
            cy.get('@avg_age').invoke('text').then(text => {
                expect(Math.round(avg_age)).to.equal(parseInt(text))
            })
            cy.get('@female').invoke('text').then(text => {
                expect(Math.round(female_percent)).to.equal(parseInt(text))
            })
            cy.get('@male').invoke('text').then(text => {
                expect(Math.round(male_percent)).to.equal(parseInt(text))
            })
            for (var i in nation_list) {
                cy.get('@countries').invoke('text').should('include', nation_list[i]["description"])
            }
        })
    })

    context('Verify dashboard on mobile', function () {
        it('Verify personal info', function () {
            cy.viewport(375, 667)
            cy.get('@category').invoke('text').then(text => {
                text = text.split(',')
                for (var i in text) {
                    expect(categories).to.include(text[i].trim())
                }
            })
            cy.get('@introduce').invoke('text').then(text => {
                if (introduce.length == 0) {
                    expect(text).to.equal('-')
                } else {
                    expect(introduce).to.equal(text)
                }
            })
            cy.get('@age').invoke('text').then(text => {
                var age = new Date().getFullYear() - birthday.slice(0, 4);
                expect(age).to.equal(parseInt(text))
            })
            cy.get('@gender').invoke('text').should('equal', gender)
            cy.get('@name').invoke('text').should('equal', name)
            cy.get('@country').invoke('text').should('equal', nation)
            cy.get('@social_list').each($social => {
                var link_social = $social.attr('href'),
                    follower_social = parseInt($social.find('p').text().replace(' Audience', ''));
                if ($social.find('div').hasClass('facebook') == true) {
                    expect(link_social).to.equal('https://www.facebook.com/' + facebook_username)
                    expect(follower_social).to.equal(facebook_followers)
                } else if ($social.find('div').hasClass('instagram') == true) {
                    expect(link_social).to.equal('https://www.instagram.com/' + instagram_username)
                    expect(follower_social).to.equal(instagram_followers)
                } else if ($social.find('div').hasClass('twitter') == true) {
                    expect(link_social).to.equal('https://www.twitter.com/' + twitter_username)
                    expect(follower_social).to.equal(twitter_followers)
                } else if ($social.find('div').hasClass('youtube') == true) {
                    if (youtube_is_channel == true) {
                        expect(link_social).to.equal('https://www.youtube.com/channel/' + youtube_username)
                    } else {
                        expect(link_social).to.equal('https://www.youtube.com/user/' + youtube_username + '/featured')
                    }
                    expect(follower_social).to.equal(youtube_followers)
                } else {
                    throw 'No social account is connected!'
                }
            })
        })

        it('Verify social network avatar', function () {
            cy.viewport(375, 667)
            if (facebook_followers > 0) {
                cy.get('@main_avatar').then($el => {
                    expect($el.attr('style')).to.include(facebook_avatar)
                })
            } // check main avatar has priority for facebook
            cy.get('@edit_button_mobile').click()
            cy.url().should('equal', url + '/profile/edit')
            if (facebook_followers == null) {
                cy.get('.item_face > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_face > .box_color > img').should('have.attr', 'src', facebook_avatar)
            }
            if (instagram_followers == null) {
                cy.get('.item_insta > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_insta > .box_color > img').should('have.attr', 'src', instagram_avatar)
            }
            if (twitter_followers == null) {
                cy.get('.item_tw > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_tw > .box_color > img').should('have.attr', 'src', twitter_avatar)
            }
            if (youtube_followers == null) {
                cy.get('.item_google > .box_color > img').should('not.exist')
            } else {
                cy.get('.item_google > .box_color > img').should('have.attr', 'src', youtube_avatar)
            }
        })

        it('Verify social network reach and engagement', function () {
            cy.viewport(375, 667)
            cy.get('@total_reach').invoke('text').then(text => {
                expect(Math.round(reach)).to.equal(parseInt(text))
            })
            if (facebook_followers == null) {
                cy.get('@facebook_likes').invoke('text').should('equal', '-')
                cy.get('@facebook_comments').invoke('text').should('equal', '-')
            } else {
                cy.get('@facebook_likes').invoke('text').then(text => {
                    expect(Math.round(facebook_likes)).to.equal(parseInt(text))
                })
                cy.get('@facebook_comments').invoke('text').then(text => {
                    expect(Math.round(facebook_comments)).to.equal(parseInt(text))
                })
            }
            if (instagram_followers == null) {
                cy.get('@instagram_likes').invoke('text').should('equal', '-')
                cy.get('@instagram_comments').invoke('text').should('equal', '-')
            } else {
                cy.get('@instagram_likes').invoke('text').then(text => {
                    expect(Math.round(instagram_likes)).to.equal(parseInt(text))
                })
                cy.get('@instagram_comments').invoke('text').then(text => {
                    expect(Math.round(instagram_comments)).to.equal(parseInt(text))
                })
            }
            if (twitter_followers == null) {
                cy.get('@twitter_likes').invoke('text').should('equal', '-')
                cy.get('@twitter_comments').invoke('text').should('equal', '-')
                cy.get('@twitter_likes').invoke('text').should('equal', '-')
            } else {
                cy.get('@twitter_likes').invoke('text').then(text => {
                    expect(Math.round(twitter_likes)).to.equal(parseInt(text))
                })
                cy.get('@twitter_retweets').invoke('text').then(text => {
                    expect(Math.round(twitter_retweets)).to.equal(parseInt(text))
                })
                cy.get('@twitter_replies').invoke('text').then(text => {
                    expect(Math.round(twitter_replies)).to.equal(parseInt(text))
                })
            }
            if (youtube_followers == null) {
                cy.get('@youtube_likes').invoke('text').should('equal', '-')
                cy.get('@youtube_comments').invoke('text').should('equal', '-')
                cy.get('@youtube_views').invoke('text').should('equal', '-')
            } else {
                cy.get('@youtube_likes').invoke('text').then(text => {
                    expect(Math.round(youtube_likes)).to.equal(parseInt(text))
                })
                cy.get('@youtube_comments').invoke('text').then(text => {
                    expect(Math.round(youtube_comments)).to.equal(parseInt(text))
                })
                cy.get('@youtube_views').invoke('text').then(text => {
                    expect(Math.round(youtube_views)).to.equal(parseInt(text))
                })
            }
        })

        it('Verify social network audience', function () {
            cy.viewport(375, 667)
            var total = 0;
            cy.get('@total_audience').invoke('text').then(text => {
                expect(total_audience).to.equal(parseInt(text))
            })
            if (facebook_followers == null) {
                cy.get('@facebook_circle').should('not.exist')
            } else {
                cy.get('@facebook_circle').should('exist')
                total += facebook_followers
            }
            if (instagram_followers == null) {
                cy.get('@instagram_circle').should('not.exist')
            } else {
                cy.get('@instagram_circle').should('exist')
                total += instagram_followers
            }
            if (twitter_followers == null) {
                cy.get('@twitter_circle').should('not.exist')
            } else {
                cy.get('@twitter_circle').should('exist')
                total += twitter_followers
            }
            if (youtube_followers == null) {
                cy.get('@youtube_circle').should('not.exist')
            } else {
                cy.get('@youtube_circle').should('exist')
                total += youtube_followers
            }
            expect(total_audience).to.equal(total)
            cy.get('@avg_age').invoke('text').then(text => {
                expect(Math.round(avg_age)).to.equal(parseInt(text))
            })
            cy.get('@female').invoke('text').then(text => {
                expect(Math.round(female_percent)).to.equal(parseInt(text))
            })
            cy.get('@male').invoke('text').then(text => {
                expect(Math.round(male_percent)).to.equal(parseInt(text))
            })
            for (var i in nation_list) {
                cy.get('@countries').invoke('text').should('include', nation_list[i]["description"])
            }
        })
    })
})