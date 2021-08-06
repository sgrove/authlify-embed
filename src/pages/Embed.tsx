import React, { useEffect } from 'react'
// @ts-ignore
import OneGraphAuth, { InMemoryStorage } from 'onegraph-auth'
import {
  executeCreateNetlifyPersonalToken,
  executeDestroyToken,
  executeNetlifySetEnvMutation,
  executeNetlifyTriggerFreshBuild,
  fetchNetlifyListSites,
  fetchServices,
  fetchSiteEnvVariables,
  newInMemoryAuthWithToken,
  oneGraphAuthlifyTokenEnvName,
  ONEGRAPH_APP_ID,
} from '../lib'
import { EnvVar, SiteAuth, Site, Service } from '../components/SiteAuth'
import { Dropdown } from '../components/Base/Dropdown'

/**
 * Steps:
 * [X] 1. Log into Netlify ("Enable addon")
 * [X] 2. Get list of sites
 * [X] 3. Allow user to select a site
 * [X] 4. After user selects a site, fetch its environment variables
 * [X] 5. See if the ONEGRAPH_AUTHLIFY_TOKEN is set
 * [X] 6. If not, prompt user to log into Netlify ("Enable for site")
 * [X] 7. With the ONEGRAPH_AUTLIFY_TOKEN, fetch the list of logged-in services
 * [X] 8. For any service logged into, create a new onegraph-auth for the flow
 * [X] 9. Set scopes for onegraph-auth
 * [X] 10. Sacrifice the token from #8 to the AUTHLIFY token
 * [X] 11. Any service log out should use the AUTHLIFY onegraph-auth and
 */

const netlifyOneGraphAuth = new OneGraphAuth({
  appId: ONEGRAPH_APP_ID,
})

const extractAuthlifyToken = (envVars: Array<EnvVar>): string | null => {
  return envVars.find(({ property }: EnvVar) => property === oneGraphAuthlifyTokenEnvName)?.value || null
}

const enableSiteAuthlify = async (site: Site): Promise<null> => {
  const auth = new OneGraphAuth({
    appId: ONEGRAPH_APP_ID,
    storage: new InMemoryStorage(),
  })

  await auth.login('netlify')

  const isLoggedIn = await auth.isLoggedIn('netlify')
  const authlifyToken = auth.accessToken()?.accessToken

  if (isLoggedIn && authlifyToken) {
    const result = await executeCreateNetlifyPersonalToken(auth, authlifyToken)
    const eternalToken = result.data?.oneGraph?.createPersonalToken?.accessToken
    if (eternalToken) {
      const envVarsRequest = await fetchSiteEnvVariables(auth, site.id)

      if (!!envVarsRequest.errors) {
        console.error('Error getting site envVars', envVarsRequest.errors)
        return null
      }

      const currentEnvVars: Array<[string, string]> =
        envVarsRequest.data?.netlify?.site?.buildSettings?.env?.map(({ property, value }: EnvVar) => {
          return [property, value]
        }) || []

      let newEnvVars = Object.fromEntries(currentEnvVars)

      newEnvVars[oneGraphAuthlifyTokenEnvName] = eternalToken.token

      await executeNetlifySetEnvMutation(auth, site.id, Object.entries(newEnvVars))

      return null
    }
  }

  return null
}

// @ts-ignore
window.oneGraphAuth = netlifyOneGraphAuth

const authIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    x="0"
    y="0"
    enableBackground="new 0 0 502.664 502.664"
    version="1.1"
    viewBox="0 0 502.664 502.664"
    xmlSpace="preserve"
    aria-hidden="true"
    className="!tw-fill-current !tw-mr-0"
  >
    <g>
      <path d="M132.099 230.872c55.394 0 100.088-44.759 100.088-99.937 0-55.243-44.673-99.981-100.088-99.981-55.135 0-99.808 44.738-99.808 99.981 0 55.156 44.674 99.937 99.808 99.937zM212.3 247.136H52.072C23.469 247.136 0 273.431 0 305.636v160.896c0 1.769.841 3.387 1.014 5.177h262.387c.108-1.79.949-3.408.949-5.177V305.636c0-32.205-23.383-58.5-52.05-58.5zM502.664 137.751c-.108-58.673-53.711-105.934-119.33-105.783-65.92.108-119.092 47.758-119.006 106.279.108 46.226 33.478 85.334 79.812 99.722l.626 202.55 38.676 27.826 40.208-28.064-.065-26.877h-18.572l-.086-26.338h18.616l-.173-29.121h-18.486l-.086-26.295h18.572l-.086-26.316h-18.551l-.065-26.316 18.637-.022-.302-41.157c46.399-14.56 79.661-53.819 79.661-100.088zM383.399 77.612c14.776 0 26.899 12.101 26.899 26.856.108 14.949-12.015 27.007-26.834 27.007-14.905 0-26.942-11.886-26.942-26.877-.086-14.82 11.972-26.943 26.877-26.986z"></path>
    </g>
  </svg>
)

type State = {
  isLoggedIntoNetlify: boolean
  netlifyOneGraphAuth: any
  availableServices: Array<Service>
  search: string | null
  availableSites: Array<Site>
  selectedSite: Site | null
  siteOneGraphAuth: any
  deployPending: string | null
}

function Embed() {
  const [state, setState] = React.useState<State>({
    isLoggedIntoNetlify: false,
    netlifyOneGraphAuth: netlifyOneGraphAuth,
    availableServices: [],
    search: null,
    selectedSite: null,
    availableSites: [],
    siteOneGraphAuth: newInMemoryAuthWithToken(null),
    deployPending: null,
  })

  useEffect(() => {
    fetchServices(state.netlifyOneGraphAuth).then(async result => {
      const services = result.data?.oneGraph?.services || []
      setState(oldState => ({ ...oldState, availableServices: services }))

      const isLoggedIn = await netlifyOneGraphAuth.isLoggedIn('netlify')
      if (isLoggedIn) {
        setState(oldState => ({ ...oldState, isLoggedIntoNetlify: true }))
        refreshNetlifyStatus()
      }
    })
  }, [])

  async function refreshNetlifyStatus() {
    try {
      const loggedIn = await netlifyOneGraphAuth.isLoggedIn('netlify')

      if (!loggedIn) {
        return
      }

      const rawAvailableSites = await fetchNetlifyListSites(netlifyOneGraphAuth)

      const availableSites = rawAvailableSites.data?.netlify?.sites.map((site: any): Site => {
        const authlifyToken =
          site.buildSettings.env.find(({ property }: { property: string }) => property === oneGraphAuthlifyTokenEnvName)
            ?.value || null

        return {
          id: site.id,
          name: site.name,
          authlifyEnabled: !!authlifyToken,
          envVars: site.buildSettings.env,
          oneGraphAuth: new OneGraphAuth({ appId: ONEGRAPH_APP_ID, storage: new InMemoryStorage() }),
          loggedInServices: [],
        }
      })

      const site = availableSites?.[0]

      if (!site) {
        return
      }

      setState(oldState => ({
        ...oldState,
        selectedSite: site,
        isLoggedIntoNetlify: true,
        availableSites: availableSites,
      }))
    } catch (fetchError) {
      // Handle fetch errors
      console.error(fetchError)
    }
  }

  const refreshSiteEnvVariables = async (selectedSite: Site): Promise<boolean> => {
    return fetchSiteEnvVariables(state.netlifyOneGraphAuth, selectedSite.id).then(result => {
      if (!result.errors) {
        const envVars = result.data?.netlify?.site?.buildSettings?.env || []

        const authlifyToken =
          envVars.find(({ property }: EnvVar) => {
            return property === oneGraphAuthlifyTokenEnvName
          })?.value || null

        const siteOneGraphAuth = new OneGraphAuth({
          appId: ONEGRAPH_APP_ID,
          storage: new InMemoryStorage(),
        })

        siteOneGraphAuth.setToken({ accessToken: authlifyToken, wtf: true })

        const newSelectedSite: Site = {
          ...selectedSite,
          authlifyEnabled: true,
          oneGraphAuth: siteOneGraphAuth,
          envVars: envVars,
        }

        setState(oldState => ({
          ...oldState,
          isLoggedIntoNetlify: true,
          selectedSite: newSelectedSite,
          siteOneGraphAuth,
        }))

        if (authlifyToken) {
          return true
        } else {
          console.warn('Fetched site env vars successfully, but no authlify token found')

          return false
        }
      }

      console.warn('Unable to fetch site env vars successfully', result)
      return false
    })
  }

  const repeatedlyRefreshSiteEnvVariables = async (
    attempts: number,
    delayMs = 500,
    selectedSite: Site,
  ): Promise<boolean> => {
    if (attempts > 0) {
      const success = await refreshSiteEnvVariables(selectedSite)
      if (success) {
        return true
      }
      const asyncResult: Promise<boolean> = new Promise(resolve =>
        setTimeout(
          async () => resolve(await repeatedlyRefreshSiteEnvVariables(attempts - 1, delayMs, selectedSite)),
          delayMs,
        ),
      )

      return await asyncResult
    }
    return false
  }

  useEffect(() => {
    if (!state.selectedSite?.id) {
      return
    }

    refreshSiteEnvVariables(state.selectedSite)
  }, [state.selectedSite?.id])

  const siteSelectorButton = (
    <Dropdown
      style={{ maxHeight: '350px', overflowY: 'scroll' }}
      title={state.selectedSite?.name || 'Sites'}
      items={state.availableSites.map(site => ({
        value: site,
        label: site.name,
      }))}
      onChange={site => {
        const token = extractAuthlifyToken(site.envVars)

        const newSiteAuth = newInMemoryAuthWithToken(token)

        setState(oldState => ({
          ...oldState,
          selectedSite: site,
          siteOneGraphAuth: newSiteAuth,
        }))
      }}
    />
  )

  const enableButton = (
    <button
      className="btn btn-default btn-secondary btn-secondary--standard"
      type="button"
      onClick={async () => {
        await netlifyOneGraphAuth.login('netlify')

        refreshNetlifyStatus()
      }}
    >
      Turn on
    </button>
  )

  const siteHasEnabledAuthlify =
    state.isLoggedIntoNetlify && !!state.selectedSite?.id && !!state.siteOneGraphAuth?.accessToken()?.accessToken

  const enableAuthlifyForSiteButton = state.selectedSite ? (
    <button
      className="btn btn-default btn-secondary btn-secondary--standard"
      type="button"
      onClick={async () => {
        if (state.selectedSite) {
          await enableSiteAuthlify(state.selectedSite)
          let attempts = 10
          // Handle the async nature of setting env vars and then seeing them show up
          // in a subsequent query
          const success = await repeatedlyRefreshSiteEnvVariables(attempts, 500, state.selectedSite)

          if (success) {
            console.info('Success enabling authlify for site ', state.selectedSite.name)
            setState(oldState => ({
              ...oldState,
              deployPending: oldState.selectedSite?.id || null,
            }))

            await executeNetlifyTriggerFreshBuild(netlifyOneGraphAuth, state.selectedSite.id)

            setTimeout(() => {
              setState(oldState => ({
                ...oldState,
                deployPending: null,
              }))
            }, 5000)
          } else {
            console.warn('Unable to enable authlify for site ', state.selectedSite.name)
          }
        }
      }}
    >
      Turn on for {state.selectedSite.name}
    </button>
  ) : null

  const onDisableAuthlifyForSite = async (siteId: string): Promise<null> => {
    const envVarsRequest = await fetchSiteEnvVariables(netlifyOneGraphAuth, siteId)

    if (!!envVarsRequest.errors) {
      console.error('Error getting site envVars', envVarsRequest.errors)
      return null
    }

    const currentEnvVars: Array<[string, string]> =
      envVarsRequest.data?.netlify?.site?.buildSettings?.env?.map(({ property, value }: EnvVar) => {
        return [property, value]
      }) || []

    const authlifyToken = currentEnvVars.find(([property]) => property === oneGraphAuthlifyTokenEnvName)?.[1]

    let newEnvVars = currentEnvVars.filter(([property]) => property !== oneGraphAuthlifyTokenEnvName)

    await executeNetlifySetEnvMutation(netlifyOneGraphAuth, siteId, newEnvVars)

    if (!authlifyToken) {
      return null
    }

    await executeDestroyToken(netlifyOneGraphAuth, authlifyToken)

    state.siteOneGraphAuth.setToken({})

    const newAuth = newInMemoryAuthWithToken(null)

    setState(oldState => ({ ...oldState, siteOneGraphAuth: newAuth }))

    return null
  }

  return (
    <>
      <div
        className="inline iframe-hack-position"
        style={{
          background: 'rgb(250,251,251)',
          top: '0px',
          zIndex: 99999,
          padding: '5px',
        }}
      >
        <div className="media media-figure">
          <span className="lab__icon-circle">{authIcon}</span>
          <div className="lab__info">
            <h2 className="lab__name h3">
              Netlify Auth Management <small>(powered by OneGraph)</small>
            </h2>
            <p className="lab__desc">
              Provision OAuth tokens with just a few clicks to use in in your Netlify functions and during site build.
            </p>
          </div>
        </div>
        <div className="actions" style={{ flexWrap: 'nowrap' }}>
          {state.isLoggedIntoNetlify ? (
            <>
              {siteSelectorButton}{' '}
              <button
                className="btn btn-default btn-primary btn-primary--standard btn-primary--danger"
                type="button"
                onClick={async () => {
                  if (state.selectedSite) {
                    onDisableAuthlifyForSite(state.selectedSite.id)
                  }
                }}
              >
                Disable
              </button>
            </>
          ) : (
            enableButton
          )}
        </div>
      </div>
      <div
        className="iframe-hack-position"
        style={{
          alignSelf: 'start',
          width: '100%',
          top: '80px',
          background: 'rgb(250,251,251)',
          zIndex: 99,
        }}
      ></div>
      <div className="site-container" style={{ alignSelf: 'start', width: '100%' }}>
        {state.selectedSite && state.selectedSite.id === state.deployPending ? (
          <p>
            <strong>
              Authlify enabled for {state.selectedSite.name}, it'll be available in your functions and site build in a
              moment...
            </strong>
          </p>
        ) : null}
        {siteHasEnabledAuthlify && state.selectedSite ? (
          <>
            <SiteAuth
              availableServices={state.availableServices}
              selectedSiteId={state.selectedSite.id}
              selectedSiteName={state.selectedSite.name}
              siteEternalOneGraphToken={state.siteOneGraphAuth.accessToken().accessToken}
              onDisableAuthlifyForSite={onDisableAuthlifyForSite}
            />
          </>
        ) : (
          enableAuthlifyForSiteButton
        )}
      </div>
    </>
  )
}

export default Embed
