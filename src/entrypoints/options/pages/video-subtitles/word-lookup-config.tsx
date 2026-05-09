import type { LLMProviderConfig } from "@/types/config/provider"
import { i18n } from "#imports"
import { deepmerge } from "deepmerge-ts"
import { useAtom, useAtomValue } from "jotai"
import { useMemo } from "react"
import { Field, FieldContent, FieldLabel } from "@/components/ui/base-ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/base-ui/select"
import { Switch } from "@/components/ui/base-ui/switch"
import { isLLMProviderConfig } from "@/types/config/provider"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { filterEnabledProvidersConfig } from "@/utils/config/helpers"
import { ConfigCard } from "../../components/config-card"

export function WordLookupConfig() {
  const [videoSubtitlesConfig, setVideoSubtitlesConfig] = useAtom(configFieldsAtomMap.videoSubtitles)
  const providersConfig = useAtomValue(configFieldsAtomMap.providersConfig)
  const llmProviders = useMemo(
    () => filterEnabledProvidersConfig(providersConfig).filter(isLLMProviderConfig),
    [providersConfig],
  )
  const selectedProvider = llmProviders.find(provider => provider.id === videoSubtitlesConfig.wordLookup.providerId)

  return (
    <ConfigCard
      id="subtitle-word-lookup"
      title={i18n.t("options.videoSubtitles.wordLookup.title")}
      description={i18n.t("options.videoSubtitles.wordLookup.description")}
    >
      <div className="space-y-6">
        <Field orientation="horizontal">
          <FieldContent className="self-center">
            <FieldLabel htmlFor="subtitle-interactive-words">
              {i18n.t("options.videoSubtitles.wordLookup.interactiveWords")}
            </FieldLabel>
          </FieldContent>
          <Switch
            id="subtitle-interactive-words"
            checked={videoSubtitlesConfig.interactiveWords}
            onCheckedChange={(checked) => {
              void setVideoSubtitlesConfig(
                deepmerge(videoSubtitlesConfig, {
                  interactiveWords: checked,
                }),
              )
            }}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="subtitle-word-lookup-provider">
            {i18n.t("options.videoSubtitles.wordLookup.provider")}
          </FieldLabel>
          <Select<LLMProviderConfig>
            value={selectedProvider}
            itemToStringValue={provider => provider.id}
            onValueChange={(provider) => {
              if (!provider) {
                return
              }

              void setVideoSubtitlesConfig({
                ...videoSubtitlesConfig,
                wordLookup: {
                  ...videoSubtitlesConfig.wordLookup,
                  providerId: provider.id,
                },
              })
            }}
            disabled={llmProviders.length === 0}
          >
            <SelectTrigger id="subtitle-word-lookup-provider" className="w-full">
              <SelectValue placeholder={i18n.t("options.videoSubtitles.wordLookup.noProvider")}>
                {provider => provider.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {llmProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </ConfigCard>
  )
}
