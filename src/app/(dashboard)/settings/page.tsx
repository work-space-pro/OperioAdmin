import React from 'react'
import SettingsClientView from './SettingsClientView'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto py-2">
      <SettingsClientView />
    </div>
  )
}
