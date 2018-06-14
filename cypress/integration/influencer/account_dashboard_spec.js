describe('Verify account dashboard info', () => {
    const accessToken = Cypress.env('facebook')['accessToken'],
        userID = Cypress.env('facebook')['userID'],
        signedRequest = Cypress.env('facebook')['signedRequest'],
        client_id = Cypress.env('facebook')['client_id'],
        client_secret = Cypress.env('facebook')['client_secret'],
        influencer = Cypress.env('influencer'),
        url = Cypress.env('url');

    var postgresToken, categories, introduce, birthday, gender, name, nation, phone,
        facebook_username, facebook_followers, facebook_avatar, instagram_username, instagram_followers, instagram_avatar,
        twitter_username, twitter_followers, twitter_avatar, youtube_username, youtube_followers, youtube_avatar, youtube_is_channel,
        facebook_likes, facebook_comments, facebook_engagement, instagram_likes, instagram_comments, instagram_engagement,
        twitter_likes, twitter_replies, twitter_retweets, twitter_engagement, youtube_comments, youtube_likes, youtube_views, youtube_engagement,
        total_audience, reach, avg_age, gender_list, nation_list, female_count, male_count, female_percent, male_percent, top_posts;

    // call APIs to get data
    before(() => {
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
                facebook_engagement = $body[0].fb_engagement_rate
                instagram_username = $body[0].instagram_username
                instagram_followers = $body[0].instagram_followers
                instagram_likes = $body[0].instagram_likes
                instagram_comments = $body[0].instagram_comments
                instagram_engagement = $body[0].ins_engagement_rate
                twitter_username = $body[0].twitter_username
                twitter_followers = $body[0].twitter_followers
                twitter_likes = $body[0].twitter_likes
                twitter_retweets = $body[0].twitter_retweets
                twitter_replies = $body[0].twitter_replies
                twitter_engagement = $body[0].tw_engagement_rate
                youtube_username = $body[0].youtube_username
                youtube_followers = $body[0].youtube_followers
                youtube_comments = $body[0].youtube_comments
                youtube_likes = $body[0].youtube_likes
                youtube_views = $body[0].youtube_views
                youtube_engagement = $body[0].yt_engagement_rate
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

            cy.get_influencers_top_posts(postgresToken, influencer).then($body => {
                top_posts = $body
            })
        })
    })

    // log in and load profile page
    beforeEach(() => {
        cy.login_facebook(accessToken, userID, signedRequest, client_id, client_secret, influencer).then($db_token => {
            postgresToken = $db_token['postgresToken']
            cy.get_facebook_token(postgresToken, influencer)
        })
        cy.visit(url + '/profile') 
    })

    // helper functions grouping test steps
    function verify_personal_info() {
        cy.get('div.basic-info > div:nth-child(4) > p').as('category')
        cy.get('div.basic-info > div:nth-child(3) > p').as('introduce')
        cy.get('div.basic-info > div:nth-child(2) > ul > li:nth-child(1) > p').as('age')
        cy.get('div.basic-info > div:nth-child(2) > ul > li:nth-child(2) > p').as('gender')
        cy.get('div.basic-info > div > h2').as('name')
        cy.get('div.basic-info > div:nth-child(2) > ul > li:nth-child(3) > p').as('country')
        cy.get('.list_social > a').as('social_list')

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

            // check each SNS url to profile and followers
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
    }

    function verify_sns_avatar(env='desktop') {
        cy.get('div.body_avatar').as('main_avatar')

        // check main avatar has priority for facebook
        if (facebook_followers > 0) {
            cy.get('@main_avatar').then($el => {
                expect($el.attr('style')).to.include(facebook_avatar)
                expect(facebook_avatar).to.match(/amazonaws/)
            })
        }

        // go to edit page to check avatars
        if (env == 'mobile') {
            cy.get('.btn').as('edit_button')
        } else {
            cy.get('div.action-edit').as('edit_button')
        }

        cy.get('@edit_button', {
            timeout: 60000
        }).click()
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
    }

    function verify_engagement() {
        cy.get('.sns_infomation_reach > h5').as('total_reach')
        cy.get(':nth-child(1) > .engagement_item > :nth-child(1) > :nth-child(1)').as('facebook_likes')
        cy.get(':nth-child(1) > .engagement_item > :nth-child(2) > :nth-child(1)').as('facebook_comments')
        cy.get(':nth-child(1) > .engagement_item > :nth-child(4) > :nth-child(1)').as('facebook_engagement')
        cy.get(':nth-child(2) > .engagement_item > :nth-child(1) > :nth-child(1)').as('instagram_likes')
        cy.get(':nth-child(2) > .engagement_item > :nth-child(2) > :nth-child(1)').as('instagram_comments')
        cy.get(':nth-child(2) > .engagement_item > :nth-child(4) > :nth-child(1)').as('instagram_engagement')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(1) > :nth-child(1)').as('twitter_retweets')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(2) > :nth-child(1)').as('twitter_replies')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(3) > :nth-child(1)').as('twitter_likes')
        cy.get(':nth-child(3) > .engagement_item > :nth-child(4) > :nth-child(1)').as('twitter_engagement')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(1) > :nth-child(1)').as('youtube_likes')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(2) > :nth-child(1)').as('youtube_comments')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(3) > :nth-child(1)').as('youtube_views')
        cy.get(':nth-child(4) > .engagement_item > :nth-child(4) > :nth-child(1)').as('youtube_engagement')
        cy.wait(2000)

        // check total reach
        cy.get('@total_reach').invoke('text').then(text => {
            expect(Math.round(reach)).to.equal(parseInt(text))
        })

        // check each SNS engagement
        if (facebook_followers == null) {
            cy.get('@facebook_likes').invoke('text').should('equal', '-')
            cy.get('@facebook_comments').invoke('text').should('equal', '-')
            cy.get('@facebook_engagement').invoke('text').should('equal', '-')
        } else {
            cy.get('@facebook_likes').invoke('text').then(text => {
                expect(Math.round(facebook_likes)).to.equal(parseInt(text))
            })
            cy.get('@facebook_comments').invoke('text').then(text => {
                expect(Math.round(facebook_comments)).to.equal(parseInt(text))
            })
            cy.get('@facebook_engagement').invoke('text').then(text => {
                expect(Math.round(facebook_engagement * 10) / 10).to.equal(parseFloat(text.replace('%', '')))
            })
        }
        if (instagram_followers == null) {
            cy.get('@instagram_likes').invoke('text').should('equal', '-')
            cy.get('@instagram_comments').invoke('text').should('equal', '-')
            cy.get('@instagram_engagement').invoke('text').should('equal', '-')
        } else {
            cy.get('@instagram_likes').invoke('text').then(text => {
                expect(Math.round(instagram_likes)).to.equal(parseInt(text))
            })
            cy.get('@instagram_comments').invoke('text').then(text => {
                expect(Math.round(instagram_comments)).to.equal(parseInt(text))
            })
            cy.get('@instagram_engagement').invoke('text').then(text => {
                expect(Math.round(instagram_engagement * 10) / 10).to.equal(parseFloat(text.replace('%', '')))
            })
        }

        if (twitter_followers == null) {
            cy.get('@twitter_likes').invoke('text').should('equal', '-')
            cy.get('@twitter_comments').invoke('text').should('equal', '-')
            cy.get('@twitter_likes').invoke('text').should('equal', '-')
            cy.get('@twitter_engagement').invoke('text').should('equal', '-')
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
            cy.get('@twitter_engagement').invoke('text').then(text => {
                expect(Math.round(twitter_engagement * 10) / 10).to.equal(parseFloat(text.replace('%', '')))
            })
        }

        if (youtube_followers == null) {
            cy.get('@youtube_likes').invoke('text').should('equal', '-')
            cy.get('@youtube_comments').invoke('text').should('equal', '-')
            cy.get('@youtube_views').invoke('text').should('equal', '-')
            cy.get('@youtube_engagement').invoke('text').should('equal', '-')
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
            cy.get('@youtube_engagement').invoke('text').then(text => {
                expect(Math.round(youtube_engagement * 10) / 10).to.equal(parseFloat(text.replace('%', '')))
            })
        }
    }

    function verify_audience() {
        cy.get('.audience_chart_total > h5').as('total_audience')
        cy.get('div.facebook-fill.circle').as('facebook_circle')
        cy.get('div.instagram-fill.circle').as('instagram_circle')
        cy.get('div.twitter-fill.circle').as('twitter_circle')
        cy.get('div.youtube-fill.circle').as('youtube_circle')

        // check each SNS audience
        var total = 0;

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

        // check total audience
        expect(total_audience).to.equal(total)
        cy.get('@total_audience').invoke('text').then(text => {
            expect(total_audience).to.equal(parseInt(text))
        })
    }

    function verify_follower_age_gender_country() {
        cy.get('div.sns_data > h5').as('avg_age')
        cy.get(':nth-child(1) > .percent').as('female')
        cy.get(':nth-child(2) > .percent').as('male')
        cy.get('.sns_infomation_countries').as('countries')

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
    }

    function verify_top_posts() {
        cy.get('#top_contents').as('top_posts')

        // check number of total posts
        cy.get('@top_posts').find('app-post-card').should('have.length', top_posts.length)

        // check each post metrics
        for (var i = 0; i < top_posts.length; i++) {

            // check thumbnail or description
            if (top_posts[i].image != null) {
                cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article > .content-media > .flex_img.top_content_thumbnail`).invoke('attr', 'style').should('include', top_posts[i].image)
            } else {
                cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article > .content-media > .flex_img.top_content_thumbnail > p`).contains(top_posts[i].description)
            }

            // check social type
            if (top_posts[i].type == 'instagram') {
                cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article`).should('have.class', 'instagram')
            } else if (top_posts[i].type == 'facebook') {
                cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article`).should('have.class', 'facebook')
            }

            // check likes
            cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article > .top_content_engagement > p:nth-child(2) > span:nth-child(1)`).invoke('text').should('be.equal', top_posts[i].likes.toString())
            cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article > .top_content_engagement > p:nth-child(2) > span:nth-child(2)`).contains('Likes')
            
            // check comments
            cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article > .top_content_engagement > p:nth-child(3) > span:nth-child(1)`).invoke('text').should('be.equal', top_posts[i].comments.toString())
            cy.get('@top_posts').find(`app-post-card:nth-child(${i+1}) > article > .top_content_engagement > p:nth-child(3) > span:nth-child(2)`).contains('Comments')
        }
    }

    // test cases for desktop theme
    context('Verify dashboard on desktop', () => {
        it('Verify personal info', () => {
            verify_personal_info()
        })

        it('Verify social network avatar', () => {
            verify_sns_avatar()
        })

        it('Verify social network reach and engagement', () => {
            verify_engagement()
        })

        it('Verify social network audience', () => {
            verify_audience()
        })

        it('Verify age, gender, country of audience', () => {
            verify_follower_age_gender_country()
        })

        it('Verify top posts', () => {
            verify_top_posts()
        })
    })

    // test cases for mobile theme
    context('Verify dashboard on mobile', () => {
        it('Verify personal info', () => {
            cy.viewport(375, 667)
            verify_personal_info()
        })

        it('Verify social network avatar', () => {
            cy.viewport(375, 667)
            verify_sns_avatar('mobile')
        })

        it('Verify social network reach and engagement', () => {
            cy.viewport(375, 667)
            verify_reach()
        })

        it('Verify social network audience', () => {
            cy.viewport(375, 667)
            verify_audience()
        })

        it('Verify age, gender, country of audience', () => {
            cy.viewport(375, 667)
            verify_follower_age_gender_country()
        })

        it('Verify top posts', () => {
            cy.viewport(375, 667)
            verify_top_posts()
        })
    })
})