import React, { useEffect } from 'react'
import { allowList, executeAddAuths, fetchLoggedInServices, newInMemoryAuthWithToken, serviceImageUrl } from '../lib'

function checkSetEquality(setA: Set<any>, setB: Set<any>) {
  if (setA.size !== setB.size) return false
  for (var a of setA) if (!setB.has(a)) return false
  return true
}

function setDifference(setA: Set<any>, setB: Set<any>) {
  return new Set([...setA].filter(x => !setB.has(x)))
}

// This function replaces all but the last four digits of a string with zeroes
const sanitizeToken = (str: string, length = 16): string => {
  const len = str.length
  const displayed = len > 4 ? str.substr(len - 4, len) : str

  const padLength = length - displayed.length
  return displayed.padStart(padLength, '*')
}

export type EnvVar = {
  property: string
  value: string
}

export type ScopeInfo = {
  category: string
  scope: string
  display: string
  isDefault: boolean
  isRequired: boolean
  description: string
  title: string
}

export type Service = {
  friendlyServiceName: string
  service: string
  slug: string
  logoUrl: string
  availableScopes: Array<ScopeInfo>
}

export type LoggedInService = {
  friendlyServiceName: string
  service: string
  slug: string
  isLoggedIn: boolean
  bearerToken: string | null
  grantedScopes: Array<{
    scope: string
  }>
}

export type Site = {
  id: string
  name: string
  envVars: Array<[string, string]>
  authlifyEnabled: boolean
  loggedInServices: Array<LoggedInService>
  oneGraphAuth: any
}

type State = {
  envVars: Array<EnvVar>
  isLoggedIntoNetlify: boolean
  search: string | null
  oneGraphAuth: any
  loggedInServices: Array<LoggedInService>
}

type Props = {
  availableServices: Array<Service>
  selectedSiteId: string
  selectedSiteName: string
  siteEternalOneGraphToken: string
  onDisableAuthlifyForSite: (siteId: string) => void
}

export function SiteAuth(props: Props) {
  const [state, setState] = React.useState<State>({
    envVars: [],
    isLoggedIntoNetlify: false,
    search: null,
    oneGraphAuth: newInMemoryAuthWithToken(props.siteEternalOneGraphToken),
    loggedInServices: [],
  })

  const refreshLoggedInServices = async (auth: any) => {
    const result = await fetchLoggedInServices(auth)
    const services: Array<LoggedInService> = result.data?.me?.serviceMetadata?.loggedInServices || []
    setState(oldState => ({ ...oldState, loggedInServices: services }))
  }

  useEffect(() => {
    const newAuth = newInMemoryAuthWithToken(props.siteEternalOneGraphToken)

    refreshLoggedInServices(newAuth)
  }, [props.siteEternalOneGraphToken])

  return (
    <>
      <button
        className="btn btn-default btn-primary btn-primary--standard btn-primary--danger"
        type="button"
        onClick={async () => {
          props.onDisableAuthlifyForSite(props.selectedSiteId)
        }}
      >
        Disable Authlify for {props.selectedSiteName}
      </button>

      <AuthTable
        availableServices={props.availableServices}
        selectedSiteId={props.selectedSiteId}
        search={state.search}
        allowList={allowList}
        loggedInServices={state.loggedInServices}
        onLogin={async (service: Service, scopes: Array<string> | undefined) => {
          const temporaryAuth = newInMemoryAuthWithToken(props.siteEternalOneGraphToken)
          await temporaryAuth.login(service.slug, scopes)

          const isLoggedIn = await temporaryAuth.isLoggedIn(service.slug)

          if (isLoggedIn) {
            const eternalToken = props.siteEternalOneGraphToken
            if (eternalToken) {
              await executeAddAuths(temporaryAuth, eternalToken, temporaryAuth.accessToken().accessToken)
              state.oneGraphAuth.setToken({ accessToken: eternalToken })
              refreshLoggedInServices(state.oneGraphAuth)
            }
          }
        }}
        onLogout={async (service: Service) => {
          await state.oneGraphAuth.logout(service.slug)
          refreshLoggedInServices(state.oneGraphAuth)
        }}
      />
    </>
  )
}

type AuthTableState = {
  newServiceScopes: { [key: string]: Set<string> }
}

type AuthTableProps = {
  availableServices: Array<Service>
  search: string | null
  allowList: Set<string>
  loggedInServices: Array<LoggedInService>
  onLogin: (service: Service, scopes: Array<string> | undefined) => void
  onLogout: (service: Service) => void
  selectedSiteId: string
}

function AuthTable(props: AuthTableProps) {
  const [state, setState] = React.useState<AuthTableState>({
    newServiceScopes: {},
  })

  /**
   * Build up a list of scopes that are selected:
   * 1. For loggedInServices, this is a list of the grantedScopes
   * 2. For new services, this is a list of the scopes that are default
   **/
  const organizeSelectedScopes = () => {
    const loggedInServices = props.loggedInServices

    const newServiceScopes: { [key: string]: Set<string> } = {}

    for (const service of loggedInServices) {
      const scopes = service.grantedScopes
      for (const scope of scopes) {
        newServiceScopes[service.service] = newServiceScopes[service.service] || new Set()
        newServiceScopes[service.service].add(scope.scope)
      }
    }

    for (const service of props.availableServices) {
      const scopes = service.availableScopes || []
      const alreadyAuthed = newServiceScopes[service.service]
      if (alreadyAuthed) {
        continue
      }
      for (const scope of scopes) {
        if (scope.isDefault) {
          newServiceScopes[service.service] = newServiceScopes[service.service] || new Set()
          newServiceScopes[service.service].add(scope.scope)
        }
      }
    }

    return newServiceScopes
  }

  useEffect(() => {
    // Track loggedInServices scopes in newServiceScopes
    const newServiceScopes = organizeSelectedScopes()

    setState(oldState => ({ ...oldState, newServiceScopes }))
  }, [props.selectedSiteId, props.loggedInServices])

  const currentServiceScopes = organizeSelectedScopes()

  const addScope = (service: Service, scope: string) => {
    setState(oldState => {
      const newServiceScopes = { ...oldState.newServiceScopes }
      if (newServiceScopes[service.service]) {
        newServiceScopes[service.service].add(scope)
      } else {
        newServiceScopes[service.service] = new Set([scope])
      }

      return {
        ...oldState,
        newServiceScopes: { ...newServiceScopes },
      }
    })
  }

  const removeScope = (service: Service, scope: string) => {
    setState(oldState => {
      const newServiceScopes = { ...oldState.newServiceScopes }
      if (newServiceScopes[service.service]) {
        newServiceScopes[service.service].delete(scope)
      } else {
        newServiceScopes[service.service] = new Set([])
      }

      return {
        ...oldState,
        newServiceScopes: { ...newServiceScopes },
      }
    })
  }

  return (
    <>
      <ul className="table-body">
        {props.availableServices
          .filter(service => {
            if (props.search === null) {
              return true
            }
            return !!service.friendlyServiceName.toLocaleLowerCase().match(props.search.toLocaleLowerCase())
          })
          .sort((a, b) => {
            return a.friendlyServiceName.localeCompare(b.friendlyServiceName)
          })
          .map(service => {
            if (!props.allowList.has(service.slug)) {
              return
            }

            const loggedInService = props.loggedInServices?.find(
              loggedInService => loggedInService.service === service.service,
            )

            const loggedIn = !!loggedInService

            const scopeSelectionChanged = !checkSetEquality(
              currentServiceScopes[service.service] || new Set([]),
              state.newServiceScopes[service.service] || new Set([]),
            )

            const scopesObject = service.availableScopes
              ?.sort((a, b) => {
                return a.scope.localeCompare(b.scope)
              })
              .reduce((acc: { [key: string]: Array<ScopeInfo> }, next) => {
                const category = next.category || 'General'
                const existing = acc[category]
                if (existing) {
                  existing.push(next)
                } else {
                  acc[category] = [next]
                }

                return acc
              }, {})

            const availableScopes: Array<[string, Array<ScopeInfo>]> = Object.keys(scopesObject)
              .sort((a, b) => {
                return a.localeCompare(b)
              })
              .map(category => {
                return [category, scopesObject[category]]
              })

            const currentDesiredScopes =
              state.newServiceScopes[service.service] === undefined
                ? undefined
                : [...state.newServiceScopes[service.service]]

            return (
              <li key={service.slug}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'left' }}>
                    <img
                      alt={`${service.service} Logomark`}
                      // @ts-ignore: Safe
                      src={service.logoUrl || serviceImageUrl(service.slug)}
                      style={{
                        width: '50px',
                        borderRadius: '6px',
                        marginRight: '6px',
                        display: 'inline-block',
                      }}
                    />
                    {service.friendlyServiceName} API
                  </div>
                  {loggedInService?.bearerToken ? <>Token: {sanitizeToken(loggedInService.bearerToken)}</> : null}

                  <div style={{ textAlign: 'left', marginBottom: '6px' }}>
                    <button
                      className={
                        'btn btn-default btn-primary btn-primary--standard ' +
                        (loggedIn ? (scopeSelectionChanged ? '' : 'btn-primary--danger ') : ' ')
                      }
                      type="button"
                      style={{ alignSelf: 'end', marginRight: '6px' }}
                      onClick={() => {
                        loggedIn
                          ? scopeSelectionChanged
                            ? props.onLogin(service, currentDesiredScopes)
                            : props.onLogout(service)
                          : props.onLogin(service, currentDesiredScopes)
                      }}
                    >
                      {loggedIn ? (scopeSelectionChanged ? 'Update scopes' : 'Remove auth') : 'Authenticate'}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'monospace',
                    flexGrow: 1,
                    paddingRight: '6px',
                    paddingLeft: '12px',
                  }}
                >
                  {availableScopes?.map(([category, scopes]) => {
                    return (
                      <div style={{ padding: '6px' }}>
                        <h3 style={{ fontWeight: 'bold' }}>{category}</h3>
                        <div style={{ padding: '6px' }}>
                          {scopes.map(scope => {
                            return (
                              <label
                                key={scope.display}
                                title={scope.description}
                                style={{ display: 'block', cursor: 'pointer' }}
                              >
                                <p style={{ display: 'inline-block', minWidth: '200px' }}>
                                  <input
                                    type="checkbox"
                                    key={scope.scope}
                                    value={scope.scope}
                                    style={{
                                      all: 'revert',
                                    }}
                                    onChange={event =>
                                      event.target.checked
                                        ? addScope(service, scope.scope)
                                        : removeScope(service, scope.scope)
                                    }
                                    checked={!!state.newServiceScopes[service.service]?.has(scope.scope)}
                                  />
                                  {scope.display}
                                </p>

                                <p
                                  style={{
                                    display: 'block',
                                    paddingLeft: '6px',
                                    borderLeft: '2px solid #ccc',
                                    margin: '6px',
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {scope.description}
                                </p>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </li>
            )
          })}
      </ul>
    </>
  )
}
