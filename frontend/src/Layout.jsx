import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
    <Header className="header">Header</Header>
    <main className="content">
      <Outlet /> {/* This renders the routed content */}
    </main>
    <Footer className="footer">Footer</Footer>
  </div>
  )
}

export default Layout
