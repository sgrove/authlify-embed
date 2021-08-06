import React, { useEffect } from 'react'

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

export type DropdownProps = {
  title: string
  items: Array<{ value: any; label: string }>
  onChange: (value: any) => void
  style: any
}

export const Dropdown = (props: DropdownProps) => {
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
        className="btn btn-default btn-secondary btn-secondary--standard tw-whitespace-nowrap"
        type="button"
        onClick={() => setOpen(!open)}
      >
        {props.title} ({props.items.length})
        <svg
          height={12}
          width={12}
          viewBox="0 0 16 16"
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
