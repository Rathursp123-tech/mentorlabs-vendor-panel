import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { Pencil } from "@medusajs/icons"
import { StoreVendor } from "../../../../../types/user"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { useTheme } from "../../../../../hooks/api/theme"

export const ThemeSection = ({ seller }: { seller: StoreVendor }) => {
  const { theme, templates, seller: themeSeller } = useTheme()

  const overrides = theme?.theme_overrides || {}
  const activeTemplate = templates?.find((t) => t.id === theme?.template_id)
  const brandColor = overrides.brand_color || "#0f172a"
  const socialLinks = overrides.social_links || {}

  const sellerHandle = seller?.handle || themeSeller?.handle || ""

  const getStorefrontBaseUrl = () => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      // If deployed on Vercel or Render production
      if (hostname.includes("vercel.app") || hostname.includes("onrender.com")) {
        return "https://mentorlabs-storefront.vercel.app"
      }
      return `${window.location.protocol}//${hostname}:3000`
    }
    return "http://localhost:3000"
  }

  const storefrontUrl = sellerHandle
    ? `${getStorefrontBaseUrl()}/store/${sellerHandle}`
    : `${getStorefrontBaseUrl()}`

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Store Theme & Branding</Heading>
          <Text size="small" className="text-ui-fg-subtle text-pretty">
            Customize your storefront template, brand colors, banner imagery, announcement ticker, and concierge contact.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-ui-fg-interactive hover:text-ui-fg-interactive-hover px-2.5 py-1 rounded-md border border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover transition flex items-center gap-1.5"
          >
            <span>Live Storefront ↗</span>
          </a>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    icon: <Pencil />,
                    label: "Edit Theme & Branding",
                    to: "edit-theme",
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* Active Template */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          Active Template
        </Text>
        <div className="flex items-center gap-2">
          <Badge color="blue" size="small">
            {activeTemplate ? activeTemplate.name : theme?.template_id || "Modern Retail"}
          </Badge>
          {activeTemplate?.category && (
            <Badge color="grey" size="small" className="capitalize">
              {activeTemplate.category}
            </Badge>
          )}
        </div>
      </div>

      {/* Brand Color */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          Brand Accent Color
        </Text>
        <div className="flex items-center gap-2.5">
          <div
            className="w-5 h-5 rounded-full border border-ui-border-base shadow-sm"
            style={{ backgroundColor: brandColor }}
          />
          <Text size="small" leading="compact" className="font-mono text-ui-fg-base">
            {brandColor}
          </Text>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Store Tagline
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {overrides.tagline || "-"}
        </Text>
      </div>

      {/* Announcement Banner */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Announcement Ticker
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {overrides.announcement_text || overrides.announcement || "-"}
        </Text>
      </div>

      {/* Hero Title & Subtitle */}
      {(overrides.hero_title || overrides.hero_subtitle) && (
        <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            Hero Headline
          </Text>
          <div>
            {overrides.hero_title && (
              <Text size="small" leading="compact" weight="plus" className="text-ui-fg-base">
                {overrides.hero_title}
              </Text>
            )}
            {overrides.hero_subtitle && (
              <Text size="xsmall" leading="compact" className="text-ui-fg-muted mt-0.5">
                {overrides.hero_subtitle}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* Banner Preview */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          Store Banner
        </Text>
        <div>
          {overrides.banner_url ? (
            <img
              src={overrides.banner_url}
              alt="Store Banner"
              className="h-12 w-32 object-cover rounded-md border border-ui-border-base shadow-sm"
            />
          ) : (
            <Text size="small" leading="compact">
              Default Template Banner
            </Text>
          )}
        </div>
      </div>

      {/* Custom Logo */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4 items-center">
        <Text size="small" leading="compact" weight="plus">
          Branded Logo
        </Text>
        <div>
          {overrides.logo_url ? (
            <img
              src={overrides.logo_url}
              alt="Store Logo"
              className="w-10 h-10 object-cover rounded-md border border-ui-border-base shadow-sm"
            />
          ) : (
            <Text size="small" leading="compact">
              Uses Seller Profile Photo
            </Text>
          )}
        </div>
      </div>

      {/* WhatsApp Concierge */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          WhatsApp Concierge
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {socialLinks.whatsapp || overrides.booking_phone || overrides.concierge_phone || overrides.support_phone || overrides.barista_hotline || "-"}
        </Text>
      </div>

      {/* Instagram Handle */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Instagram
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {socialLinks.instagram || "-"}
        </Text>
      </div>

      {/* Free Delivery Target */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Free Delivery Target
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {overrides.free_delivery_threshold != null && overrides.free_delivery_threshold > 0
            ? `€${Number(overrides.free_delivery_threshold).toFixed(2)}`
            : "Default (€45.00)"}
        </Text>
      </div>

      {/* Minimum Order Value */}
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Minimum Order Value
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {overrides.min_order_threshold != null && overrides.min_order_threshold > 0
            ? `€${Number(overrides.min_order_threshold).toFixed(2)}`
            : "Default (€20.00)"}
        </Text>
      </div>
    </Container>
  )
}
