import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryClient } from "../../lib/query-client"

export const themeQueryKeys = {
  all: ["theme"] as const,
  details: () => [...themeQueryKeys.all, "detail"] as const,
}

export type SellerThemeOverrides = {
  brand_color?: string
  tagline?: string
  logo_url?: string
  banner_url?: string
  announcement_text?: string
  hero_title?: string
  hero_subtitle?: string
  social_links?: {
    whatsapp?: string
    instagram?: string
    twitter?: string
    facebook?: string
  }
  [key: string]: any
}

export type SellerTheme = {
  id: string
  seller_id: string
  template_id: string | null
  theme_overrides: SellerThemeOverrides | null
  onboarding_status: string
  created_at?: string
  updated_at?: string
}

export type StoreTemplate = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  preview_image_url?: string | null
  config?: any
}

export type ThemeResponse = {
  seller: {
    id: string
    name: string
    handle: string
  }
  theme: SellerTheme | null
  templates: StoreTemplate[]
}

export const useTheme = () => {
  const { data, ...rest } = useQuery<ThemeResponse>({
    queryFn: async () => {
      return await fetchQuery("/vendor/theme", {
        method: "GET",
      })
    },
    queryKey: themeQueryKeys.details(),
  })

  return {
    ...data,
    ...rest,
  }
}

export const useUpdateTheme = () => {
  return useMutation({
    mutationFn: async (payload: {
      template_id?: string
      theme_overrides?: SellerThemeOverrides
    }) => {
      return await fetchQuery("/vendor/theme", {
        method: "POST",
        body: payload,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: themeQueryKeys.details(),
      })
    },
  })
}
