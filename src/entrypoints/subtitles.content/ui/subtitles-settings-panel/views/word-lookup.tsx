import type { ReactNode } from "react"
import type { LLMProviderConfig } from "@/types/config/provider"
import { i18n } from "#imports"
import { IconBook, IconBrain, IconPointer } from "@tabler/icons-react"
import { useAtom, useAtomValue } from "jotai"
import { use, useMemo } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/base-ui/select"
import { Switch } from "@/components/ui/base-ui/switch"
import { isLLMProviderConfig } from "@/types/config/provider"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { filterEnabledProvidersConfig } from "@/utils/config/helpers"
import { ShadowWrapperContext } from "@/utils/react-shadow-host/create-shadow-host"
import { subtitlesStore } from "../../../atoms"

function SettingsGroup({ title, icon, children }: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mb-4">
      <div className="text-popover-foreground mb-1.5 flex items-center gap-1.5 px-0.5 text-[13px] font-medium">
        {icon}
        {title}
      </div>
      <div className="bg-muted/50 divide-border rounded-xl border divide-y">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, children }: { label: string, children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-popover-foreground text-[13px]">{label}</span>
      {children}
    </div>
  )
}

export function WordLookupView() {
  const [config, setConfig] = useAtom(configFieldsAtomMap.videoSubtitles, { store: subtitlesStore })
  const providersConfig = useAtomValue(configFieldsAtomMap.providersConfig, { store: subtitlesStore })
  const portalContainer = use(ShadowWrapperContext)
  const llmProviders = useMemo(
    () => filterEnabledProvidersConfig(providersConfig).filter(isLLMProviderConfig),
    [providersConfig],
  )
  const selectedProvider = llmProviders.find(provider => provider.id === config.wordLookup.providerId)

  return (
    <div className="min-h-[calc(100cqh-6rem)] px-3 pb-4 pt-3">
      <SettingsGroup
        title={i18n.t("options.videoSubtitles.wordLookup.title")}
        icon={<IconBook className="size-3.5" />}
      >
        <SettingRow label={i18n.t("options.videoSubtitles.wordLookup.interactiveWords")}>
          <Switch
            checked={config.interactiveWords}
            onCheckedChange={(checked) => {
              void setConfig({
                ...config,
                interactiveWords: checked,
              })
            }}
          />
        </SettingRow>
        <SettingRow label={i18n.t("options.videoSubtitles.wordLookup.provider")}>
          <Select<LLMProviderConfig>
            value={selectedProvider}
            itemToStringValue={provider => provider.id}
            onValueChange={(provider) => {
              if (!provider) {
                return
              }

              void setConfig({
                ...config,
                wordLookup: {
                  ...config.wordLookup,
                  providerId: provider.id,
                },
              })
            }}
            disabled={llmProviders.length === 0}
          >
            <SelectTrigger size="sm" className="min-w-[8rem] text-[13px]">
              <SelectValue placeholder={i18n.t("options.videoSubtitles.wordLookup.noProvider")}>
                {provider => provider.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent container={portalContainer}>
              <SelectGroup>
                {llmProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsGroup>

      <div className="text-muted-foreground flex items-start gap-2 px-1 text-[12px] leading-snug">
        <IconPointer className="mt-0.5 size-3.5 shrink-0" />
        <span>{i18n.t("options.videoSubtitles.wordLookup.description")}</span>
      </div>
      <div className="text-muted-foreground mt-2 flex items-start gap-2 px-1 text-[12px] leading-snug">
        <IconBrain className="mt-0.5 size-3.5 shrink-0" />
        <span>{i18n.t("options.videoSubtitles.wordLookup.customPromptHint")}</span>
      </div>
    </div>
  )
}
