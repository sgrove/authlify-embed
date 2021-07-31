import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

function inIframe() {
  return window !== window.parent
}

ReactDOM.render(
  <React.StrictMode>
    {inIframe() ? (
      <ul className="table-body iframe-hack">
        <li className="lab__row" style={{ flexDirection: 'column' }}>
          <App />
        </li>
      </ul>
    ) : (
      <div>
        <svg style={{ bottom: 0, position: 'absolute', zIndex: -1 }} aria-hidden="true">
          <defs>
            <radialGradient id="logo-gradient" cx="0%" cy="0%" r="100%" fx="0%" fy="0%">
              <stop offset="0%" stopColor="#20C6B7" />
              <stop offset="100%" stopColor="#4D9ABF" />
            </radialGradient>
            <path
              id="logomark"
              d="M290 139l-1-1 8-50 38 38-39 17h-1l-5-4zm55-3l40 40c9 9 13 13 14 18l1 2-97-41-1-1 1-1 42-17zm53 73c-2 4-6 8-13 15l-45 45-59-12h-1l-1-1c0-5-3-9-7-12v-1l11-68v-1l1-1c5 0 9-3 12-7h2l100 43zm-69 71l-75 75 13-79 1-1 7-5 1-1 53 11zm-91 91l-8 8-94-135v-1l1-2 1-1h1l103 22h1v1c2 5 6 10 11 12v1l-16 95zm-17 17c-7 6-10 10-15 11h-12c-5-2-9-6-18-14l-94-94 25-38h1a25 25 0 0 0 18-1h1l94 136zM73 282l-21-21 42-19h1l1 1 1 2v1l-24 36zm-31-31l-27-27-10-11 83 17 1 1-1 1-46 19zM0 199l1-5c1-5 6-9 14-18l35-35a22695 22695 0 0 0 48 70l1 1a29 29 0 0 0-5 6h-1L0 199zm59-67l47-47 35 15a5977 5977 0 0 1 25 11l-1 5c0 5 2 10 6 14v2l-48 73v1h-1l-6-1-5 1h-1v-1l-51-73zm57-56l60-61c9-8 13-12 18-14h12c5 2 10 6 18 14l13 13-43 67v1h-1l-7-1c-5 0-10 1-13 4h-2l-55-23zm130-39l40 40-9 60h-1v1a19 19 0 0 0-6 3h-1l-61-26-1-1a23 23 0 0 0-3-9v-2l42-66zm-41 90l57 24 1 1v5l-1 1-127 54-1-1 1-1 47-72 1-1h3a21 21 0 0 0 18-10h1zm-65 96l128-55 1 1 1 1h1v1l-11 68v1c-6 0-12 4-15 9v1h-1l-102-22-2-5z"
            />
            <symbol id="logo" viewBox="0 0 400 400">
              <use xlinkHref="#logomark" fill="url(#logo-gradient)" />
            </symbol>
            <symbol id="logo-mono" viewBox="0 0 400 400">
              <use xlinkHref="#logomark" fill="#0E1E25" />
            </symbol>
          </defs>
        </svg>
        <main className="splash-screen">
          <div className="tw-z-overlay tw-fixed tw-inset-0 tw-items-center tw-flex tw-justify-center tw-m-0 tw-min-h-screen tw-bg-black">
            <div className="container">
              <svg aria-hidden="true" width={50} height={50} className="rotate-loop">
                <use xlinkHref="#logo" />
              </svg>
              <p className="visuallyhidden">Loading Netlify dashboard</p>
            </div>
          </div>
        </main>
        <div id="root" tabIndex={-1}>
          <div role="status" aria-live="polite" aria-atomic="true" className="visuallyhidden" />
          <div className="app">
            <header className="app-header inverse" role="banner">
              <a href="#main" className="skip-to-main">
                Skip to main content
              </a>
              <div className="container">
                <div className="tw-flex tw-justify-between">
                  <ol className="tw-flex tw-flex-wrap tw-items-center tw-list-none tw-mx-[-12px] tw-my-0 tw-p-0 tw-flex-col tw-items-start tw-text-xl tw-text-white md:tw-flex-row md:tw-items-center">
                    <li className="tw-flex tw-items-center tw-m-[4px]">
                      <a
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-w-auto tw-font-semibold tw-p-1 tw-min-h-4 tw-leading-3 tw-text-left tw-text-gray-dark dark:tw-text-gray-light hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest tw-text-xl !tw-text-white active tw-flex tw-items-center tw-p-0 tw-ml-1 hover:!tw-bg-transparent !tw-text-white active"
                        href="/"
                      >
                        <div className="tw-w-4 tw-h-4">
                          <svg
                            viewBox="0 0 400 397"
                            xmlns="http://www.w3.org/2000/svg"
                            className="!tw-fill-current"
                            role="img"
                          >
                            <radialGradient id="a" cx="0%" cy="0%" r="100%">
                              <stop offset={0} stopColor="#20c6b7" />
                              <stop offset={1} stopColor="#4d9abf" />
                            </radialGradient>
                            <path
                              d="M282.153 140.402a16.953 16.953 0 015.105 3.84c.17.167.17.167.34.167h.17l39.14-16.53c.17-.166.342-.332.342-.5 0-.166 0-.333-.17-.5l-36.59-35.894c-.17-.167-.34-.167-.34-.167h-.17c-.17 0-.34.166-.34.5l-7.998 48.582c.17.167.34.5.51.5zm-81.174-32.554c1.87 2.838 3.062 6.177 3.402 9.516 0 .167.17.334.34.5l58.2 24.542h.17c.17 0 .34 0 .34-.167 1.703-1.337 3.745-2.338 5.957-3.006.17 0 .34-.167.34-.5l9.53-58.6c0-.166 0-.333-.17-.5L242.672 43.74c-.17-.167-.17-.167-.34-.167s-.34.167-.34.334l-41.013 63.106c-.172.334-.172.668 0 .835zm198.765 90.318L337.29 136.73c-.17-.167-.34-.167-.34-.167h-.17l-42.375 17.863c-.17.167-.34.334-.34.5 0 .168.17.502.34.502l104.49 43.907h.17c.17 0 .34 0 .34-.167l.34-.334c.34 0 .34-.5 0-.668zm-10.38 10.017l-100.235-42.07h-.17c-.17 0-.34 0-.51.166-2.724 3.672-6.808 6.01-11.573 6.677-.17 0-.51.167-.51.5l-10.72 65.277c0 .167 0 .334.17.5 3.743 2.84 5.955 7.013 6.465 11.687 0 .335.17.502.51.502l60.584 12.52h.17c.17 0 .34 0 .34-.166l55.478-54.59c.17-.168.17-.335.17-.502s0-.334-.17-.5zm-132.74-55.76l-54.796-23.04h-.17c-.17 0-.34.168-.51.335-3.745 5.676-10.042 9.015-16.85 9.015-1.02 0-2.04-.167-3.232-.334h-.17c-.17 0-.34.166-.51.333l-45.098 69.283c-.17.167-.17.5 0 .668.17.167.34.167.51.167h.17l120.316-50.918c.17-.167.34-.334.34-.5v-1.504c0-1.003.17-2.005.34-2.84 0-.333-.17-.5-.34-.667zm66.03 121.203l-53.266-10.85h-.17c-.17 0-.34.166-.51.166-2.043 2.504-4.596 4.507-7.66 5.676-.17 0-.34.334-.34.5l-12.763 77.798c0 .334.17.5.34.668h.34c.17 0 .34 0 .34-.167l73.858-72.622c.17-.167.17-.334.17-.5 0-.502-.17-.67-.34-.67zm-74.367-5.342c-5.106-2.004-8.85-6.51-10.21-11.686 0-.167-.17-.334-.512-.5l-98.702-20.202h-.17c-.17 0-.34.167-.51.334-.51.835-.852 1.503-1.362 2.17-.17.167-.17.5 0 .668l89.853 128.883c.17.168.17.168.34.168s.34 0 .34-.167l5.447-5.34c0-.168.17-.168.17-.335l15.316-93.49c.34 0 .34-.334 0-.5zm-107.382-44.24c0 .333.17.5.51.5l97.852 20.033h.17c.17 0 .34-.167.51-.334 2.894-5.008 8-8.347 13.785-8.68.34 0 .51-.168.51-.502l10.552-64.273c0-.167 0-.5-.34-.5-.68-.502-1.362-1.003-2.213-1.837-.17-.167-.34-.167-.34-.167h-.17l-120.996 51.252c-.34.167-.34.334-.34.668.17 1.336.51 2.504.51 3.84zm-41.012 16.193c-.51-.668-1.02-1.336-1.532-2.17-.17-.168-.34-.334-.51-.334h-.17l-42.204 17.863c-.17 0-.34.167-.34.334s0 .334.17.5l20.59 20.2a.53.53 0 00.34.168c.17 0 .34-.167.512-.334l23.314-35.893s0-.166-.17-.333zm27.91 6.51c-.172-.166-.342-.333-.512-.333h-.17c-3.063 1.335-6.126 2.003-9.36 2.003-2.552 0-4.935-.334-7.488-1.168h-.17c-.17 0-.34.165-.51.332l-24.506 37.73-.17.167c-.17.166-.17.5 0 .667l112.657 110.686c.17.167.34.167.34.167.17 0 .34 0 .34-.167l19.74-19.533c.17-.167.17-.5 0-.668l-90.192-129.884zm-15.828-43.572c.17.166.34.333.51.333h.17c1.703-.333 3.575-.667 5.276-.667 1.872 0 3.914.335 5.786.835h.17c.17 0 .34-.167.51-.334l45.608-70.116c.17-.167.17-.5 0-.668-3.573-3.673-5.615-8.514-5.615-13.69 0-1.502.17-3.005.51-4.507 0-.335-.17-.502-.34-.67-5.785-2.503-57.008-23.873-57.008-24.04h-.17c-.17 0-.34 0-.34.167l-43.396 42.74c-.17.166-.17.5 0 .667l48.33 69.95zM116.91 80.97s51.735 21.702 53.947 22.704h.17c.17 0 .17 0 .34-.167 3.575-2.838 8.17-4.507 12.764-4.507 2.213 0 4.426.333 6.638 1h.17c.17 0 .34-.166.51-.333l42.034-64.608a.504.504 0 000-.67L198.596.168c-.17-.167-.17-.167-.34-.167s-.34 0-.34.167l-81.005 79.8c-.17.168-.17.335-.17.5-.17.335 0 .335.17.502zM96.83 215.36c.17 0 .34-.167.51-.334 1.022-2.004 2.554-3.84 4.085-5.51.17-.166.17-.5 0-.667-.51-.667-46.628-66.778-46.628-66.945-.17-.167-.17-.167-.51-.334-.17 0-.34 0-.34.168L.17 194.493c-.17.167-.17.334-.17.5 0 .168.17.335.51.335l96.32 20.034c-.17 0-.17 0 0 0zm-4.424 11.52c0-.335-.17-.502-.51-.502L8.338 209.185h-.172c-.17 0-.34.167-.51.334-.17.165 0 .5.17.666l37.27 36.73c.17.166.34.166.34.166h.17l46.287-19.533c.34-.335.51-.502.51-.67z"
                              fill="url(#a)"
                            />
                          </svg>
                        </div>
                      </a>
                    </li>
                  </ol>
                  <div className="tw-flex tw-flex-wrap tw-justify-end tw-self-start lg:tw-self-center">
                    <div
                      className="md:tw-mx-1 md:tw-relative tw-mx-[4px] tw-static tw-w-button-icon"
                      role="combobox"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-labelledby="downshift-3-label"
                    >
                      <button
                        role="button"
                        aria-label="Notifications. Open menu"
                        aria-haspopup="true"
                        data-toggle="true"
                        className="btn btn-icon btn-tertiary btn-tertiary--standard hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest active:tw-text-white active:tw-bg-gray-darkest dark:hover:tw-text-white dark:active:tw-text-white tw-text-gray-dark tw-bg-transparent dark:tw-text-gray-light"
                        type="button"
                      >
                        <span className="tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            className="!tw-fill-current"
                            role="img"
                          >
                            <g fill="none">
                              <path
                                fill="currentColor"
                                d="M15 19a3 3 0 11-6 0h6zm3.13-2H5.87C4.838 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2s5.611 2.686 5.611 6v2l2.142 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264z"
                              />
                            </g>
                          </svg>
                        </span>
                      </button>
                    </div>
                    <div
                      className="md:tw-mx-1 md:tw-relative tw-mx-[4px] tw-static tw-w-button-icon"
                      role="combobox"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-labelledby="downshift-4-label"
                    >
                      <button
                        role="button"
                        aria-label="Support. Open menu"
                        aria-haspopup="true"
                        data-toggle="true"
                        className="btn btn-icon btn-tertiary btn-tertiary--standard hover:tw-text-white hover:tw-bg-gray-darkest active:tw-text-white active:tw-bg-gray-darkest dark:hover:tw-text-white dark:active:tw-text-white tw-text-gray-dark tw-bg-transparent dark:tw-text-gray-light"
                        type="button"
                      >
                        <span className="tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2">
                          <svg
                            fill="none"
                            viewBox="0 0 16 16"
                            xmlns="http://www.w3.org/2000/svg"
                            className="!tw-fill-current"
                            role="img"
                            width={24}
                            height={24}
                          >
                            <path
                              clipRule="evenodd"
                              d="M15 8A7 7 0 101 8a7 7 0 0014 0zM4 8a4 4 0 118 0 4 4 0 01-8 0z"
                              fill="#7d8589"
                              fillRule="evenodd"
                            />
                            <path
                              d="M13.77 11.97L11.58 9.8c-.23.45-.54.86-.92 1.2l2.12 2.12c.37-.34.7-.72.99-1.14zM3.22 13.11L5.34 11c-.38-.34-.7-.75-.92-1.2l-2.18 2.18c.28.42.61.8.98 1.14zm2.41-8.33c-.4.3-.75.67-1.02 1.1L2.46 3.72c.3-.4.65-.76 1.04-1.08zm5.81 1.17c-.26-.43-.6-.81-1-1.12l2.13-2.13c.38.33.72.7 1.03 1.1z"
                              fill="#2d3b41"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                    <div
                      className="dropdown tw-w-[36px] tw-h-[36px] tw-ml-[4px] md:tw-ml-1"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                    >
                      <button
                        role="button"
                        aria-label="User. Open menu"
                        aria-haspopup="true"
                        data-toggle="true"
                        name="User"
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-rounded-50 tw-w-[36px] tw-h-[36px] hover:tw-shadow-teal tw-relative"
                        type="button"
                      >
                        <img
                          className="tw-rounded-50 tw-inline-block tw-text-xl tw-text-center tw-self-center tw-object-cover tw-h-avatar-md tw-w-avatar-md tw-leading-normal tw-border-gray-darkest tw-border-solid tw-border tw-absolute tw-m-0 tw-top-0 tw-left-0"
                          src="https://avatars2.githubusercontent.com/u/35296?s=32"
                          width={32}
                          height={32}
                          alt=""
                        />
                      </button>
                      <ul className="dropdown-inner dropdown-menu tw-top-4 tw-mt-[4px] tw-left-auto tw-right-0">
                        <li>
                          <a id="downshift-5-item-0" role="option" aria-selected="false" className="menuitem">
                            <div>
                              <strong className="h4">
                                Sean Grove
                                <br />
                              </strong>
                              <small className="subdued">sean@bushi.do</small>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a id="downshift-5-item-1" role="option" aria-selected="false" className="menuitem">
                            User settings
                          </a>
                        </li>
                        <li>
                          <a id="downshift-5-item-2" role="option" aria-selected="false" className="menuitem">
                            Netlify Labs
                          </a>
                        </li>
                        <li>
                          <a id="downshift-5-item-3" role="option" aria-selected="false" className="menuitem">
                            Sign out
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <main id="main" className="app-main" role="main" tabIndex={-1}>
              <div className="container">
                <div className="card card-hero media">
                  <div className="media-figure">
                    <img
                      className="tw-rounded-50 tw-inline-block tw-text-xl tw-text-center tw-self-center tw-object-cover tw-leading-chill tw-w-avatar-lg tw-h-5 tw-text-2xl md:tw-w-avatar-xxl md:tw-text-3xl md:tw-h-avatar-xxl md:tw-leading-very-chill"
                      src="https://avatars2.githubusercontent.com/u/35296?s=128"
                      width={128}
                      height={128}
                      alt=""
                    />
                  </div>
                  <div className="media-body">
                    <h1>Sean Grove</h1>
                    <p>sean@bushi.do</p>
                    <p>
                      <time
                        dateTime="2017-12-31T13:10:32.299Z"
                        title="Sun, Dec 31, 2017 at 5:10 AM"
                        aria-label="Joined Netlify on Dec 31, 2017"
                      >
                        Joined Netlify on Dec&nbsp;31,&nbsp;2017
                        <span className="tw-hidden md:tw-inline"> (4 years ago)</span>
                      </time>
                      .
                    </p>
                    <p>Created 70 sites. Collaborates on 2 teams.</p>
                  </div>
                </div>
                <div className="layout-sidebar">
                  <a
                    href="#content"
                    className="tw-sr-only focus:tw-not-sr-only tw-bg-teal-darker tw-text-white tw-block tw-text-sm tw-l-0 tw-absolute tw-py-0 focus:tw-pr-1 focus:tw-pl-1 tw-mb-2 tw-t-0 focus:tw-h-3 focus:tw-absolute"
                  >
                    Skip to content
                  </a>
                  <nav className="sidebar tw-mt-3 md:tw-mt-3 0">
                    <ul className="sidenav section">
                      <li>
                        <a
                          className="tw-text-inherit tw-text-decoration-color-gray tw-font-weight-inherit hover:tw-text-black hover:tw-text-decoration-color-inherit dark:hover:tw-text-white dark:tw-text-inherit dark:tw-text-decoration-color-white"
                          href="/user/settings"
                        >
                          General
                        </a>
                      </li>
                      <li>
                        <a
                          className="tw-text-inherit tw-text-decoration-color-gray tw-font-weight-inherit hover:tw-text-black hover:tw-text-decoration-color-inherit dark:hover:tw-text-white dark:tw-text-inherit dark:tw-text-decoration-color-white"
                          href="/user/security"
                        >
                          Security
                        </a>
                      </li>
                      <li>
                        <a
                          className="tw-text-inherit tw-text-decoration-color-gray tw-font-weight-inherit hover:tw-text-black hover:tw-text-decoration-color-inherit dark:hover:tw-text-white dark:tw-text-inherit dark:tw-text-decoration-color-white"
                          href="/user/applications"
                        >
                          Applications
                        </a>
                      </li>
                      <li data-cy="sidenav-item-active" className="active">
                        <a
                          className="tw-text-inherit tw-text-decoration-color-gray tw-font-weight-inherit hover:tw-text-black hover:tw-text-decoration-color-inherit dark:hover:tw-text-white dark:tw-text-inherit dark:tw-text-decoration-color-white"
                          href="/user/labs"
                        >
                          Labs
                        </a>
                      </li>
                    </ul>
                  </nav>
                  <div className="main" id="content">
                    <section id="section-labs" className="tw-mt-3 md:tw-mt-3">
                      <header className="tw-py-1">
                        <h2 className="tw-leading-none tw-text-xl">
                          <a id="labs" className="anchor" href="#labs">
                            Labs
                          </a>
                        </h2>
                        <p>
                          Netlify Labs gives you early access to new features before they’re available to everyone. We
                          welcome your feedback, and we encourage you to join the{' '}
                          <a
                            className="tw-text-teal-darker tw-cursor-pointer tw-font-medium tw-relative hover:tw-underline tw-no-underline focus:tw-outline-teal dark:tw-text-teal-lighter dark:focus:tw-outline-teal-lightest"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.netlify.com/research-program/"
                          >
                            Netlify research program
                          </a>{' '}
                          to help us continuously improve the platform. Experimental features are works-in-progress, so
                          you may find some bugs along the way.
                          <br />
                          <a
                            className="tw-bg-none tw-border-none tw-text-teal-darker tw-inline-block tw-font-bold tw-pr-3 tw-mt-1 tw-no-underline hover:tw-underline hover:tw-text-teal-darkest after:tw-content-arrow after:tw-ml-[4px] after:tw-absolute dark:tw-text-teal-lighter dark:hover:tw-outline-teal-lightest after:tw-transform after:tw--rotate-40"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.netlify.com/blog/2021/03/31/test-drive-netlify-beta-features-with-netlify-labs"
                          >
                            Learn more about Netlify Labs
                          </a>
                        </p>
                      </header>
                      <section className="labs">
                        <div className="card">
                          <header className="table-header">
                            <h3 className="card-title">Experimental features</h3>
                          </header>
                          <ul className="table-body">
                            <li className="lab__row">
                              <div className="inline">
                                <div className="media media-figure">
                                  <span className="lab__icon-circle">
                                    <svg
                                      width={24}
                                      height={24}
                                      viewBox="0 0 16 16"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="!tw-fill-current !tw-mr-0"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M11.53 1a1 1 0 00-1-1H5.47a1 1 0 00-1.01 1 1 1 0 001 1v3.4a1 1 0 01-.16.55L1.34 11.9A2 2 0 003.02 15h9.96a2 2 0 001.68-3.1L10.7 5.95a1 1 0 01-.17-.55V2a1 1 0 001.01-1zM7.5 5.4V2h1v3.4c0 .59.18 1.16.5 1.65l1.6 2.38c-1.05-.12-1.88.1-2.7.32-.88.23-1.75.47-2.9.29l2-2.99c.32-.49.5-1.06.5-1.65z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                  <div className="lab__info">
                                    <h2 className="lab__name h3">Appearance settings (dark mode)</h2>
                                    <p className="lab__desc">
                                      Adds Appearance options to your User settings. When enabled, you can select a
                                      light or dark theme for the Netlify UI.
                                    </p>
                                  </div>
                                </div>
                                <div className="actions">
                                  <button
                                    className="btn btn-default btn-secondary btn-secondary--standard"
                                    type="button"
                                  >
                                    Enable
                                  </button>
                                </div>
                              </div>
                            </li>
                            <li className="lab__row" style={{ flexDirection: 'column' }}>
                              <App />
                            </li>
                          </ul>
                        </div>
                      </section>
                    </section>
                  </div>
                </div>
              </div>
            </main>
            <footer className="app-footer inverse" role="contentinfo">
              <div className="container">
                <nav>
                  <ul
                    className="tw-flex tw-flex-wrap tw-items-center tw-list-none tw-mx-[-12px] tw-my-0 tw-p-0"
                    aria-label="External links"
                  >
                    <li className="tw-flex tw-items-center tw-m-[4px]">
                      <a
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-w-auto tw-font-semibold tw-p-1 tw-min-h-4 tw-leading-3 tw-text-left tw-text-gray-dark dark:tw-text-gray-light hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest"
                        href="https://www.netlify.com/docs/"
                      >
                        Docs
                      </a>
                    </li>
                    <li className="tw-flex tw-items-center tw-m-[4px]">
                      <a
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-w-auto tw-font-semibold tw-p-1 tw-min-h-4 tw-leading-3 tw-text-left tw-text-gray-dark dark:tw-text-gray-light hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest"
                        href="https://www.netlify.com/pricing/"
                      >
                        Pricing
                      </a>
                    </li>
                    <li className="tw-flex tw-items-center tw-m-[4px]">
                      <a
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-w-auto tw-font-semibold tw-p-1 tw-min-h-4 tw-leading-3 tw-text-left tw-text-gray-dark dark:tw-text-gray-light hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest"
                        href="https://www.netlify.com/support"
                      >
                        Support
                      </a>
                    </li>
                    <li className="tw-flex tw-items-center tw-m-[4px]">
                      <a
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-w-auto tw-font-semibold tw-p-1 tw-min-h-4 tw-leading-3 tw-text-left tw-text-gray-dark dark:tw-text-gray-light hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest"
                        href="https://www.netlify.com/news/"
                      >
                        News
                      </a>
                    </li>
                    <li className="tw-flex tw-items-center tw-m-[4px]">
                      <a
                        className="btn btn-default btn-tertiary btn-tertiary--standard tw-w-auto tw-font-semibold tw-p-1 tw-min-h-4 tw-leading-3 tw-text-left tw-text-gray-dark dark:tw-text-gray-light hover:tw-text-white hover:tw-bg-gray-darkest focus:tw-text-white focus:tw-bg-gray-darkest"
                        href="https://www.netlify.com/tos/"
                      >
                        Terms
                      </a>
                    </li>
                  </ul>
                </nav>
                <p>
                  <small>© 2021 Netlify</small>
                </p>
              </div>
            </footer>
          </div>
        </div>
        <iframe
          id="CrossStorageClient-cc7608ef-f774-425a-8f5e-d75209360b92"
          src="https://www.netlify.com/storage.html"
          style={{ display: 'none', position: 'absolute', top: '-999px', left: '-999px' }}
        />
        <noscript>
          &amp;lt;div class="app"&amp;gt; &amp;lt;div class="tw-flex tw-z-overlay tw-inset-0 tw-fixed tw-items-center
          tw-justify-center tw-m-0 tw-text-center tw-w-full tw-min-h-screen tw-bg-white" &amp;gt; &amp;lt;div
          class="container"&amp;gt; &amp;lt;h1&amp;gt;The Netlify dashboard needs JavaScript :(&amp;lt;/h1&amp;gt;
          &amp;lt;p&amp;gt; You can enable JavaScript in &amp;lt;a href="https://enable-javascript.com/"
          class="highlight-link" target="new" &amp;gt;your browser settings&amp;lt;/a &amp;gt;. &amp;lt;/p&amp;gt;
          &amp;lt;/div&amp;gt; &amp;lt;/div&amp;gt; &amp;lt;/div&amp;gt;
        </noscript>
        <div
          id="a11y-status-message"
          role="status"
          aria-live="polite"
          aria-relevant="additions text"
          style={{
            border: '0px',
            clip: 'rect(0px, 0px, 0px, 0px)',
            height: '1px',
            margin: '-1px',
            overflow: 'hidden',
            padding: '0px',
            position: 'absolute',
            width: '1px',
          }}
        />
      </div>
    )}{' '}
  </React.StrictMode>,
  document.getElementById('root'),
)
