import React, { useEffect, useContext } from 'react'

import withProvider from 'context'
import UserContext from 'context/user'
import { hot } from 'react-hot-loader/root'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { blueGrey } from '@material-ui/core/colors'

import debug from 'utils/debug'
import useGoogleAPI from './utils/hooks/google_api'

import AppRouter from './AppRouter'
import Login from './pages/Login'

import './i18n'

window.debug = debug

const defaultTheme = {
  palette: {
    // type: 'dark',
    primary: blueGrey,
    secondary: {
      main: '#fafafa',
    },
  },
  /* typography: {
    useNextVariants: true,
  }, */
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 12,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
}

const muiDefaultTheme = createMuiTheme(defaultTheme)

const App = () => {
  const { initClient } = useGoogleAPI()
  useEffect(initClient, [])
  const { user } = useContext(UserContext)

  return user ? (
    <MuiThemeProvider
      theme={muiDefaultTheme}
    >
      <AppRouter />
    </MuiThemeProvider>
  ) : (
      <Login />
  )
}

export default hot(withProvider(App))
