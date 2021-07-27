import React, { useEffect } from 'react'
// @ts-ignore
import OneGraphAuth from 'onegraph-auth'
// @ts-ignore
import { SubscriptionClient } from 'onegraph-subscription-client'
import {
  executeNetlifySetEnvMutation,
  fetchLoggedInServices,
  fetchNetlifyListSites,
  fetchServices,
  fetchSiteEnvVariables,
  ONEGRAPH_APP_ID,
  serviceImageUrl,
} from '../lib'

// @ts-ignore
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event: any) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

type DropdownProps = {
  title: string
  items: Array<{ value: any; label: string }>
  onChange: (value: any) => void
  style: any
}

const Dropdown = (props: DropdownProps) => {
  const ref = React.useRef()
  const [open, setOpen] = React.useState(false)
  useOnClickOutside(ref, () => setOpen(false))

  return (
    // @ts-ignore
    <div className="dropdown open" aria-expanded="true" aria-haspopup="listbox" aria-owns="downshift-3-menu" ref={ref}>
      <button
        role="button"
        aria-label="Options. Close menu"
        aria-haspopup="true"
        data-toggle="true"
        name="Options"
        className="btn btn-default btn-secondary btn-secondary--standard"
        type="button"
        onClick={() => setOpen(!open)}
      >
        {props.title} ({props.items.length})
        <svg
          height={12}
          viewBox="0 0 16 16"
          width={12}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={
            '!tw-fill-current tw-transition-transform tw-duration-100 tw-ease-cubic-bezier tw-align-middle tw-inline-block tw--mt-[2px] tw-ml-1 tw-transform ' +
            (open ? 'tw-rotate-180' : '')
          }
        >
          <path d="M4 4l3.4 3.4c.3.4.9.4 1.2 0L11.9 4 14 6.2l-5.4 5.6c-.3.3-.9.3-1.2 0L2 6.2z"></path>
        </svg>
      </button>
      <ul className="dropdown-inner dropdown-menu" hidden={!open} style={props.style || {}}>
        {props.items.map(({ value, label }, i) => (
          <li key={i}>
            <a
              id="downshift-3-item-0"
              role="option"
              aria-selected="false"
              className="menuitem"
              onClick={() => {
                setOpen(false)
                props.onChange(value)
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const netlifyOneGraphAuth = new OneGraphAuth({
  appId: ONEGRAPH_APP_ID,
})

const userOneGraphAuth = new OneGraphAuth({
  appId: ONEGRAPH_APP_ID,
})

// @ts-ignore
window.oneGraphAuth = netlifyOneGraphAuth

const subscriptionClient = new SubscriptionClient(ONEGRAPH_APP_ID, {
  oneGraphAuth: netlifyOneGraphAuth,
  reconnect: true,
  lazy: true,
})

type EnvVar = {
  property: string
  value: string
}

type EnvVarsResult =
  | {
      success: true
      envVars: Array<EnvVar>
    }
  | {
      success: false
      kind: 'authError'
      service: string
    }
  | { success: false; kind: 'fetchError' }

// @ts-ignore
async function fetchSiteEnvVars(auth, siteId: string): Promise<EnvVarsResult> {
  try {
    const { errors, data } = await fetchSiteEnvVariables(auth, siteId)

    const missingNetlifyAuth = auth.findMissingAuthServices(errors).find((service: string) => service === 'netlify')

    if (missingNetlifyAuth) {
      return { kind: 'authError', service: 'netlify', success: false }
    }

    const envVars = data?.netlify?.site?.buildSettings?.env || []

    return { success: true, envVars }
  } catch (fetchError) {
    // Handle fetch errors
    console.error(fetchError)
    return { kind: 'fetchError', success: false }
  }
}

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

const blocklist = new Set([
  'gmail',
  'google',
  'google-calendar',
  'google-compute',
  'google-docs',
  'google-translate',
  'zeit',
  'emailNode',
  'me',
  'oneGraphNode',
  'immigrationGraph',
  'descuri',
  'youTubeSearch',
  'youTubeVideo',
])

const serviceToEnvVar = (service: Service): string => {
  const serviceName = service.slug.replace(/\W+|_|-/g, '_').toLocaleUpperCase()
  return `ONEGRAPH_${serviceName}_TOKEN`
}

const hasAuthTokenSet = (envVars: Array<EnvVar>, service: Service): boolean => {
  const envVar = serviceToEnvVar(service)
  return envVars.some(({ property }) => property === envVar)
}

// This function replaces all but the last four digits of a string with zeroes
const sanitizeToken = (str: string, length = 16): string => {
  const len = str.length
  const displayed = len > 4 ? str.substr(len - 4, len) : str

  const padLength = length - displayed.length
  return displayed.padStart(padLength, '*')
}

type Service = {
  friendlyServiceName: string
  service: string
  slug: string
}

type LoggedInService = {
  friendlyServiceName: string
  service: string
  slug: string
  isLoggedIn: boolean
  bearerToken: string | null
}

type Site = {
  id: string
  name: string
}

type State = {
  envVars: Array<EnvVar>
  authlifyEnabled: boolean
  netlifyOneGraphAuth: any
  userOneGraphAuth: any
  authlifyToken: string | null
  availableServices: Array<Service>
  loggedInServices: Array<LoggedInService>
  search: string | null
  availableSites: Array<Site>
  selectedSite: Site | null
}

function Embed() {
  const [state, setState] = React.useState<State>({
    envVars: [],
    authlifyEnabled: false,
    netlifyOneGraphAuth: netlifyOneGraphAuth,
    userOneGraphAuth: userOneGraphAuth,
    availableServices: [],
    loggedInServices: [],
    authlifyToken: null,
    search: null,
    selectedSite: null,
    availableSites: [],
  })

  useEffect(() => {
    if (state.selectedSite) {
      fetchSiteEnvVars(state.netlifyOneGraphAuth, state.selectedSite?.id).then(result => {
        if (result.success === true) {
          const authlifyToken =
            result.envVars.find(({ property }) => property === 'ONEGRAPH_AUTHLIFY_TOKEN')?.value || null

          setState(oldState => ({
            ...oldState,
            authlifyEnabled: true,
            envVars: result.envVars || [],
            authlifyToken: authlifyToken,
          }))
        }
      })
    }

    fetchNetlifyListSites(state.netlifyOneGraphAuth).then(result => {
      console.log('Available sites: ', result)
      setState(oldState => ({
        ...oldState,
        availableSites: result?.data?.netlify?.sites || [],
      }))
    })

    fetchServices(state.netlifyOneGraphAuth).then(result => {
      const services = result.data?.oneGraph?.services || []
      setState(oldState => ({ ...oldState, availableServices: services }))
    })
  }, [state.selectedSite?.id])

  useEffect(() => {
    state.userOneGraphAuth.setToken({ accessToken: state.authlifyToken })

    fetchLoggedInServices(state.userOneGraphAuth).then(result => {
      const services = result.data?.me?.serviceMetadata?.loggedInServices || []
      setState(oldState => ({ ...oldState, loggedInServices: services }))
    })
  }, [state.selectedSite?.id, state.authlifyToken])

  const siteSelectorButton = (
    <Dropdown
      style={{ maxHeight: '350px', overflowY: 'scroll' }}
      title={state.selectedSite?.name || 'Sites'}
      items={state.availableSites.map(site => ({
        value: site,
        label: site.name,
      }))}
      onChange={site => {
        console.log('Selected site: ', site)
        setState(oldState => ({
          ...oldState,
          selectedSite: site,
        }))
      }}
    />
  )

  const enableButton = (
    <button
      className="btn btn-default btn-secondary btn-secondary--standard"
      type="button"
      onClick={async () => {
        try {
          await netlifyOneGraphAuth.login('netlify')

          const loggedIn = await netlifyOneGraphAuth.isLoggedIn('netlify')

          if (!loggedIn) {
            return
          }

          const availableSites = await fetchNetlifyListSites(netlifyOneGraphAuth)

          const site = availableSites?.data?.netlify?.sites?.[0]

          if (!site) {
            return
          }

          const result = await fetchSiteEnvVars(state.netlifyOneGraphAuth, site.id)

          if (result.success === false) {
            setState(oldState => ({ ...oldState, selectedSite: site, authlifyEnabled: false }))
          } else if (result.success === true) {
            setState(oldState => ({
              ...oldState,
              selectedSite: site,
              authlifyEnabled: true,
              envVars: result.envVars || [],
            }))
          }
        } catch (fetchError) {
          // Handle fetch errors
          console.error(fetchError)
        }
      }}
    >
      Enable
    </button>
  )

  const disableButton = (
    <button
      className="btn btn-default btn-primary btn-primary--standard btn-primary--danger"
      type="button"
      onClick={async () => {
        await netlifyOneGraphAuth.logout('netlify')
        setState(oldState => ({ ...oldState, authlifyEnabled: false, envVars: [] }))
      }}
    >
      Disable
    </button>
  )

  const authTable = (
    <ul className="table-body">
      {state.availableServices
        .filter(service => {
          if (state.search === null) {
            return true
          }
          return !!service.friendlyServiceName.toLocaleLowerCase().match(state.search.toLocaleLowerCase())
        })
        .sort((a, b) => {
          return a.friendlyServiceName.localeCompare(b.friendlyServiceName)
        })
        .map(service => {
          if (blocklist.has(service.slug)) {
            return
          }

          const loggedIn = hasAuthTokenSet(state.envVars, service)
          const doLogin = async (service: any) => {
            await state.userOneGraphAuth.login(service.slug)

            const loggedIn = await state.userOneGraphAuth.isLoggedIn(service.slug)

            if (loggedIn) {
              const loggedInServices: Array<LoggedInService> = await fetchLoggedInServices(state.userOneGraphAuth).then(
                result => {
                  const services = result.data?.me?.serviceMetadata?.loggedInServices || []
                  return services
                },
              )

              if (!state.selectedSite) {
                return
              }

              const existingEnvVars = await fetchSiteEnvVars(state.netlifyOneGraphAuth, state.selectedSite?.id)

              if (!existingEnvVars.success) {
                return
              }

              const filteredEnvVars = existingEnvVars.envVars.filter(({ property }) => {
                return !property.startsWith('ONEGRAPH_')
              })

              const newAccessToken = state.userOneGraphAuth.accessToken()?.accessToken

              const newBearerTokens = Object.fromEntries(
                loggedInServices.map(service => {
                  const propertyName = serviceToEnvVar({ ...service, slug: service.service })
                  return [propertyName, service.bearerToken]
                }),
              )

              const newEnvVars = { ...filteredEnvVars, ...newBearerTokens, ONEGRAPH_ACCESS_TOKEN: newAccessToken }

              await executeNetlifySetEnvMutation(state.netlifyOneGraphAuth, state.selectedSite?.id, newEnvVars)

              const envVars = await fetchSiteEnvVars(state.netlifyOneGraphAuth, state.selectedSite?.id)

              if (envVars.success === true) {
                setState(oldState => ({ ...oldState, envVars: envVars.envVars }))
              }
            }
          }

          const doLogout = async (service: any) => {
            await state.userOneGraphAuth.logout(service.slug)

            const filteredEnvVars = Object.fromEntries(
              state.envVars
                .filter(({ property }) => property !== serviceToEnvVar(service))
                .map(({ property, value }) => [property, value]),
            )
            const newAccessToken = state.userOneGraphAuth.accessToken()?.accessToken

            const newEnvVars = { ...filteredEnvVars, ONEGRAPH_ACCESS_TOKEN: newAccessToken }

            if (!state.selectedSite) {
              return
            }

            await executeNetlifySetEnvMutation(state.netlifyOneGraphAuth, state.selectedSite?.id, newEnvVars)

            const envVars = await fetchSiteEnvVars(state.netlifyOneGraphAuth, state.selectedSite?.id)

            if (envVars.success === true) {
              setState(oldState => ({ ...oldState, envVars: envVars.envVars }))
            }
          }

          const bearerToken = state.envVars.find(({ property }) => property === serviceToEnvVar(service))?.value

          return (
            <li key={service.slug} style={{ display: 'flex' }}>
              <div style={{ textAlign: 'left' }}>
                <img
                  alt={`${service.service} Logomark`}
                  // @ts-ignore: Safe
                  src={serviceImageUrl(service.slug)}
                  style={{
                    width: '50px',
                    borderRadius: '6px',
                    marginRight: '6px',
                    display: 'inline-block',
                  }}
                />
                {service.friendlyServiceName} API
              </div>

              <div
                style={{
                  fontFamily: 'monospace',
                  flexGrow: 1,
                  paddingRight: '6px',
                  textAlign: 'right',
                  justifyContent: 'center',
                  justifySelf: 'center',
                }}
              >
                {loggedIn && bearerToken ? sanitizeToken(bearerToken, 16) : ''}
              </div>
              <div style={{ textAlign: 'left' }}>
                <button
                  className={
                    'btn btn-default btn-primary btn-primary--standard ' + (loggedIn ? 'btn-primary--danger ' : ' ')
                  }
                  type="button"
                  style={{ alignSelf: 'end', marginRight: '6px' }}
                  onClick={() => {
                    loggedIn ? doLogout(service) : doLogin(service)
                  }}
                >
                  {loggedIn ? 'Clear ' : 'Set '} auth
                </button>
              </div>
            </li>
          )
        })}
    </ul>
  )

  return (
    <>
      <div
        className="inline"
        style={{
          position: 'fixed',
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
        <div className="actions">{state.authlifyEnabled ? siteSelectorButton : enableButton}</div>
      </div>
      <div
        style={{
          alignSelf: 'start',
          width: '100%',
          top: '80px',
          position: 'fixed',
          background: 'rgb(250,251,251)',
          zIndex: 99,
        }}
      >
        {state.authlifyEnabled ? (
          <input
            style={{
              width: '100%',
              padding: '6px',
              margin: '6px',
            }}
            placeholder="Search"
            onChange={event => {
              let value: string | null = event.target.value.trim()
              if (value === '') {
                value = null
              }

              setState(oldState => ({ ...oldState, search: value }))
            }}
          />
        ) : null}
      </div>
      <div style={{ alignSelf: 'start', width: '100%', marginTop: '115px' }}>
        {state.authlifyEnabled && state.availableSites.length > 0 ? authTable : null}
      </div>
    </>
  )
}

export default Embed
