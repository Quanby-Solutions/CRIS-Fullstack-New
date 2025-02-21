"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, Download, Palette, Save, Lock, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBackup } from "@/lib/context/BackupContext"
import { LanguageSelector } from "@/components/custom/language/language-selector"
import { ThemeChange } from "@/components/theme/theme-change"
import { t } from "i18next"
import { ThemeBrightness } from "@/components/theme/theme-brightness"
import { Separator } from "@/components/ui/separator"

export function SettingsUI() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
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
                <Palette className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{t("interfaceTitle")}</CardTitle>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                <Lock className="h-6 w-6 text-primary" />
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
                <Download className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Backup Settings</CardTitle>
              </div>
              <Switch id="backup-mode" checked={isBackupEnabled} onCheckedChange={toggleBackup} />
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>
                {isBackupEnabled
                  ? "Auto-backup is enabled. Backups will be created every minute."
                  : "Automatic backups are currently disabled."}
              </CardDescription>
              <Separator />
              <div>
                <CardDescription className="mb-3">You can manually trigger a backup if needed.</CardDescription>
                <Button
                  onClick={triggerManualBackup}
                  className="w-full flex items-center justify-center gap-2 py-2"
                  variant="outline"
                >
                  <Save className="h-5 w-5" />
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