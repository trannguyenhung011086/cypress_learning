// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

var now = new Date(),
    day = 864e5,
    weekFromNow = new Date(+now + day * 7),
    current_datetime = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + 'T' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '.' + now.getMilliseconds() + 'Z',
    future_datetime = weekFromNow.getFullYear() + '-' + weekFromNow.getMonth() + '-' + weekFromNow.getDate() + 'T' + weekFromNow.getHours() + ':' + weekFromNow.getMinutes() + ':' + weekFromNow.getSeconds() + '.' + weekFromNow.getMilliseconds() + 'Z';

Cypress.Commands.add('iframe', (selector, element) => {
    cy.get(`iframe${selector || ''}`, {
            timeout: 10000
        })
        .should(($iframe) => {
            expect($iframe.contents().find(element || 'body')).to.exist
        }).then(($iframe) => {
            var w = cy.wrap($iframe.contents().find("body"))
            // optional - add a class to the body to let the iframe know it's running inside the cypress
            // replaces window.Cypress because window.Cypress does not work from inside the iframe
            w.invoke('addClass', 'cypress')
            return w
        })
})

Cypress.Commands.add('login_adv', (email, pass) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/login',
        body: {
            "email": email,
            "pass": pass
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(200)
        window.localStorage.setItem('ADVERTISER_ID', resp.body[0].id)
        cy.setCookie('postgresToken', resp.body[0].token)
        return cy.wrap({
            'postgresToken': resp.body[0].token
        })
    })
})

Cypress.Commands.add('get_facebook_token', (postgresToken, influencer) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/get_facebook_token?influencer_id=eq.' + influencer,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(200)
        expect(resp.body[0].influencer_id).to.eq(parseInt(influencer))
    })
})

Cypress.Commands.add('login_facebook', (accessToken, userID, signedRequest, client_id, client_secret, influencer) => {
    const options = {
        method: 'POST',
        url: Cypress.env('facebook')['facebook_login'],
        body: {
            "is_mobile_app": false,
            "access_token": {
                "accessToken": accessToken,
                "userID": userID,
                "signedRequest": signedRequest,
                "grantedScopes": "user_birthday,user_photos,user_friends,user_about_me,user_posts,email,manage_pages,pages_show_list,public_profile"
            },
            "client_id": client_id,
            "client_secret": client_secret,
            "be_merged_later": false
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(200)
        expect(resp.body.db_influencer_first_created).to.be.false
        expect(resp.body.db_object[0].influencer_id).to.eq(parseInt(influencer))
        expect(resp.body.personal.id).to.eq(userID)
        expect(resp.body.statusCode).to.eq(200)
        window.localStorage.setItem('fbAccessToken', resp.body.long_lived_token.access_token)
        window.localStorage.setItem('influencerId', influencer)
        window.localStorage.setItem('firstTimeInfluencerCreated', 'false')
        cy.setCookie('postgresToken', resp.body.db_influencer_token)
        return cy.wrap({
            'postgresToken': resp.body.db_influencer_token,
            'long_lived_token': resp.body.long_lived_token.access_token
        })
    })
})

Cypress.Commands.add('login_instagram', (access_token, influencer) => {
    const options = {
        method: 'POST',
        url: Cypress.env('instagram')['instagram_login'],
        body: {
            "is_mobile_app": false,
            "access_token": access_token,
            "be_merged_later": false
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(200)
        expect(resp.body.db_object[0].influencer_id).to.eq(parseInt(influencer))
        expect(resp.body.access_token).to.eq(access_token)
        expect(resp.body.statusCode).to.eq(200)
        window.localStorage.setItem('instagAccessToken', resp.body.access_token)
        window.localStorage.setItem('influencerId', influencer)
        cy.setCookie('postgresToken', resp.body.db_influencer_token)
        return cy.wrap({
            'postgresToken': resp.body.db_influencer_token,
            'long_lived_token': resp.body.access_token
        })
    })
})

Cypress.Commands.add('login_twitter', (oauth_token, oauth_token_secret, user_id, screen_name, client_id, client_secret, influencer) => {
    const options = {
        method: 'POST',
        url: Cypress.env('twitter')['twitter_login'],
        body: {
            "access_token": {
                "oauth_token": oauth_token,
                "oauth_token_secret": oauth_token_secret,
                "user_id": user_id,
                "screen_name": screen_name,
                "x_auth_expires": "0"
            },
            "client_id": client_id,
            "client_secret": client_secret,
            "be_merged_later": false
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(200)
        expect(resp.body.db_object[0].influencer_id).to.eq(parseInt(influencer))
        expect(resp.body.access_token.user_id).to.eq(user_id)
        expect(resp.body.statusCode).to.eq(200)
        window.localStorage.setItem('twitterAccessToken', resp.body.access_token.oauth_token)
        window.localStorage.setItem('influencerId', influencer)
        cy.setCookie('postgresToken', resp.body.db_influencer_token)
        return cy.wrap({
            'postgresToken': resp.body.db_influencer_token,
            'long_lived_token': resp.body.access_token.oauth_token
        })
    })
})

Cypress.Commands.add('get_influencers_social_medias_view', (postgresToken, influencer) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/influencers_social_medias_view?influencer_id=eq.' + influencer,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_influencers_social_media_detail_view', (postgresToken, influencer) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/influencers_social_media_detail_view?id=eq.' + influencer + '&is_fanpage=eq.false',
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_influencer_followers_analytics', (postgresToken, influencer) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/influencer_followers_analytics',
        headers: {
            Authorization: 'Bearer ' + postgresToken
        },
        body: {
            "influencer_id": parseInt(influencer)
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_influencers_detail_view_influencer_frontend', (postgresToken, influencer) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/influencers_detail_view_influencer_frontend?id=eq.' + influencer,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_influencers_top_posts', (postgresToken, influencer) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/influencers_top_posts?influencer_id=eq.' + influencer + '&limit=6',
        headers: {
            Authorization: 'Bearer ' + postgresToken 
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_campaigns', (postgresToken, influencer, categories = null, keyword = null, social_medias = null) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/search_influencer_cam_campaigns',
        body: {
            "influencer_id_param": parseInt(influencer),
            "categories": categories,
            "keyword": keyword,
            "social_medias": social_medias
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_campaigns_joined', (postgresToken, influencer, categories = null, keyword = null, social_medias = null) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/search_influencer_cam_campaigns?influencer_joined=is.true',
        body: {
            "influencer_id_param": parseInt(influencer),
            "categories": categories,
            "keyword": keyword,
            "social_medias": social_medias
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_campaigns_not_joined', (postgresToken, influencer, categories = null, keyword = null, social_medias = null) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/search_influencer_cam_campaigns?influencer_joined=is.false',
        body: {
            "influencer_id_param": parseInt(influencer),
            "categories": categories,
            "keyword": keyword,
            "social_medias": social_medias
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_cam_influencer_campaign_detail', (postgresToken, influencer, campaign) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/cam_influencer_campaign_detail',
        body: {
            "influencer_id": parseInt(influencer),
            "campaign_id": parseInt(campaign),
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('search_influencer_payment_period', (postgresToken, influencer, start_period = null, end_period = null) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/search_influencer_payment_period',
        body: {
            "influencer_id_param": parseInt(influencer),
            "start_period": start_period,
            "end_period": end_period
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('search_cami_campaigns_report', (postgresToken, influencer, campaign_ids = null, social_medias = null, start_period = null, end_period = null) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/search_cami_campaigns_report',
        body: {
            "influencer_id_param": parseInt(influencer),
            "campaign_ids": campaign_ids,
            "social_medias": social_medias,
            "start_period": start_period,
            "end_period": end_period
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_influencer_revenue', (postgresToken, influencer) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/cami_influencers_summary_data?influencer_id=eq.' + influencer,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_city', (postgresToken, country) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/cities?country_id=eq.' + country,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_bank', (postgresToken, country) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/cam_bankname?country_id=eq.' + country,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_branch', (postgresToken, bank) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/bank_information?main_code=eq.' + bank,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        return resp.body
    })
})

Cypress.Commands.add('get_qna', (postgresToken, language) => {
    const options = {
        method: 'GET',
        url: Cypress.env('api_host') + '/qna?language=eq.' + language,
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        expect(resp.body[0].language).to.equal(language)
        return resp.body[0].content
    })
})

Cypress.Commands.add('check_facebook_token', (token) => {
    const options = {
        method: 'GET',
        url: `https://graph.facebook.com/me/permissions?access_token=${token}&method=get&pretty=0&sdk=joey&suppress_http_code=1`,
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
        for (var i = 0; i < resp.body.data.length; i++) {
            expect(resp.body.data[i].status).to.equal('granted')
        }
    })
})

Cypress.Commands.add('join_campaign', (postgresToken, influencer, campaign) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/cami_influencer_join_campaign',
        body: {
            "campaign_id_param": parseInt(campaign),
            "influencer_id_param": parseInt(influencer)
        },
        headers: {
            Authorization: 'Bearer ' + postgresToken
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.equal(200)
    })
})

Cypress.Commands.add('create_campaign', () => {
    var randomInt = Math.floor(Math.random() * Math.floor(100)),
        hashtag1 = '#testing' + randomInt,
        hashtag2 = '#testing' + randomInt * 2,
        hashtag3 = '#testing' + randomInt * 3;

    // {
    //     
    //   }

    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/cam_campaigns?select=id',
        body: {
            //       "campaign": {
            //         "title": "new API create",
            //         "info_url": "http://www.facebook.com",
            //         "product_info": "What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\nWhy do we use it?\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\n\n\nWhere does it come from?\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.\n\nThe standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\n\nWhere can I get some?\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
            //         "requirements": "What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\nWhy do we use it?\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\n\n\nWhere does it come from?\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.\n\nThe standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\n\nWhere can I get some?\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
            //         "hashtags": "#no,#min,#budget,#newapi",
            //         "start_period": "2018-03-21T17:00:00.000Z",
            //         "end_period": "2018-04-20T16:59:59.000Z",
            //         "country_id": "TH",
            //         "advertiser_id": 6,
            //         "youtube_url": "https://www.youtube.com"
            //       },
            //       "categories": [
            //         5,
            //         6,
            //         9,
            //         10,
            //         11
            //       ],
            //       "medias": [
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_39_edaf10c08d5c78237606e8f4cbcd57df.jpg",
            //           "type": "image"
            //         },
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_33_8cf000cd370a421cbec1ddea719c04c3.jpg",
            //           "type": "image"
            //         },
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_34_c344b7eee2fff46ef317fd0114530ea1.jpg",
            //           "type": "image"
            //         },
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_34_c46b9035c9b43522f3805a34c05161cf.jpg",
            //           "type": "image"
            //         },
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_34_bdf24b6a7a6cca0aeb013c4e98ae76bd.jpg",
            //           "type": "image"
            //         },
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_34_d767c9a215f1aa141cb3d42d90435460.jpg",
            //           "type": "image"
            //         },
            //         {
            //           "url": "https://storage.googleapis.com/casting-asia-v2/campaign/2018_03_21_03_24_35_29ac45ef4b3c842a22813bc2dceb7d37.png",
            //           "type": "image"
            //         }
            //       ],
            //       "social_engage": [
            //         {
            //           "social_platform": "facebook",
            //           "budget": 30000,
            //           "engage": [
            //             {
            //               "engagement_unit": "like",
            //               "price": 300
            //             },
            //             {
            //               "engagement_unit": "view",
            //               "price": 200
            //             }
            //           ]
            //         }
            //       ]
            //     }
        },
        headers: {
            Authorization: 'Bearer ' + Cypress.env('postgresToken_ad')
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(201)
        const campaign_id = resp.body[0].id
        return campaign_id
    })
})

Cypress.Commands.add('review_campaign', (campaign_id, action) => {
    const options = {
        method: 'POST',
        url: Cypress.env('api_host') + '/rpc/update_cam_campaign_status',
        body: {
            cam_campaign: {
                "campaign_id": parseInt(campaign_id),
                "status": action // approved, rejected
            }
        },
        headers: {
            Authorization: 'Bearer ' + Cypress.env('postgresToken_ad')
        }
    }
    cy.request(options).then(resp => {
        expect(resp.status).to.eq(200)
        expect(resp.body).to.eq(1)
    })
})