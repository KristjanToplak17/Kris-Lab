import { createBrowserRouter, redirect } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    async lazy() {
      const { ShellRoute } = await import('./shell/ShellRoute')
      return { Component: ShellRoute }
    },
  },
  {
    path: '/project/:slug',
    async lazy() {
      const { ShellRoute } = await import('./shell/ShellRoute')
      return { Component: ShellRoute }
    },
  },
  {
    path: '/piece/:slug',
    loader: ({ params }) => redirect(params.slug ? `/project/${params.slug}` : '/'),
  },
  {
    path: '*',
    async lazy() {
      const { NotFoundRoute } = await import('./shell/NotFoundRoute')
      return { Component: NotFoundRoute }
    },
  },
])
