import React, { useEffect } from 'react'
import { allowList, executeAddAuths, fetchLoggedInServices, newInMemoryAuthWithToken } from '../lib'

function checkSetEquality(setA: Set<any>, setB: Set<any>) {
  if (setA.size !== setB.size) return false
  for (var a of setA) if (!setB.has(a)) return false
  return true
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
      <AuthTable
        availableServices={props.availableServices}
        selectedSiteId={props.selectedSiteId}
        search={state.search}
        allowList={allowList}
        loggedInServices={state.loggedInServices}
        onLogin={async (service: Service, scopes: Array<string> | undefined) => {
          console.log('start login...')
          const temporaryAuth = newInMemoryAuthWithToken(props.siteEternalOneGraphToken)
          console.log('Go go go!')
          await temporaryAuth.login(service.slug, scopes)
          console.log("What's this?")

          const isLoggedIn = await temporaryAuth.isLoggedIn(service.slug)

          if (isLoggedIn) {
            const eternalToken = props.siteEternalOneGraphToken
            if (eternalToken) {
              await executeAddAuths(temporaryAuth, eternalToken, temporaryAuth.accessToken().accessToken)
              state.oneGraphAuth.setToken({ accessToken: eternalToken })
              refreshLoggedInServices(state.oneGraphAuth)
            }
          } else {
            console.warn(
              'TODO Notification alert:',
              `Unable to log into ${service.friendlyServiceName}, please try again.`,
            )
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
  confirmRemoveService: string | null
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
    confirmRemoveService: null,
  })

  function markServicePoisedForRemoval(oldState: AuthTableState, service: Service) {
    return {
      ...oldState,
      confirmRemoveService: service.service,
    }
  }

  function unmarkServicePoisedForRemoval(oldState: AuthTableState) {
    return {
      ...oldState,
      confirmRemoveService: null,
    }
  }

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
        if (scope.isDefault || scope.isRequired) {
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

      const newState = {
        ...oldState,
        newServiceScopes: { ...newServiceScopes },
      }

      return unmarkServicePoisedForRemoval(newState)
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

      const newState = {
        ...oldState,
        newServiceScopes: { ...newServiceScopes },
      }

      return unmarkServicePoisedForRemoval(newState)
    })
  }

  return (
    <>
      <ul
        className="card card-settings"
        style={{
          all: 'revert',
          padding: 0,
          listStyle: 'none',
        }}
      >
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

            const isPoisedForRemoval = state.confirmRemoveService === service.service

            return (
              <li key={service.slug}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '24px 0',
                    borderBottom: '1px solid #eee',
                    borderTop: '1px solid #eee',
                    marginTop: '24px',
                  }}
                >
                  <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', width: '100%' }}>
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
                    <div style={{ textAlign: 'left', marginLeft: 'auto' }}>
                      <button
                        className={
                          'btn btn-default btn-primary btn-primary--standard ' +
                          (loggedIn ? (scopeSelectionChanged ? '' : 'btn-primary--danger ') : ' ')
                        }
                        type="button"
                        style={{ alignSelf: 'end', marginRight: '6px' }}
                        onClick={() => {
                          if (loggedIn) {
                            if (scopeSelectionChanged) {
                              console.log('On login')
                              props.onLogin(service, currentDesiredScopes)
                            } else if (isPoisedForRemoval) {
                              setState(oldState => markServicePoisedForRemoval(oldState, service))
                              props.onLogout(service)
                            } else {
                              setState(oldState => markServicePoisedForRemoval(oldState, service))
                            }
                          } else {
                            props.onLogin(service, currentDesiredScopes)
                          }
                        }}
                      >
                        {loggedIn
                          ? scopeSelectionChanged
                            ? `Update ${service.friendlyServiceName} scopes`
                            : isPoisedForRemoval
                            ? `Really remove ${service.friendlyServiceName}? Your site may stop working.`
                            : `Remove ${service.friendlyServiceName}`
                          : `Add ${service.friendlyServiceName}`}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="table-body">
                  {availableScopes?.map(([category, scopes]) => {
                    return (
                      <dl key={category}>
                        <dt>{category}</dt>
                        <dd>
                          {scopes.map(scope => {
                            const isSelected = !!state.newServiceScopes[service.service]?.has(scope.scope)
                            const isRequired = scope.isRequired
                            const unchecked =
                              'tw-w-[20px] tw-h-[20px] tw-p-0 tw-border tw-mr-1 tw-mt-[2px] tw-mb-0 tw-ml-[2px] tw-box-border tw-absolute tw-top-auto before:tw-content-empty before:tw-absolute before:tw-origin-top-left focus:tw-shadow-checkbox tw-cursor-pointer hover:tw-border-teal tw-border-gray focus:tw-border-gray focus:hover:tw-border-teal focus:hover:checked:tw-border-teal-darkest checked:tw-bg-teal-darker checked:tw-border-teal-darker focus:checked:tw-border-teal-darker hover:checked:tw-bg-teal-darkest hover:checked:tw-border-teal-darkest dark:hover:checked:tw-bg-teal dark:hover:checked:tw-border-teal tw-bg-transparent before:tw-h-[11px] before:tw-inline-block before:tw-w-[3px] before:tw-rounded-sm before:tw-left-[7px] before:tw-top-[13px] before:tw-transform before:tw-rotate-[-135deg] after:tw-w-[3px] after:tw-h-[7px] after:tw-rounded-sm after:tw-content-empty after:tw-absolute after:tw-top-[7px] after:tw-transform after:tw--rotate-45 after:tw-left-[3px] dark:after:tw-bg-transparent checked:before:tw-bg-gray-lightest checked:after:tw-bg-gray-lightest dark:checked:after:tw-bg-gray-darkest dark:checked:before:tw-bg-gray-darkest dark:checked:tw-bg-teal-lighter dark:checked:tw-border-teal-lighter'
                            const checked =
                              'tw-w-[20px] tw-h-[20px] tw-p-0 tw-border tw-mr-1 tw-mt-[2px] tw-mb-0 tw-ml-[2px] tw-box-border tw-absolute tw-top-auto before:tw-content-empty before:tw-absolute before:tw-origin-top-left focus:tw-shadow-checkbox tw-cursor-pointer hover:tw-border-teal tw-border-gray focus:tw-border-gray focus:hover:tw-border-teal focus:hover:checked:tw-border-teal-darkest checked:tw-bg-teal-darker checked:tw-border-teal-darker focus:checked:tw-border-teal-darker hover:checked:tw-bg-teal-darkest hover:checked:tw-border-teal-darkest dark:hover:checked:tw-bg-teal dark:hover:checked:tw-border-teal checked:focus:tw-shadow-checkbox tw-bg-teal-darker hover:tw-bg-teal-darkest hover:tw-border-teal-darkest checked:before:tw-bg-gray-lightest checked:after:tw-bg-gray-lightest dark:checked:tw-bg-teal-lighter dark:checked:tw-border-teal-lighter dark:checked:hover:tw-bg-teal dark:checked:hover:tw-border-teal before:tw-h-[11px] before:tw-inline-block before:tw-w-[3px] before:tw-rounded-sm before:tw-left-[7px] before:tw-top-[13px] before:tw-transform before:tw-rotate-[-135deg] after:tw-w-[3px] after:tw-h-[7px] after:tw-rounded-sm after:tw-content-empty after:tw-absolute after:tw-top-[7px] after:tw-transform after:tw--rotate-45 after:tw-left-[3px] dark:after:tw-bg-transparent checked:before:tw-bg-gray-lightest checked:after:tw-bg-gray-lightest dark:checked:after:tw-bg-gray-darkest dark:checked:before:tw-bg-gray-darkest dark:checked:tw-bg-teal-lighter dark:checked:tw-border-teal-lighter tw-bg-teal-darkest dark:tw-bg-gray-dark before:tw-bg-gray-lightest after:tw-bg-gray-lightest dark:before:tw-bg-gray-darkest checked:dark:before:tw-bg-gray-darkest dark:after:tw-bg-gray-darkest hover:checked:tw-bg-teal-darkest hover:checked:tw-border-teal-darkest'
                            return (
                              <label
                                key={scope.display}
                                title={scope.description}
                                style={{ display: 'block', cursor: 'pointer' }}
                              >
                                <p style={{ display: 'inline-block', minWidth: '200px' }}>
                                  <input
                                    className={isSelected ? checked : unchecked}
                                    type="checkbox"
                                    key={scope.scope}
                                    value={scope.scope}
                                    onChange={event => {
                                      if (scope.isRequired) {
                                        return
                                      }

                                      event.target.checked
                                        ? addScope(service, scope.scope)
                                        : removeScope(service, scope.scope)
                                    }}
                                    checked={isSelected || isRequired}
                                  />
                                  <span className="tw-pl-[32px] tw-block tw-cursor-pointer tw-text-base tw-text-gray-darkest tw-font-semibold dark:tw-text-gray-lightest">
                                    {scope.display}
                                  </span>
                                </p>

                                <p
                                  style={{ marginLeft: 32 }}
                                  className="tw-text-muted tw-text-sm tw-ml-[32px] tw-mt-0 tw-text-gray-darker tw-font-regular dark:tw-text-gray-lighter tw-whitespace-pre-wrap"
                                >
                                  {scope.description}
                                </p>
                              </label>
                            )
                          })}
                        </dd>
                      </dl>
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
