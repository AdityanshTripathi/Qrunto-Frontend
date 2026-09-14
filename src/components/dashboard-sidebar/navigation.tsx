import { NavLink } from 'react-router-dom'
import * as React from 'react'

interface DashboardLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof NavLink>, 'to'> {
  href: string
  children: React.ReactNode
}

export const DashboardLink = React.forwardRef<HTMLAnchorElement, DashboardLinkProps>(
  ({ href, children, ...props }, ref) => {
    return (
      <NavLink ref={ref} to={href} {...props}>
        {children}
      </NavLink>
    )
  }
)
DashboardLink.displayName = 'DashboardLink'
