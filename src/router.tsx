import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    async lazy() {
      const { ShellRoute } = await import('./shell/ShellRoute')
      return { Component: ShellRoute }
    },
    children: [
      {
        index: true,
      },
      {
        path: 'piece/:slug',
      },
    ],
  },
  {
    path: '*',
    async lazy() {
      const { NotFoundRoute } = await import('./shell/NotFoundRoute')
      return { Component: NotFoundRoute }
    },
  },
])
