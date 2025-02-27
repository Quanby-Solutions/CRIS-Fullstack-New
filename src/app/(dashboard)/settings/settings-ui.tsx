"use client"

import { t } from "i18next"
import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useBackup } from "@/lib/context/backup-context"
import { ThemeChange } from "@/components/theme/theme-change"
import { ThemeBrightness } from "@/components/theme/theme-brightness"
import { LanguageSelector } from "@/components/custom/language/language-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsUI() {
  // const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(false)
  const { isBackupEnabled, toggleBackup, triggerManualBackup } = useBackup()

  if (isBackupEnabled === null) {
    return <p className="text-center text-sm text-muted-foreground">Loading backup settings...</p>
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-auto">
        <div className="space-y-6">
          {/* Interface Settings */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icons.palette className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{t("interfaceTitle")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{t("themeTitle")}</h3>
                  <CardDescription>{t("themeDescription")}</CardDescription>
                </div>
                <ThemeChange />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{t("languageTitle")}</h3>
                  <CardDescription>{t("languageDescription")}</CardDescription>
                </div>
                <LanguageSelector />
              </div>
              <Separator />
              <ThemeBrightness />
            </CardContent>
          </Card>

          {/* <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{t("notificationTitle", "Notifications")}</CardTitle>
              </div>
              <Switch
                id="notification-toggle"
                checked={isNotificationsEnabled}
                onCheckedChange={setIsNotificationsEnabled}
              />
            </CardHeader>
            <CardContent>
              <CardDescription>
                {isNotificationsEnabled
                  ? t("notificationsDescription", "You will receive important updates and alerts.")
                  : t("notificationsDisabled", "Notifications are currently disabled.")}
              </CardDescription>
            </CardContent>
          </Card> */}
        </div>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icons.lock className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{t("privacyTitle", "Privacy Settings")}</CardTitle>
              </div>
              <Switch id="privacy-mode" checked={isPrivacyModeEnabled} onCheckedChange={setIsPrivacyModeEnabled} />
            </CardHeader>
            <CardContent>
              <CardDescription>
                {isPrivacyModeEnabled
                  ? t("privacyModeDescription", "Your data sharing and tracking settings are minimized.")
                  : t("privacyModeDisabled", "Standard privacy settings are in effect.")}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icons.download className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Backup Settings</CardTitle>
              </div>
              <Switch id="backup-mode" checked={isBackupEnabled} onCheckedChange={toggleBackup}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>
                {isBackupEnabled
                  // Enabled
                  ? `Autosave is enabled. Backups will be created daily every 5:00 PM. `
                  // Disabled 
                  : `Backup settings are currently disabled. Turn on to enable "automatic save" feature.`}
              </CardDescription>
              <Separator />
              <div>
                <Button
                  onClick={triggerManualBackup}
                  className="w-full flex items-center justify-center gap-2 py-2"
                  variant="outline"
                >
                  <Icons.save className="h-5 w-5" />
                  Manual Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}