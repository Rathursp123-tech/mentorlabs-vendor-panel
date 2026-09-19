import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge, Button, Input, Select, Text, Textarea, toast, clx } from "@medusajs/ui"
import { RouteDrawer, useRouteModal } from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { Form } from "../../../../../components/common/form"
import { StoreVendor } from "../../../../../types/user"
import { SellerTheme, StoreTemplate, useUpdateTheme } from "../../../../../hooks/api/theme"

const EditThemeSchema = z.object({
  template_id: z.string().min(1, "Template is required"),
  brand_color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Must be a valid hex color (e.g. #8B4513)"),
  tagline: z.string().optional(),
  announcement_text: z.string().optional(),
  banner_url: z.string().optional(),
  logo_url: z.string().optional(),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  min_order_threshold: z.coerce.number().min(0).optional(),
  free_delivery_threshold: z.coerce.number().min(0).optional(),
  product_card_size: z.enum(["compact", "standard", "editorial"]).default("compact"),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
})

type EditThemeFormValues = z.infer<typeof EditThemeSchema>

interface EditThemeFormProps {
  seller: StoreVendor
  theme: SellerTheme | null
  templates: StoreTemplate[]
}

const PRESET_COLORS = [
  { name: "Terracotta", hex: "#8B4513" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Heritage Gold", hex: "#D4AF37" },
  { name: "Forest Emerald", hex: "#15803D" },
  { name: "Sunset Orange", hex: "#EA580C" },
  { name: "Electric Cyan", hex: "#06B6D4" },
  { name: "Rose Blush", hex: "#E11D48" },
  { name: "Midnight Slate", hex: "#0F172A" },
]

export const EditThemeForm = ({ seller, theme, templates }: EditThemeFormProps) => {
  const { handleSuccess } = useRouteModal()
  const { mutateAsync, isPending } = useUpdateTheme()

  const overrides = theme?.theme_overrides || {}
  const socialLinks = overrides.social_links || {}

  const defaultTemplateId =
    theme?.template_id || (templates.length > 0 ? templates[0].id : "tmpl_retail_modern")

  const form = useForm<EditThemeFormValues>({
    defaultValues: {
      template_id: defaultTemplateId,
      brand_color: overrides.brand_color || "#8B4513",
      tagline: overrides.tagline || "",
      announcement_text: overrides.announcement_text || overrides.announcement || "",
      banner_url: overrides.banner_url || "",
      logo_url: overrides.logo_url || "",
      hero_title: overrides.hero_title || "",
      hero_subtitle: overrides.hero_subtitle || "",
      min_order_threshold: overrides.min_order_threshold !== undefined ? Number(overrides.min_order_threshold) : 20,
      free_delivery_threshold: overrides.free_delivery_threshold !== undefined ? Number(overrides.free_delivery_threshold) : 45,
      product_card_size: (overrides.product_card_size as any) || (overrides.category === "grocery" ? "compact" : "standard"),
      whatsapp:
        socialLinks.whatsapp ||
        overrides.booking_phone ||
        overrides.concierge_phone ||
        overrides.support_phone ||
        overrides.barista_hotline ||
        "",
      instagram: socialLinks.instagram || "",
    },
    resolver: zodResolver(EditThemeSchema),
  })

  // Watch values for real-time live preview
  const watchedColor = form.watch("brand_color") || "#8B4513"
  const watchedTagline = form.watch("tagline") || ""
  const watchedAnnouncement = form.watch("announcement_text") || ""
  const watchedBanner = form.watch("banner_url") || ""
  const watchedLogo = form.watch("logo_url") || seller.photo || ""
  const watchedTemplateId = form.watch("template_id")
  const watchedCardSize = form.watch("product_card_size") || "compact"

  const selectedTemplate = templates.find((t) => t.id === watchedTemplateId)

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync({
        template_id: values.template_id,
        theme_overrides: {
          brand_color: values.brand_color,
          tagline: values.tagline || undefined,
          announcement_text: values.announcement_text || undefined,
          banner_url: values.banner_url || undefined,
          logo_url: values.logo_url || undefined,
          hero_title: values.hero_title || undefined,
          hero_subtitle: values.hero_subtitle || undefined,
          min_order_threshold: values.min_order_threshold !== undefined ? Number(values.min_order_threshold) : undefined,
          free_delivery_threshold: values.free_delivery_threshold !== undefined ? Number(values.free_delivery_threshold) : undefined,
          product_card_size: values.product_card_size,
          social_links: {
            whatsapp: values.whatsapp || undefined,
            instagram: values.instagram || undefined,
          },
        },
      })
      toast.success("Store theme and branding updated successfully")
      handleSuccess()
    } catch (err: any) {
      toast.error(err.message || "Failed to update theme settings")
    }
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <RouteDrawer.Body className="flex max-w-full flex-1 flex-col gap-y-6 overflow-y-auto">
          {/* Live Storefront Mini Preview */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Text size="xsmall" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">
                Live Storefront Preview
              </Text>
              <Badge color="blue" size="small">
                {selectedTemplate?.name || "Template Preview"}
              </Badge>
            </div>

            {/* Announcement bar preview */}
            {watchedAnnouncement && (
              <div
                className="py-1 px-3 text-center text-xs font-medium text-white rounded-t-md truncate transition-colors"
                style={{ backgroundColor: watchedColor }}
              >
                {watchedAnnouncement}
              </div>
            )}

            {/* Store Header Preview */}
            <div className="bg-white p-3 border border-ui-border-base rounded-md flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {watchedLogo ? (
                  <img
                    src={watchedLogo}
                    alt={seller.name || "Store"}
                    className="w-9 h-9 rounded-lg object-cover border border-ui-border-base shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: watchedColor }}
                  >
                    {(seller.name || "Store").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                    {seller.name || "Store Name"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {watchedTagline || "Your store tagline will appear here"}
                  </p>
                </div>
              </div>

              {/* Accent Button Preview */}
              <button
                type="button"
                className="px-2.5 py-1 text-xs text-white font-semibold rounded-md shrink-0 shadow-xs pointer-events-none"
                style={{ backgroundColor: watchedColor }}
              >
                Catalog
              </button>
            </div>

            {/* Banner Thumbnail Preview */}
            {watchedBanner && (
              <div className="mt-2 relative h-16 rounded-md overflow-hidden border border-ui-border-base">
                <img
                  src={watchedBanner}
                  alt="Store banner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center px-3">
                  <span className="text-xs font-semibold text-white drop-shadow">
                    Hero Banner Display
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Template Selection */}
          <div className="space-y-3">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              1. Storefront Template Architecture
            </Text>
            <Form.Field
              name="template_id"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Selected Template Layout</Form.Label>
                  <Form.Control>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <Select.Trigger className="bg-ui-bg-base">
                        <Select.Value placeholder="Select a template..." />
                      </Select.Trigger>
                      <Select.Content>
                        {templates.map((tpl) => (
                          <Select.Item key={tpl.id} value={tpl.id}>
                            <span className="font-medium">{tpl.name}</span>
                            {tpl.category && (
                              <span className="ml-2 text-ui-fg-muted text-xs capitalize">
                                ({tpl.category})
                              </span>
                            )}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          </div>

          {/* Section 2: Brand Color */}
          <div className="space-y-3">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              2. Brand Accent Color
            </Text>
            <Form.Field
              name="brand_color"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Color Hex Code</Form.Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-10 h-10 p-0.5 rounded-lg border border-ui-border-base cursor-pointer bg-ui-bg-base"
                    />
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="#8B4513"
                        className="font-mono uppercase"
                      />
                    </Form.Control>
                  </div>
                  <Form.ErrorMessage />
                  {/* Preset Swatches */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => field.onChange(preset.hex)}
                        title={preset.name}
                        className={clx(
                          "w-6 h-6 rounded-full border transition-transform hover:scale-110",
                          field.value.toUpperCase() === preset.hex.toUpperCase()
                            ? "border-ui-fg-interactive ring-2 ring-ui-border-interactive ring-offset-1"
                            : "border-ui-border-base"
                        )}
                        style={{ backgroundColor: preset.hex }}
                      />
                    ))}
                  </div>
                </Form.Item>
              )}
            />
          </div>

          {/* Section 3: Tagline & Announcement */}
          <div className="space-y-4">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              3. Messaging & Announcements
            </Text>
            <Form.Field
              name="tagline"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Store Tagline / Slogan</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="e.g. Handcrafted Terracotta & Ceramic Heirlooms"
                    />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />

            <Form.Field
              name="announcement_text"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Top Announcement Bar Ticker</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="e.g. Free shipping on all orders over ₹1,500 | Use Code: FESTIVE"
                    />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <Form.Field
                name="hero_title"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Hero Headline (Optional)</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="Leave blank to use default template title"
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="hero_subtitle"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Hero Subtitle / Description (Optional)</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder="Custom narrative or story for the hero header"
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          {/* Section 4: Imagery */}
          <div className="space-y-4">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              4. Media & Imagery
            </Text>
            <Form.Field
              name="banner_url"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Hero Banner Image URL</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />

            <Form.Field
              name="logo_url"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Custom Brand Logo URL</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="https://images.unsplash.com/photo-... (leaves empty to use store profile photo)"
                    />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          </div>

          {/* Section 5: Concierge & Social Links */}
          <div className="space-y-4">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              5. Concierge & Social Channels
            </Text>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                name="whatsapp"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>WhatsApp Concierge Phone</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="+91 98765 43210" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="instagram"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Instagram Handle</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="@yourbrand" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          {/* Section 6: Order Guardrails & Delivery Incentives */}
          <div className="space-y-4">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base">
                6. Order Guardrails & Delivery Incentives
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                Configure minimum order checkout requirement and free delivery promotion target for your storefront. Set to 0 to disable.
              </Text>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                name="min_order_threshold"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Minimum Order Value (€)</Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        placeholder="20"
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="free_delivery_threshold"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Free Delivery Target (€)</Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        placeholder="45"
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          {/* Section 7: Product Card Display & Ideal Size View */}
          <div className="space-y-4">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base">
                7. Product Card Sizing & Storefront View
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                Choose how your product catalog is presented on the storefront.
              </Text>
            </div>

            <Form.Field
              name="product_card_size"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Catalog Layout & Density</Form.Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => field.onChange("compact")}
                      className={clx(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2",
                        field.value === "compact"
                          ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Compact (Quick-Commerce)</span>
                          {field.value === "compact" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          6 items per row. Sleek 120px images, unit chips (500g, 1kg), and compact pill buttons. Ideal for fruits, veggies & grocery.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block w-fit">
                        Recommended
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => field.onChange("standard")}
                      className={clx(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2",
                        field.value === "standard"
                          ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Standard Grid</span>
                          {field.value === "standard" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          4 items per row. Balanced square images with medium descriptions.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block w-fit">
                        Retail Classic
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => field.onChange("editorial")}
                      className={clx(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2",
                        field.value === "editorial"
                          ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Showcase / Large</span>
                          {field.value === "editorial" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Large cards with rich imagery. Best for luxury goods and artisan crafts.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block w-fit">
                        Editorial
                      </span>
                    </button>
                  </div>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />

            {/* Live Card Mockup Preview (Ideal Size View) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>✨ Ideal Size View & Live Preview:</span>
                  <Badge size="small" color="green">
                    {watchedCardSize === "compact" ? "6-Column Compact" : watchedCardSize === "standard" ? "4-Column Standard" : "Editorial Large"}
                  </Badge>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Live Simulation</span>
              </div>

              {/* Mockup Card Container */}
              <div className="flex justify-center p-3 bg-white rounded-xl border border-slate-100 shadow-inner">
                {watchedCardSize === "compact" ? (
                  /* Compact Card Mockup */
                  <div className="w-48 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2.5 flex flex-col justify-between transition-all">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          7% OFF
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">In Stock</span>
                      </div>
                      {/* Compact Centered Image */}
                      <div className="w-full h-24 rounded-lg bg-slate-50/80 flex items-center justify-center p-2 mb-2">
                        <span className="text-4xl">🍎</span>
                      </div>
                      {/* Title */}
                      <p className="text-xs font-bold text-slate-900 truncate">Kinnaur Apple</p>
                      {/* Size Chips */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white shadow-xs"
                          style={{ backgroundColor: watchedColor }}
                        >
                          500g
                        </span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          1kg
                        </span>
                      </div>
                    </div>
                    {/* Price & Add Row */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-slate-900">₹80</span>
                        <span className="text-[10px] text-slate-400 line-through">₹85</span>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 text-[10px] font-bold text-white rounded-md shadow-xs pointer-events-none"
                        style={{ backgroundColor: watchedColor }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard / Large Card Mockup */
                  <div className="w-64 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition-all">
                    <div className="w-full h-36 bg-slate-100 flex items-center justify-center relative">
                      <span className="text-5xl">🍎</span>
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                        Organic • COD
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <p className="text-sm font-bold text-slate-900 truncate">Kinnaur Mountain Apple</p>
                      <p className="text-xs text-slate-500 line-clamp-2">Crisp, sweet red apples picked at peak harvest.</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">₹80</span>
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-bold text-white rounded-lg shadow-xs pointer-events-none"
                          style={{ backgroundColor: watchedColor }}
                        >
                          Add to Basket
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Guidelines Callout */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-xs space-y-1">
                <p className="font-semibold text-amber-950 flex items-center gap-1">
                  <span>📐 Recommended Image Guidelines:</span>
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-900/90">
                  <li><strong>Ideal Resolution:</strong> 800 × 800 px (1:1 Square aspect ratio).</li>
                  <li><strong>Background:</strong> Clean transparent PNG or pure white background for the cleanest produce look.</li>
                  <li><strong>Framing:</strong> Center the fruit/produce item with ~10-15% margin around the edges.</li>
                  <li><strong>Unit / Sizes:</strong> Use product variants (e.g. 500g, 1kg, 12 pcs) to automatically render pack-size chips!</li>
                </ul>
              </div>
            </div>
          </div>
        </RouteDrawer.Body>

        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button size="small" variant="secondary">
                Cancel
              </Button>
            </RouteDrawer.Close>
            <Button size="small" isLoading={isPending} type="submit">
              Save Theme Settings
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
