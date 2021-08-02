// @ts-ignore
import OneGraphAuth, { InMemoryStorage } from 'onegraph-auth'

export const allowList = new Set(['github', 'spotify', 'salesforce'])

export const oneGraphAuthlifyTokenEnvName = 'ONEGRAPH_AUTHLIFY_TOKEN'

export const ONEGRAPH_APP_ID = '4d3de9a5-722f-4d27-9c96-2ac43c93c004'

// This setup is only needed once per application
// @ts-ignore
export async function fetchOneGraph(auth, operationsDoc, operationName, variables) {
  const result = await fetch('https://serve.onegraph.com/graphql?app_id=4d3de9a5-722f-4d27-9c96-2ac43c93c004', {
    method: 'POST',
    headers: {
      ...auth.authHeaders(),
    },
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  })

  return await result.json()
}

const operationsDoc = `
query SiteEnvVariables($id: String!) {
  netlify {
    site(id: $id) {
      id
      name
      buildSettings {
        env {
          property
          value
        }
      }
    }
  }
}

mutation NetlifySetEnvMutation($path: String! $envObject: JSON!) {
  netlify {
    makeRestCall {
      patch(
        path: $path
        jsonBody: { build_settings: { env: $envObject } }
      ) {
        jsonBody
      }
    }
  }
}

query ListServicesQuery {
  oneGraph {
    services(filter: { supportsOauthLogin: true }) {
      friendlyServiceName
      service
      slug
      logoUrl
      availableScopes {
        category
        scope
        display
        isDefault
        isRequired
        description
        title
      }
    }
  }
}

fragment LoggedInServices on OneGraphServiceMetadata {
  friendlyServiceName
  service
  isLoggedIn
  bearerToken
  serviceInfo {
    logoUrl
    availableScopes {
      category
      scope
      display
      isDefault
      isRequired
      description
      title
    }
  }
  grantedScopes {
    scope
  }
}

query FindLoggedInServicesQuery {
  me {
    serviceMetadata {
      loggedInServices {
        ...LoggedInServices
      }
    }
  }
}

query NetlifyListSites {
  netlify {
    sites {
      id
      name
      buildSettings {
        env {
          property
          value
        }
      }
    }
  }
}

mutation CreateNetlifyPersonalTokenMutation($token: String!) {
  oneGraph {
    createPersonalToken(
      input: {
        anchor: NETLIFY_USER
        appId: "4d3de9a5-722f-4d27-9c96-2ac43c93c004"
        accessToken: $token
        name: "NetlifyToken"
      }
    ) {
      accessToken {
        token
        name
        anchor
      }
    }
  }
}

mutation AddAuthsMutation($token: String!, $sToken: String!) {
  oneGraph {
    addAuthsToPersonalToken(
      input: {
        personalToken: $token
        sacrificialToken: $sToken
        appId: "4d3de9a5-722f-4d27-9c96-2ac43c93c004"
      }
    ) {
      accessToken {
        token
        name
        anchor
      }
    }
  }
}

mutation SignOutServicesMutation {
  signoutServices(data: { services: [SPOTIFY] }) {
    me {
      serviceMetadata {
        loggedInServices {
          ...LoggedInServices
        }
      }
    }
  }
} 

mutation DestroyTokenMutation($token: String!) {
  oneGraph {
    destroyToken(token: $token)
  }
}

mutation NetlifyTriggerFreshBuildMutation($path: String!) {
  netlify {
    makeRestCall {
      post(
        path: $path
        jsonBody: { clear_cache: true }
      ) {
        jsonBody
        response {
          statusCode
        }
      }
    }
  }
}


`

// @ts-ignore
export function fetchSiteEnvVariables(auth, id: string) {
  return fetchOneGraph(auth, operationsDoc, 'SiteEnvVariables', { id: id })
}

// @ts-ignore
export function executeNetlifySetEnvMutation(auth, siteId: string, envVars: Array<[string, string]>) {
  const path = `/api/v1/sites/${siteId}`
  const envObject = Object.fromEntries(envVars)
  return fetchOneGraph(auth, operationsDoc, 'NetlifySetEnvMutation', { path: path, envObject: envObject })
}

// @ts-ignore
export function fetchServices(auth) {
  return fetchOneGraph(auth, operationsDoc, 'ListServicesQuery', {})
}

// @ts-ignore
export function fetchLoggedInServices(auth) {
  return fetchOneGraph(auth, operationsDoc, 'FindLoggedInServicesQuery', {})
}

// @ts-ignore
export function fetchNetlifyListSites(auth) {
  return fetchOneGraph(auth, operationsDoc, 'NetlifyListSites', {})
}

// @ts-ignore
export function executeCreateNetlifyPersonalToken(auth, token: string) {
  return fetchOneGraph(auth, operationsDoc, 'CreateNetlifyPersonalTokenMutation', {
    token: token,
  })
}

// @ts-ignore
export function executeAddAuths(auth, token: string, sToken: string) {
  return fetchOneGraph(auth, operationsDoc, 'AddAuthsMutation', {
    token: token,
    sToken: sToken,
  })
}

// @ts-ignore
export function executeSignOutServices(auth, services: string[]) {
  return fetchOneGraph(auth, operationsDoc, 'SignOutServicesMutation', {
    services: services,
  })
}

// @ts-ignore
export function executeDestroyToken(auth, token: string) {
  return fetchOneGraph(auth, operationsDoc, 'DestroyTokenMutation', {
    token: token,
  })
}

// @ts-ignore
export function executeNetlifyTriggerFreshBuild(auth, siteId: string) {
  const path = `/api/v1/sites/${siteId}/builds`
  return fetchOneGraph(auth, operationsDoc, 'NetlifyTriggerFreshBuildMutation', {
    path: path,
  })
}

/** Front end helpers */

// Only needed for during PoC, as we've started migrating this into OneGraph already
// (see GitHub, SFDC, and Spotify)
const ServiceLookup = {
  adroll: ['adroll.com', 'Adroll'],
  asana: ['asana.com', 'Asana'],
  box: ['box.com', 'Box'],
  'dev-to': ['dev.to', 'Dev.to'],
  dribbble: ['dribbble.com', 'Dribbble'],
  dropbox: ['dropbox.com', 'Dropbox'],
  contentful: ['contentful.com', 'Contentful'],
  eggheadio: ['eggheadio.com', 'Egghead.io'],
  eventil: ['eventil.com', 'Eventil'],
  facebook: ['facebook.com', 'Facebook'],
  facebookBusiness: ['facebook.com', 'Facebook'],
  github: ['githubsatellite.com', 'GitHub'],
  gmail: ['gmail.com', 'Gmail'],
  google: ['google.com', 'Google'],
  'google-ads': ['google.com', 'Google Ads'],
  'google-analytics': ['google-analytics.com', 'Google Analytics'],
  'google-calendar': ['google.com', 'Google Calendar'],
  'google-compute': ['google.com', 'Google Compute'],
  'google-docs': ['google.com', 'Google Docs'],
  'google-search-console': ['google.com', 'Google Search Console'],
  'google-translate': ['google.com', 'Google Translate'],
  hubspot: ['hubspot.com', 'Hubspot'],
  intercom: ['intercom.com', 'Intercom'],
  mailchimp: ['mailchimp.com', 'Mailchimp'],
  meetup: ['meetup.com', 'Meetup'],
  netlify: ['netlify.com', 'Netlify'],
  'product-hunt': ['producthunt.com', 'Product Hunt'],
  quickbooks: ['quickbooks.com', 'QuickBooks'],
  salesforce: ['salesforce.com', 'Salesforce'],
  slack: ['slack.com', 'Slack'],
  spotify: ['spotify.com', 'Spotify'],
  stripe: ['stripe.com', 'Stripe'],
  trello: ['trello.com', 'Trello'],
  twilio: ['twilio.com', 'Twilio'],
  twitter: ['twitter.com', 'Twitter'],
  'twitch-tv': ['twitch-tv.com', 'Twitch'],
  ynab: ['ynab.com', 'You Need a Budget'],
  youtube: ['youtube.com', 'YouTube'],
  zeit: ['vercel.com', 'Vercel'],
  zendesk: ['zendesk.com', 'Zendesk'],
  airtable: ['airtable.com', 'Airtable'],
  apollo: ['apollo.com', 'Apollo'],
  brex: ['brex.com', 'Brex'],
  bundlephobia: ['bundlephobia.com', 'Bundlephobia'],
  clearbit: ['clearbit.com', 'Clearbit'],
  cloudflare: ['cloudflare.com', 'Cloudflare'],
  crunchbase: ['crunchbase.com', 'Crunchbase'],
  fedex: ['fedex.com', 'Fedex'],
  'google-maps': ['google-maps.com', 'Google Maps'],
  graphcms: ['graphcms.com', 'GraphCMS'],
  'immigration-graph': ['immigration-graph.com', 'Immigration Graph'],
  logdna: ['logdna.com', 'LogDNA'],
  mixpanel: ['mixpanel.com', 'Mixpanel'],
  mux: ['mux.com', 'Mux'],
  npm: ['npmjs.com', 'Npm'],
  oneGraph: ['onegraph.com', 'OneGraph'],
  orbit: ['orbit.love', 'Orbit'],
  openCollective: ['opencollective.com', 'OpenCollective'],
  ups: ['ups.com', 'UPS'],
  usps: ['usps.com', 'USPS'],
  wordpress: ['wordpress.com', 'Wordpress'],
  firebase: ['firebase.me', 'Firebase'],
  rss: ['rss.com', 'RSS'],
}
type Keys = keyof typeof ServiceLookup

export const serviceImageUrl = (service: Keys, size = 50) => {
  const lookup = ServiceLookup[service]
  if (!lookup) {
    return '//logo.clearbit.com/netlify'
  }

  return `//logo.clearbit.com/${lookup[0]}?size=${size}`
}

export const newInMemoryAuthWithToken = (token: string | null) => {
  const auth = new OneGraphAuth({
    appId: ONEGRAPH_APP_ID,
    storage: new InMemoryStorage(),
  })

  if (token) {
    auth.setToken({ accessToken: token })
  }

  return auth
}
