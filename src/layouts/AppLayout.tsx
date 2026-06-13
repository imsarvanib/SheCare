import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'
import { navItems } from '../data/mockData'

export const AppLayout = () => {
  return (
    <div className="shecare-shell mx-auto grid min-h-screen w-full max-w-[1400px] gap-4 p-4 lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="space-y-4">
        <TopBar />
        <div className="-mx-1 overflow-x-auto px-1 lg:hidden">
          <nav className="shecare-panel flex min-w-max gap-2 rounded-2xl p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-xs whitespace-nowrap ${
                    isActive ? 'shecare-button-primary' : 'shecare-button-secondary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <section className="shecare-panel-strong rounded-3xl p-5 md:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
