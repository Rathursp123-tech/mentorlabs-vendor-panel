import { Heading } from "@medusajs/ui"
import { RouteDrawer } from "../../../components/modals"
import { useMe, useTheme } from "../../../hooks/api"
import { EditThemeForm } from "./components/edit-theme-form/edit-theme-form"

export const StoreEditTheme = () => {
  const { seller, isPending: sellerLoading, isError: sellerError, error: sellerErr } = useMe()
  const { theme, templates, isPending: themeLoading, isError: themeError, error: themeErr } = useTheme()

  if (sellerError || themeError) {
    throw sellerErr || themeErr
  }

  const ready = !!seller && !sellerLoading && !themeLoading

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>Store Theme & Branding Settings</Heading>
      </RouteDrawer.Header>
      {ready && (
        <EditThemeForm
          seller={seller}
          theme={theme || null}
          templates={templates || []}
        />
      )}
    </RouteDrawer>
  )
}
