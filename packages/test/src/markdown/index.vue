<template>
  <div class="markdown-demo">
    <h2>Markdown Demo</h2>

    <section class="markdown-demo__section" data-testid="markdown-static">
      <h3>Static Markdown</h3>
      <TrMarkdown :content="content" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-article">
      <h3>Article Markdown</h3>
      <TrMarkdown :content="articleContent" variant="article" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-colors">
      <h3>Color Preview Markdown</h3>
      <TrMarkdown :content="colorContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-snippet">
      <h3>Snippet Markdown</h3>
      <TrMarkdown :content="snippetContent" :code="snippetCodeConfig" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-code-full">
      <h3>Full Code Markdown</h3>
      <TrMarkdown :content="fullCodeContent" :code="fullCodeConfig" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-disabled">
      <h3>HTML Preview Disabled Markdown</h3>
      <TrMarkdown :content="htmlPreviewDisabledContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-enabled">
      <h3>HTML Preview Enabled Markdown</h3>
      <TrMarkdown :content="htmlPreviewEnabledContent" :features="htmlPreviewEnabledFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-fragment">
      <h3>HTML Preview Fragment Markdown</h3>
      <TrMarkdown :content="htmlPreviewFragmentContent" :features="htmlPreviewFragmentFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-raw-disabled">
      <h3>Raw HTML Disabled Markdown</h3>
      <TrMarkdown :content="rawHtmlContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-raw-enabled">
      <h3>Raw HTML Enabled Markdown</h3>
      <TrMarkdown :content="rawHtmlContent" :features="rawHtmlFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-fidelity">
      <h3>HTML Preview Source Fidelity</h3>
      <TrMarkdown :content="htmlPreviewFidelityContent" :features="htmlPreviewFidelityFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-stream-auto-noscript">
      <h3>HTML Preview Streaming Auto No Script</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in htmlPreviewAutoNoScriptScenario.steps"
          :key="step.id"
          type="button"
          @click="htmlPreviewAutoNoScriptStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown
        :content="htmlPreviewAutoNoScriptContent"
        :features="htmlPreviewAutoFeatures"
        :streaming="htmlPreviewStreamingProps"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-stream-auto-script">
      <h3>HTML Preview Streaming Auto Script</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in htmlPreviewAutoScriptScenario.steps"
          :key="step.id"
          type="button"
          @click="htmlPreviewAutoScriptStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown
        :content="htmlPreviewAutoScriptContent"
        :features="htmlPreviewAutoFeatures"
        :streaming="htmlPreviewStreamingProps"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-stream-live-script">
      <h3>HTML Preview Streaming Live Script</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in htmlPreviewAutoScriptScenario.steps"
          :key="step.id"
          type="button"
          @click="htmlPreviewLiveScriptStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown
        :content="htmlPreviewLiveScriptContent"
        :features="htmlPreviewLiveFeatures"
        :streaming="htmlPreviewStreamingProps"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-stream-defer-noscript">
      <h3>HTML Preview Streaming Defer No Script</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in htmlPreviewAutoNoScriptScenario.steps"
          :key="step.id"
          type="button"
          @click="htmlPreviewDeferNoScriptStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown
        :content="htmlPreviewDeferNoScriptContent"
        :features="htmlPreviewDeferFeatures"
        :streaming="htmlPreviewStreamingProps"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-math-disabled">
      <h3>Math Disabled Markdown</h3>
      <TrMarkdown :content="mathDisabledContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-math-inline">
      <h3>Math Inline Markdown</h3>
      <TrMarkdown :content="mathInlineContent" :features="mathFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-math-block">
      <h3>Math Block Markdown</h3>
      <TrMarkdown :content="mathBlockContent" :features="mathFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-math-invalid">
      <h3>Math Invalid Markdown</h3>
      <TrMarkdown :content="mathInvalidContent" :features="mathFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-mermaid-disabled">
      <h3>Mermaid Disabled Markdown</h3>
      <TrMarkdown :content="mermaidDisabledContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-mermaid-flowchart">
      <h3>Mermaid Flowchart Markdown</h3>
      <TrMarkdown :content="mermaidFlowchartContent" :features="mermaidFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-mermaid-sequence">
      <h3>Mermaid Sequence Markdown</h3>
      <TrMarkdown :content="mermaidSequenceContent" :features="mermaidFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-mermaid-invalid">
      <h3>Mermaid Invalid Markdown</h3>
      <TrMarkdown :content="mermaidInvalidContent" :features="mermaidFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-footnotes-disabled">
      <h3>Footnotes Disabled Markdown</h3>
      <TrMarkdown :content="footnotesDisabledContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-footnotes-single">
      <h3>Footnotes Single Markdown</h3>
      <TrMarkdown :content="footnotesSingleContent" :features="footnotesFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-footnotes-repeated">
      <h3>Footnotes Repeated Markdown</h3>
      <TrMarkdown :content="footnotesRepeatedContent" :features="footnotesFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-footnotes-inline">
      <h3>Footnotes Inline Markdown</h3>
      <TrMarkdown :content="footnotesInlineContent" :features="footnotesFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-alerts-disabled">
      <h3>Alerts Disabled Markdown</h3>
      <TrMarkdown :content="alertsDisabledContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-alerts-matrix">
      <h3>Alerts Matrix Markdown</h3>
      <TrMarkdown :content="alertsMatrixContent" :features="alertsFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-alerts-compare">
      <h3>Alerts Compare Markdown</h3>
      <TrMarkdown :content="alertsCompareContent" :features="alertsFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-video">
      <h3>Video Markdown</h3>
      <TrMarkdown :content="videoContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-image-gallery-disabled">
      <h3>Image Gallery Disabled Markdown</h3>
      <TrMarkdown :content="imageGalleryContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-image-gallery-enabled">
      <h3>Image Gallery Enabled Markdown</h3>
      <TrMarkdown :content="imageGalleryContent" :features="imageGalleryFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-citations-general">
      <h3>Citations General Markdown</h3>
      <div class="markdown-demo__citation-sources" data-citation-source-list="true">
        <a
          v-for="(citation, index) in citationsItems"
          :key="citation.url"
          class="markdown-demo__citation-source-card"
          :href="citation.url"
          target="_blank"
          rel="noopener noreferrer"
          data-citation-source-card="true"
        >
          <span class="markdown-demo__citation-source-index">[{{ index + 1 }}]</span>
          <strong>{{ getCitationTitle(citation, index) }}</strong>
          <span>{{ citation.summary || citation.url }}</span>
        </a>
      </div>
      <TrMarkdown :content="citationsGeneralContent" :citations="citationsItems" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-citations-code-boundary">
      <h3>Citations Code Boundary Markdown</h3>
      <div class="markdown-demo__citation-sources" data-citation-source-list="true">
        <a
          v-for="(citation, index) in citationsItems"
          :key="`boundary-${citation.url}`"
          class="markdown-demo__citation-source-card"
          :href="citation.url"
          target="_blank"
          rel="noopener noreferrer"
          data-citation-source-card="true"
        >
          <span class="markdown-demo__citation-source-index">[{{ index + 1 }}]</span>
          <strong>{{ getCitationTitle(citation, index) }}</strong>
          <span>{{ citation.summary || citation.url }}</span>
        </a>
      </div>
      <TrMarkdown :content="citationsCodeBoundaryContent" :citations="citationsItems" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-component-props">
      <h3>Component Props Markdown</h3>
      <TrMarkdown
        :content="componentPropsContent"
        :components="componentPropsComponents"
        :component-props="componentPropsConfig"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-context-reactive">
      <h3>Reactive Markdown Context</h3>
      <div class="markdown-demo__actions">
        <button type="button" @click="markdownContextStep = 0">Default</button>
        <button type="button" @click="markdownContextStep = 1">Article</button>
      </div>
      <TrMarkdown
        :content="markdownContextContent"
        :components="markdownContextComponents"
        :component-props="markdownContextComponentProps"
        :features="markdownContextFeatures"
        :link="markdownContextLink"
        :code="markdownContextCode"
        :streaming="markdownContextStreaming"
        :render-options="markdownContextRenderOptions"
        :variant="markdownContextVariant"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-custom-plugins">
      <h3>Custom Plugins Markdown</h3>
      <TrMarkdown :content="customPluginsContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-alert-render">
      <h3>Alert Render Markdown</h3>
      <TrMarkdown
        :content="alertRenderContent"
        :features="alertsFeatures"
        :render-options="alertRenderOptions"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-smoothing">
      <h3>Streaming Smoothing Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingTextScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingTextStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <p data-testid="markdown-stream-smoothing-parse-count">parseCount: {{ streamingParseCount }}</p>
      <TrMarkdown
        :content="streamingTextContent"
        :parser="streamingParser"
        :streaming="streamingSmoothingProps"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-link">
      <h3>Streaming Link Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingLinkScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingLinkStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingLinkContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-image">
      <h3>Streaming Image Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingImageScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingImageStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingImageContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-code">
      <h3>Streaming Code Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingCodeScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingCodeStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingCodeContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-table">
      <h3>Streaming Table Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingTableScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingTableStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingTableContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-large-append">
      <h3>Animated Large Append Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedLargeAppend.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedLargeAppend.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedLargeAppend.finalize">Settle</button>
        <button type="button" @click="animatedLargeAppend.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedLargeAppend.content.value"
        :streaming="animatedLargeAppend.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-paragraph-burst">
      <h3>Animated Paragraph Burst Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedParagraphBurst.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedParagraphBurst.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedParagraphBurst.finalize">Settle</button>
        <button type="button" @click="animatedParagraphBurst.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedParagraphBurst.content.value"
        :streaming="animatedParagraphBurst.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-fast-chunks">
      <h3>Animated Fast Chunks Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedFastChunks.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedFastChunks.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedFastChunks.finalize">Settle</button>
        <button type="button" @click="animatedFastChunks.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedFastChunks.content.value"
        :streaming="animatedFastChunks.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-rewrite-reset">
      <h3>Animated Rewrite Reset Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedRewriteReset.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedRewriteReset.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedRewriteReset.finalize">Settle</button>
        <button type="button" @click="animatedRewriteReset.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedRewriteReset.content.value"
        :streaming="animatedRewriteReset.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-hard-reset">
      <h3>Animated Hard Reset Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedHardResetSteps"
          :key="step.id"
          type="button"
          @click="selectAnimatedHardResetStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="finalizeAnimatedHardReset">Settle</button>
        <button type="button" @click="restartAnimatedHardReset">Restart</button>
      </div>
      <TrMarkdown :content="animatedHardResetContent" :streaming="animatedHardResetStreaming" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-heading-list">
      <h3>Animated Heading List Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedHeadingList.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedHeadingList.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedHeadingList.finalize">Settle</button>
        <button type="button" @click="animatedHeadingList.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedHeadingList.content.value"
        :streaming="animatedHeadingList.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-quote-paragraph">
      <h3>Animated Quote Paragraph Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedQuoteParagraph.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedQuoteParagraph.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedQuoteParagraph.finalize">Settle</button>
        <button type="button" @click="animatedQuoteParagraph.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedQuoteParagraph.content.value"
        :streaming="animatedQuoteParagraph.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-high-tps">
      <h3>Animated High TPS Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedHighTpsBurst.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedHighTpsBurst.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedHighTpsBurst.finalize">Settle</button>
        <button type="button" @click="animatedHighTpsBurst.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedHighTpsBurst.content.value"
        :streaming="animatedHighTpsBurst.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-settling-append">
      <h3>Animated Settling Append Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedSettlingAppend.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedSettlingAppend.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedSettlingAppend.finalize">Settle</button>
        <button type="button" @click="animatedSettlingAppend.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedSettlingAppend.content.value"
        :streaming="animatedSettlingAppend.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-variants">
      <h3>Animated Streaming Variants</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="scenario in animatedVariantMatrix.scenarios"
          :key="scenario.id"
          type="button"
          @click="animatedVariantMatrix.selectScenario(scenario.id)"
        >
          {{ scenario.title }}
        </button>
      </div>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedVariantMatrixSteps"
          :key="step.id"
          type="button"
          @click="animatedVariantMatrix.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedVariantMatrix.finalize">Settle</button>
        <button type="button" @click="animatedVariantMatrix.restart">Restart</button>
      </div>
      <div class="markdown-demo__variant-grid">
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-variants-default">
          <header>
            <strong>default</strong>
            <span>Baseline docs path</span>
          </header>
          <TrMarkdown
            :content="animatedVariantMatrix.content.value"
            :streaming="animatedVariantMatrix.streaming.value"
            variant="default"
          />
        </section>
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-variants-bubble">
          <header>
            <strong>bubble</strong>
            <span>Compact markdown variant</span>
          </header>
          <TrMarkdown
            :content="animatedVariantMatrix.content.value"
            :streaming="animatedVariantMatrix.streaming.value"
            variant="bubble"
          />
        </section>
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-variants-article">
          <header>
            <strong>article</strong>
            <span>Long-form reading variant</span>
          </header>
          <TrMarkdown
            :content="animatedVariantMatrix.content.value"
            :streaming="animatedVariantMatrix.streaming.value"
            variant="article"
          />
        </section>
      </div>
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-bubble-integration">
      <h3>Animated Bubble Integration</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="scenario in animatedBubbleStreaming.scenarios"
          :key="scenario.id"
          type="button"
          @click="animatedBubbleStreaming.selectScenario(scenario.id)"
        >
          {{ scenario.title }}
        </button>
      </div>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedBubbleStreamingSteps"
          :key="step.id"
          type="button"
          @click="animatedBubbleStreaming.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedBubbleStreaming.finalize">Settle</button>
        <button type="button" @click="animatedBubbleStreaming.restart">Restart</button>
      </div>
      <div class="markdown-demo__variant-grid markdown-demo__variant-grid--bubble">
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-bubble-fallback">
          <header>
            <strong>fallback renderer</strong>
            <span>String content + fallbackContentRenderer</span>
          </header>
          <TrBubbleProvider :content-attributes="animatedBubbleFallbackAttributes">
            <TrBubble
              :content="animatedBubbleStreaming.content.value"
              role="assistant"
              :fallback-content-renderer="BubbleRenderers.Markdown"
            />
          </TrBubbleProvider>
        </section>
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-bubble-content-type">
          <header>
            <strong>content type</strong>
            <span>`{ type: 'markdown', text }` + provider match</span>
          </header>
          <TrBubbleProvider
            :content-renderer-matches="bubbleMarkdownRendererMatches"
            :content-attributes="animatedBubbleContentTypeAttributes"
          >
            <TrBubbleList
              :messages="animatedBubbleMessages"
              :role-configs="bubbleRoleConfigs"
              content-render-mode="split"
            />
          </TrBubbleProvider>
        </section>
      </div>
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-skip-matrix">
      <h3>Animated Skip Matrix Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedSkipMatrixSteps"
          :key="step.id"
          type="button"
          @click="selectAnimatedSkipMatrixStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="finalizeAnimatedSkipMatrix">Settle</button>
        <button type="button" @click="restartAnimatedSkipMatrix">Restart</button>
      </div>
      <TrMarkdown :content="animatedSkipMatrixContent" :streaming="animatedSkipMatrixStreaming" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble">
      <h3>Bubble Markdown</h3>
      <TrBubble :content="content" :fallback-content-renderer="BubbleRenderers.Markdown" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble-fallback">
      <h3>Bubble Markdown Fallback</h3>
      <TrBubbleProvider :content-attributes="bubbleFallbackAttributes">
        <TrBubble :content="bubbleFallbackContent" :fallback-content-renderer="BubbleRenderers.Markdown" />
      </TrBubbleProvider>
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble-content-type">
      <h3>Bubble Markdown Content Type</h3>
      <TrBubbleProvider
        :content-renderer-matches="bubbleMarkdownRendererMatches"
        :content-attributes="bubbleContentTypeAttributes"
      >
        <TrBubbleList :messages="bubbleMessages" :role-configs="bubbleRoleConfigs" content-render-mode="split" />
      </TrBubbleProvider>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, markRaw, ref, useSlots } from 'vue'
import {
  BubbleRendererMatchPriority,
  BubbleRenderers,
  TrBubble,
  TrBubbleList,
  TrBubbleProvider,
  TrMarkdown,
  useMarkdownContext,
  type TrMarkdownAlertRenderContext,
  type TrMarkdownCitationItem,
  markdownItAdapter,
  type TrMarkdownCodeActionContext,
  type TrMarkdownCodeConfig,
  type BubbleContentAttributesConfig,
  type BubbleContentRendererMatch,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { trMarkdownStreamingFixtures } from '../../../components/src/markdown/fixtures/streaming'

const content = `# Markdown Title

Paragraph with [link](https://example.com) and \`inline code\`.

Second paragraph to observe spacing rhythm and text density in a more article-like block.

This sentence is followed by a forced break.<br />
The next sentence should render on a new line but stay in the same paragraph.

> This is a blockquote used to validate left border, padding and secondary text treatment.

- list item one
- list item two
- list item three

- [ ] task list item
- [x] task list item done

This is a <ins>underlined</ins> text with H<sub>2</sub>O and E = mc<sup>2</sup>.

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to focus the command input.

\`\`\`ts
const message = 'hello markdown'
console.log(message)
\nfunction greet(name: string) {\n  return \`Hello, \${name}\`\n}\n
\`\`\`

\`\`\`js
console.log('short')
\`\`\`

| Name | Type | Description |
| --- | --- | --- |
| id | number | Unique identifier |
| name | string | Display name |
| active | boolean | Whether the item is active |

---
`

const articleContent = `# Long Article Regression

Markdown article rendering should stay readable when headings, paragraphs, quotes, task lists and tables appear in one continuous document.

## Reading rhythm

The first thing this case checks is whether long-form content still feels calm after the recent markdown and code-block changes.

> Quiet typography matters more than isolated visual flourishes when the content becomes long.

### Implementation checklist

- [x] Component mapping is active
- [x] Theme tokens control the main surfaces
- [ ] Bubble rhythm is checked after task list support lands

| Topic | Expectation |
| --- | --- |
| Paragraphs | Stable spacing |
| Task lists | Clear alignment |
| Tables | Readable hierarchy |

## Appendix

If this section remains readable at the bottom of a longer article, the basic markdown layer is in much better shape.`

const colorContent = `The primary token is \`#1677ff\`, the success tone is \`rgb(82, 196, 26)\`, and the warning tone is \`hsl(37, 100%, 55%)\`.`

const snippetContent = `\`\`\`bash
pnpm install
\`\`\``

const snippetCodeConfig: TrMarkdownCodeConfig = {
  highlight: {
    engine: 'shiki',
  },
}

const fullCodeContent = `\`\`\`ts
export function greetUser(name: string) {
  console.log('hewwo ' + name) // [!code --]
  console.log('Hello ' + name) // [!code ++]
  return \`Welcome, \${name}!\`
}
\`\`\`

\`\`\`tsx
export default ({ children, className }: MarkdownProps) => {
  const { styles } = useStyles()

  return (
    <ReactMarkdown
      className={cx(styles.container, className)}
      components={{ pre: CodeBlock, code: Code }}
    >
      {children}
    </ReactMarkdown>
  )
}
\`\`\``

const fullCodeConfig: TrMarkdownCodeConfig = {
  blockMode: 'full',
  highlight: {
    engine: 'shiki',
    enableTransformer: true,
  },
  actionsRender: ({ code, language, originalNode }: TrMarkdownCodeActionContext) => [
    originalNode,
    h(
      'button',
      {
        type: 'button',
        class: 'tr-markdown__code-action-button',
        title: 'Custom action',
        'aria-label': 'Custom action',
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          console.info('[tiny-robot-test] custom action', {
            language,
            preview: code.slice(0, 48),
          })
        },
      },
      'AI',
    ),
  ],
}

const htmlPreviewDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TinyRobot HTML Preview Test</title>
    <style>
      html,
      body {
        margin: 0;
      }

      body {
        min-height: 220px;
        padding: 32px;
        box-sizing: border-box;
        background: #101628;
        color: #ffffff;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }

      .pill {
        display: inline-flex;
        padding: 0.2em 0.6em;
        border-radius: 999px;
        background: #34d3f5;
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Hello from inside Markdown</h1>
      <p>This block is rendered by <span class="pill">HtmlPreview</span>.</p>
      <p>Scripts run inside an isolated sandbox iframe.</p>
    </main>
  </body>
</html>`

const htmlPreviewFragment = `<section>
  <h1>Fragment fallback</h1>
  <p>This stays as code because it is not a full HTML document.</p>
</section>`

const htmlPreviewDisabledContent = `\`\`\`html
${htmlPreviewDocument}
\`\`\``

const htmlPreviewEnabledContent = `\`\`\`html
${htmlPreviewDocument}
\`\`\``

const htmlPreviewFragmentContent = `\`\`\`html
${htmlPreviewFragment}
\`\`\``

const rawHtmlContent = `Inline raw HTML should stay literal when disabled, but become real markup when enabled: <span class="raw-html-chip" data-raw-html-chip="inline">inline html</span>.

<div class="raw-html-card" data-raw-html-block="true">
  <strong>Block HTML</strong>
  <p>Generic raw HTML now has a dedicated render path.</p>
</div>`

const rawHtmlFeatures = {
  html: true,
}

const htmlPreviewFidelityDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title> Fidelity </title>
  </head>
  <body>
    <pre id="fidelity-target">  leading and trailing whitespace preserved  </pre>
  </body>
</html>
`

const htmlPreviewFidelityContent = `\`\`\`html

${htmlPreviewFidelityDocument}

\`\`\``

const htmlPreviewFidelityFeatures = {
  htmlPreview: {
    enabled: true,
    defaultMode: 'source' as const,
    fileName: 'tiny-robot-html-preview-fidelity.html',
  },
}

const htmlPreviewEnabledFeatures = {
  htmlPreview: {
    enabled: true,
    defaultHeight: 260,
    fileName: 'tiny-robot-html-preview.html',
  },
}

const htmlPreviewFragmentFeatures = {
  htmlPreview: {
    enabled: true,
  },
}

const htmlPreviewStreamingProps = {
  enabled: true,
  active: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 48,
} as const

const htmlPreviewAutoFeatures = {
  htmlPreview: {
    enabled: true,
    defaultHeight: 260,
    fileName: 'tiny-robot-html-preview-stream-auto.html',
    streamingMode: 'auto' as const,
  },
}

const htmlPreviewLiveFeatures = {
  htmlPreview: {
    enabled: true,
    defaultHeight: 260,
    fileName: 'tiny-robot-html-preview-stream-live.html',
    streamingMode: 'live' as const,
  },
}

const htmlPreviewDeferFeatures = {
  htmlPreview: {
    enabled: true,
    defaultHeight: 260,
    fileName: 'tiny-robot-html-preview-stream-defer.html',
    streamingMode: 'defer' as const,
  },
}

const mathInlineSource = `Inline math keeps Einstein visible as $E = mc^2$ inside normal prose.`

const mathBlockSource = `$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$`

const mathInvalidSource = `$$
\\frac{1}{
$$`

const mathDisabledContent = mathInlineSource
const mathInlineContent = mathInlineSource
const mathBlockContent = mathBlockSource
const mathInvalidContent = mathInvalidSource

const mathFeatures = {
  math: {
    enabled: true,
    copyable: true,
  },
}

const mermaidFlowchart = `flowchart TD
  User[User prompt] --> Planner{Freeze plan}
  Planner --> Implement[Implement Mermaid block]
  Implement --> Verify[Verify demo and tests]
  Verify --> Ship[Ship markdown update]
`

const mermaidSequence = `sequenceDiagram
  participant User
  participant TinyRobot
  User->>TinyRobot: Continue the Mermaid milestone
  TinyRobot-->>User: Preview the rendered diagram
  TinyRobot-->>User: Toggle back to source when needed
`

const mermaidInvalid = `flowchart TD
  Start -->
`

const createMermaidFence = (source: string) => `\`\`\`mermaid
${source}
\`\`\``

const mermaidDisabledContent = createMermaidFence(mermaidFlowchart)
const mermaidFlowchartContent = createMermaidFence(mermaidFlowchart)
const mermaidSequenceContent = createMermaidFence(mermaidSequence)
const mermaidInvalidContent = createMermaidFence(mermaidInvalid)

const mermaidFeatures = {
  mermaid: {
    enabled: true,
    defaultMode: 'preview' as const,
  },
}

const footnotesSingleSource = `TinyRobot keeps a note handy.[^1]

[^1]: Footnotes should feel first-party, readable, and easy to jump back from.`

const footnotesRepeatedSource = `Same footnote.[^a] Again.[^a]

[^a]: Shared note with [link](https://example.com) and \`code\` inside the same footnote body.`

const footnotesInlineSource = `Inline footnote syntax also works.^[Inline note body with **emphasis** and an easy return path.]`

const footnotesDisabledContent = footnotesSingleSource
const footnotesSingleContent = footnotesSingleSource
const footnotesRepeatedContent = footnotesRepeatedSource
const footnotesInlineContent = footnotesInlineSource

const footnotesFeatures = {
  footnotes: {
    enabled: true,
  },
}

const alertsDisabledSource = `> [!NOTE]
> This marker should stay visible when alerts are disabled.`

const alertsMatrixSource = `> [!NOTE]
> TinyRobot now treats GitHub alerts as first-party callouts.
>
> Regular **markdown** content, [links](https://example.com), and \`code\` still render inside the body.

> [!TIP]
> Keep alert detection inside render so the parser stays lightweight.

> [!IMPORTANT]
> Public docs, demo cases, and Playwright coverage should move together.

> [!WARNING]
> Only GitHub's five official alert kinds are upgraded.

> [!CAUTION]
> Normal blockquotes must not be upgraded accidentally.`

const alertsCompareSource = `> Plain blockquotes should stay on the default quote path.

> [!TIP] Same-line alerts should also work without leaking the marker into the body.

> [!WARNING]
> The marker should disappear from the first paragraph.
>
> A follow-up paragraph should stay inside the same alert block.`

const alertsDisabledContent = alertsDisabledSource
const alertsMatrixContent = alertsMatrixSource
const alertsCompareContent = alertsCompareSource

const alertsFeatures = {
  alerts: {
    enabled: true,
  },
}

const videoSource = `A standalone <video /> block should render as a first-party media node.

<video src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" poster="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" controls preload="metadata" />

TinyRobot keeps this path narrow instead of enabling general raw HTML.`

const videoContent = videoSource

const imageGallerySource = `![Desk setup](https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80 "Desk setup")

Gallery preview should stay owned by markdown instead of attachments.

![Ops wall](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80 "Ops wall")

![Team board](https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80 "Team board")`

const imageGalleryContent = imageGallerySource

const imageGalleryFeatures = {
  imageGallery: {
    enabled: true,
    showCaption: true,
    closeOnEscape: true,
  },
}

const citationsItems: TrMarkdownCitationItem[] = [
  {
    url: 'https://www.weather.com.cn/weather/101210101.shtml',
    title: '中国天气网杭州预报',
    summary: '提供杭州近几天的逐日天气概览与气温范围。',
  },
  {
    url: 'https://weather.cma.cn/web/weather/58457.html',
    title: '中央气象台杭州站点',
    summary: '提供站点级天气数据与降水趋势。',
  },
  {
    url: 'https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832',
    title: 'AccuWeather Hangzhou',
    summary: '补充未来几天的体感与趋势预测信息。',
  },
]

const citationsGeneralContent = `杭州未来几天以阴雨和多云为主，白天气温在 7-12℃ 之间波动[1][2]。

- 明天有小雨，体感会更凉[2]
- 周末开始逐步转多云，但早晚温差仍然明显[3]

如果只是快速阅读，正文里的 \`[1] / [2] / [3]\` 应该先表现为稳定的第一方引用节点，再通过 hover card 或上方来源卡片补充完整信息。`

const citationsCodeBoundaryContent = `这里的 \`coord[1]\` 只是普通数组索引，不应该被升级成 citation。

\`\`\`ts
const coord = [12, 34, 56]
console.log(coord[1])
\`\`\`

只有正文里的天气结论[1] 才应该被识别成第一方引用节点。`

const getCitationTitle = (citation: (typeof citationsItems)[number], index: number) => {
  if (citation.title) {
    return citation.title
  }

  if (citation.alt) {
    return citation.alt
  }

  try {
    return new URL(citation.url).hostname.replace(/^www\./, '')
  } catch {
    return `Citation ${index + 1}`
  }
}

const TestMarkdownHeading = defineComponent({
  name: 'TestMarkdownHeading',
  props: {
    level: {
      type: Number,
      required: true,
    },
    badge: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    const slots = useSlots()

    return () =>
      h(
        `h${Math.min(Math.max(componentProps.level, 1), 6)}`,
        {
          class: 'markdown-demo__custom-heading',
          'data-heading-badge': componentProps.badge || undefined,
        },
        [
          componentProps.badge
            ? h(
                'span',
                { class: 'markdown-demo__custom-heading-badge', 'data-custom-heading-badge': 'true' },
                componentProps.badge,
              )
            : undefined,
          slots.default?.(),
        ],
      )
  },
})

const TestMarkdownLink = defineComponent({
  name: 'TestMarkdownLink',
  props: {
    href: {
      type: String,
      default: undefined,
    },
    rel: {
      type: String,
      default: undefined,
    },
    target: {
      type: String,
      default: undefined,
    },
    iconLabel: {
      type: String,
      default: '',
    },
    tone: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    const slots = useSlots()

    return () =>
      h(
        'a',
        {
          class: 'markdown-demo__custom-link',
          href: componentProps.href,
          rel: componentProps.rel,
          target: componentProps.target,
          'data-link-tone': componentProps.tone || undefined,
        },
        [
          h(
            'span',
            { class: 'markdown-demo__custom-link-icon', 'data-custom-link-icon': 'true' },
            componentProps.iconLabel || '->',
          ),
          slots.default?.(),
        ],
      )
  },
})

const TestMarkdownInlineCode = defineComponent({
  name: 'TestMarkdownInlineCode',
  props: {
    code: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    tone: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    return () =>
      h(
        'code',
        {
          class: 'markdown-demo__custom-inline-code',
          'data-inline-label': componentProps.label || undefined,
          'data-inline-tone': componentProps.tone || undefined,
        },
        [
          h('span', { class: 'markdown-demo__custom-inline-code-label' }, componentProps.label || 'TOKEN'),
          h('span', componentProps.code),
        ],
      )
  },
})

const componentPropsComponents = {
  heading: TestMarkdownHeading,
  link: TestMarkdownLink,
  inlineCode: TestMarkdownInlineCode,
}

const componentPropsContent = `# Component props heading

Use a [custom link](https://docs.opentiny.design/tiny-robot/) and a custom \`inline token\` inside the same markdown document.

This paragraph stays on the default node component path, but still receives attrs from \`componentProps\`.`

const componentPropsConfig = {
  heading: {
    badge: 'M5.7',
  },
  link: {
    iconLabel: 'DOCS',
    tone: 'brand',
  },
  inlineCode: {
    label: 'TOKEN',
    tone: 'brand',
  },
  paragraph: {
    class: 'markdown-demo__custom-paragraph',
    'data-component-props-paragraph': 'true',
  },
}

const markdownContextScenario = [
  {
    code: {
      copyable: true,
    },
    componentProps: {
      paragraph: {
        'data-context-paragraph-tone': 'default',
      },
    },
    features: {
      html: false,
    },
    link: {
      rel: 'noopener noreferrer',
      target: '_blank' as const,
    },
    streaming: {
      active: false,
      enabled: true,
    },
    variant: 'default' as const,
  },
  {
    code: {
      copyable: false,
    },
    componentProps: {
      paragraph: {
        'data-context-paragraph-tone': 'article',
      },
    },
    features: {
      html: true,
    },
    link: {
      rel: 'nofollow',
      target: '_self' as const,
    },
    streaming: {
      active: true,
      enabled: true,
    },
    variant: 'article' as const,
  },
] as const

const markdownContextStep = ref(0)
const markdownContextVariant = computed(() => markdownContextScenario[markdownContextStep.value]?.variant || 'default')
const markdownContextFeatures = computed(() => markdownContextScenario[markdownContextStep.value]?.features || {})
const markdownContextLink = computed(() => markdownContextScenario[markdownContextStep.value]?.link || {})
const markdownContextCode = computed(() => markdownContextScenario[markdownContextStep.value]?.code || {})
const markdownContextStreaming = computed(() => markdownContextScenario[markdownContextStep.value]?.streaming || {})
const markdownContextRenderOptions = computed(() => ({
  alerts: {
    render: undefined,
  },
}))
const markdownContextContent = `A [reactive markdown context](https://example.com/context) should update injected consumers after prop changes.`

const MarkdownContextProbeParagraph = defineComponent({
  name: 'MarkdownContextProbeParagraph',
  props: {
    node: {
      type: Object,
      default: undefined,
    },
  },
  setup(_, { slots }) {
    return () => {
      const context = useMarkdownContext()

      return h(
        'p',
        {
          class: 'markdown-demo__context-probe',
          'data-context-variant': context?.variant || 'missing',
          'data-context-link-target': context?.link.target || 'missing',
          'data-context-link-rel': context?.link.rel || 'missing',
          'data-context-html-enabled': String(Boolean(context?.features.html)),
          'data-context-copyable': String(Boolean(context?.code.copyable)),
          'data-context-streaming-active': String(Boolean(context?.streaming.active)),
          'data-context-streaming-enabled': String(Boolean(context?.streaming.enabled)),
          'data-context-render-options': String(Boolean(context?.renderOptions)),
        },
        slots.default?.(),
      )
    }
  },
})

const markdownContextComponents = {
  paragraph: MarkdownContextProbeParagraph,
}

const markdownContextComponentProps = computed(
  () => markdownContextScenario[markdownContextStep.value]?.componentProps || {},
)

const customPluginsContent = `好的，让我换一个视角解释一下“睡觉”。

<tr-thinking title="Why this becomes a first-party block">
这个请求先适合暴露一个可折叠的 reasoning 语义块，用来承接模型在进入 artifact 前的判断，而不是把通用插件系统直接暴露给使用者。
</tr-thinking>

<tr-artifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160">
  <rect width="220" height="160" rx="24" fill="#F4EBD8" />
  <text x="110" y="72" font-size="20" text-anchor="middle" fill="#8B5E34">睡觉</text>
  <text x="110" y="106" font-size="12" text-anchor="middle" fill="#8B5E34">生产力的假死，创造力的重生。</text>
</svg>
</tr-artifact>

<tr-unknown title="future">Unsupported tag should stay literal.</tr-unknown>`

const alertRenderContent = `> [!NOTE]
> TinyRobot can replace the default alert shell without touching the parser.
>
> Inline [links](https://example.com) and \`code\` still come from the markdown subtree.

> Plain blockquotes should still stay on the default quote path.

> [!CAUTION]
> This custom render path should freeze the public boundary for alert shells.`

const alertRenderOptions = {
  alerts: {
    render: ({ kind, title, renderChildren }: TrMarkdownAlertRenderContext) => {
      const role = kind === 'warning' || kind === 'caution' ? 'alert' : 'note'

      return h(
        'section',
        {
          class: 'markdown-demo__custom-alert',
          'data-custom-alert-kind': kind,
          role,
        },
        [
          h('header', { class: 'markdown-demo__custom-alert-header' }, [
            h('span', { class: 'markdown-demo__custom-alert-eyebrow' }, `ALERT / ${kind.toUpperCase()}`),
            h('strong', { class: 'markdown-demo__custom-alert-title' }, title),
          ]),
          h('div', { class: 'markdown-demo__custom-alert-body' }, renderChildren()),
        ],
      )
    },
  },
}

const bubbleFallbackContent = `## Bubble Fallback

This fallback path still renders [links](https://example.com) through \`TrMarkdown\`.

- [x] Fallback renderer is active
- [ ] Provider attributes should still reach markdown

\`\`\`ts
console.log('bubble fallback')
\`\`\``

const bubbleMarkdownRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (_, content) => content.type === 'markdown',
    renderer: markRaw(BubbleRenderers.Markdown),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
]

const bubbleRoleConfigs: Record<string, BubbleRoleConfig> = {
  user: {
    placement: 'end',
  },
}

const bubbleMessages: BubbleMessage[] = [
  {
    role: 'user',
    content: 'Please render the reply with explicit markdown content items.',
  },
  {
    role: 'assistant',
    content: [
      {
        type: 'markdown',
        text: `## Bubble Content Type

This branch uses [content attributes](https://example.com/content-type) with \`TrMarkdown\`.

- [x] Explicit \`{ type: 'markdown', text }\` content item
- [x] Bubble renderer match routes markdown items only

\`\`\`ts
console.log('bubble content type')
\`\`\``,
      },
      {
        type: 'text',
        text: 'This trailing text item intentionally remains on the default text renderer.',
      },
    ],
  },
]

const bubbleMarkdownLink = {
  target: '_self' as const,
  rel: 'nofollow noopener',
}

const bubbleMarkdownCode = {
  copyable: false,
  showLanguage: false,
}

const bubbleMarkdownStyle = {
  '--tr-markdown-font-size': '15px',
  '--tr-markdown-line-height': '1.7',
  '--tr-markdown-spacing-scale': '1.6',
}

const bubbleFallbackAttributes: BubbleContentAttributesConfig = () => ({
  markdown: {
    code: bubbleMarkdownCode,
    link: bubbleMarkdownLink,
  },
  style: bubbleMarkdownStyle,
  'data-bubble-markdown-mode': 'fallback',
})

const bubbleContentTypeAttributes: BubbleContentAttributesConfig = (_, content) => {
  if (content.type !== 'markdown') {
    return undefined
  }

  return {
    markdown: {
      code: bubbleMarkdownCode,
      link: bubbleMarkdownLink,
    },
    style: bubbleMarkdownStyle,
    'data-bubble-markdown-mode': 'content-type',
  }
}

const getStreamingScenario = (id: string) => {
  const scenario = trMarkdownStreamingFixtures.find((item) => item.id === id)
  if (!scenario) {
    throw new Error(`Missing streaming scenario: ${id}`)
  }

  return scenario
}

const streamingLinkScenario = getStreamingScenario('incomplete-link')
const streamingImageScenario = getStreamingScenario('incomplete-image')
const streamingCodeScenario = getStreamingScenario('incomplete-code-fence')
const streamingTableScenario = getStreamingScenario('incomplete-table')
const streamingTextScenario = getStreamingScenario('text-tail')
const htmlPreviewAutoNoScriptScenario = getStreamingScenario('html-preview-auto-noscript')
const htmlPreviewAutoScriptScenario = getStreamingScenario('html-preview-auto-script')

const streamingLinkStep = ref(0)
const streamingImageStep = ref(0)
const streamingCodeStep = ref(0)
const streamingTableStep = ref(0)
const streamingTextStep = ref(0)
const htmlPreviewAutoNoScriptStep = ref(0)
const htmlPreviewAutoScriptStep = ref(0)
const htmlPreviewLiveScriptStep = ref(0)
const htmlPreviewDeferNoScriptStep = ref(0)
const streamingParseCount = ref(0)

const streamingLinkContent = computed(() => streamingLinkScenario.steps[streamingLinkStep.value].content)
const streamingImageContent = computed(() => streamingImageScenario.steps[streamingImageStep.value].content)
const streamingCodeContent = computed(() => streamingCodeScenario.steps[streamingCodeStep.value].content)
const streamingTableContent = computed(() => streamingTableScenario.steps[streamingTableStep.value].content)
const streamingTextContent = computed(() => streamingTextScenario.steps[streamingTextStep.value].content)
const htmlPreviewAutoNoScriptContent = computed(
  () => htmlPreviewAutoNoScriptScenario.steps[htmlPreviewAutoNoScriptStep.value].content,
)
const htmlPreviewAutoScriptContent = computed(
  () => htmlPreviewAutoScriptScenario.steps[htmlPreviewAutoScriptStep.value].content,
)
const htmlPreviewLiveScriptContent = computed(
  () => htmlPreviewAutoScriptScenario.steps[htmlPreviewLiveScriptStep.value].content,
)
const htmlPreviewDeferNoScriptContent = computed(
  () => htmlPreviewAutoNoScriptScenario.steps[htmlPreviewDeferNoScriptStep.value].content,
)

const streamingProps = {
  enabled: true,
  active: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 48,
} as const

const streamingSmoothingProps = {
  enabled: true,
  active: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 120,
} as const

const animatedStreamingBase = {
  enabled: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 64,
  mode: 'animated',
  preset: 'balanced',
  profile: {
    enabled: true,
    label: 'tiny-robot-test',
    maxEvents: 64,
  },
} as const

const createAnimatedStreamingHarness = (scenarioId: string) => {
  const scenario = getStreamingScenario(scenarioId)
  const step = ref(0)
  const active = ref(true)

  return {
    scenario,
    step,
    active,
    content: computed(() => scenario.steps[step.value]?.content || ''),
    streaming: computed(() => ({
      ...animatedStreamingBase,
      active: active.value,
    })),
    selectStep(index: number) {
      step.value = index
      active.value = true
    },
    finalize() {
      active.value = false
    },
    restart() {
      step.value = 0
      active.value = true
    },
  }
}

const createAnimatedStreamingMatrixHarness = (scenarioIds: readonly string[]) => {
  const scenarios = scenarioIds.map((id) => getStreamingScenario(id))
  const scenarioId = ref(scenarios[0]?.id || '')
  const step = ref(0)
  const active = ref(true)
  const activeScenario = computed(() => scenarios.find((scenario) => scenario.id === scenarioId.value) || scenarios[0])

  return {
    scenarios,
    activeScenario,
    step,
    active,
    content: computed(() => activeScenario.value?.steps[step.value]?.content || ''),
    streaming: computed(() => ({
      ...animatedStreamingBase,
      active: active.value,
    })),
    selectScenario(nextScenarioId: string) {
      scenarioId.value = nextScenarioId
      step.value = 0
      active.value = true
    },
    selectStep(index: number) {
      step.value = index
      active.value = true
    },
    finalize() {
      active.value = false
    },
    restart() {
      step.value = 0
      active.value = true
    },
  }
}

const animatedLargeAppend = createAnimatedStreamingHarness('large-append')
const animatedParagraphBurst = createAnimatedStreamingHarness('paragraph-burst')
const animatedFastChunks = createAnimatedStreamingHarness('fast-chunks')
const animatedRewriteReset = createAnimatedStreamingHarness('rewrite-reset')
const animatedHeadingList = createAnimatedStreamingHarness('heading-list')
const animatedHighTpsBurst = createAnimatedStreamingHarness('high-tps-burst')
const animatedQuoteParagraph = createAnimatedStreamingHarness('quote-paragraph')
const animatedSettlingAppend = createAnimatedStreamingHarness('settling-append')
const animatedVariantMatrix = createAnimatedStreamingMatrixHarness([
  'high-tps-burst',
  'settling-append',
  'rewrite-reset',
])
const animatedBubbleStreaming = createAnimatedStreamingMatrixHarness([
  'high-tps-burst',
  'settling-append',
  'rewrite-reset',
])
const animatedVariantMatrixSteps = computed(() => animatedVariantMatrix.activeScenario.value?.steps || [])
const animatedBubbleStreamingSteps = computed(() => animatedBubbleStreaming.activeScenario.value?.steps || [])

const animatedBubbleFallbackAttributes: BubbleContentAttributesConfig = () => ({
  markdown: {
    code: bubbleMarkdownCode,
    link: bubbleMarkdownLink,
    streaming: animatedBubbleStreaming.streaming.value,
  },
  style: bubbleMarkdownStyle,
  'data-bubble-markdown-mode': 'animated-fallback',
})

const animatedBubbleContentTypeAttributes: BubbleContentAttributesConfig = (_, content) => {
  if (content.type !== 'markdown') {
    return undefined
  }

  return {
    markdown: {
      code: bubbleMarkdownCode,
      link: bubbleMarkdownLink,
      streaming: animatedBubbleStreaming.streaming.value,
    },
    style: bubbleMarkdownStyle,
    'data-bubble-markdown-mode': 'animated-content-type',
  }
}

const animatedBubbleMessages = computed<BubbleMessage[]>(() => [
  {
    role: 'user',
    content: 'Please keep streaming markdown inside the assistant bubble.',
  },
  {
    role: 'assistant',
    content: [
      {
        type: 'markdown',
        text: animatedBubbleStreaming.content.value,
      },
      {
        type: 'text',
        text: 'This trailing text item intentionally remains on the default text renderer.',
      },
    ],
  },
])

const animatedSkipMatrixSteps = [
  {
    id: 'skip-matrix-1',
    label: 'Heading only',
    content: '## Skip matrix repro\n',
  },
  {
    id: 'skip-matrix-2',
    label: 'Append mixed content',
    content: `## Skip matrix repro

Animated paragraph text should reveal progressively while code, table and image stay on their own non-character-animation paths.

![TinyRobot logo](https://img.example.com/tiny-robot.png)

| Name | Type |
| --- | --- |
| retryCount | number |

\`\`\`ts
const skip = true
console.log(skip)
\`\`\`
`,
  },
] as const

const animatedHardResetSteps = [
  {
    id: 'hard-reset-1',
    label: 'Paragraph',
    content: `## Hard reset repro

This paragraph is intentionally replaced by a list so the block structure changes.
`,
  },
  {
    id: 'hard-reset-2',
    label: 'List rewrite',
    content: `## Hard reset repro

- The paragraph became a list item
- Scheduler should hard reset this structure change
`,
  },
] as const

const animatedSkipMatrixStep = ref(0)
const animatedSkipMatrixActive = ref(true)
const animatedSkipMatrixContent = computed(() => animatedSkipMatrixSteps[animatedSkipMatrixStep.value]?.content || '')
const animatedSkipMatrixStreaming = computed(() => ({
  ...animatedStreamingBase,
  active: animatedSkipMatrixActive.value,
}))
const animatedHardResetStep = ref(0)
const animatedHardResetActive = ref(true)
const animatedHardResetContent = computed(() => animatedHardResetSteps[animatedHardResetStep.value]?.content || '')
const animatedHardResetStreaming = computed(() => ({
  ...animatedStreamingBase,
  active: animatedHardResetActive.value,
}))

const selectAnimatedSkipMatrixStep = (index: number) => {
  animatedSkipMatrixStep.value = index
  animatedSkipMatrixActive.value = true
}

const finalizeAnimatedSkipMatrix = () => {
  animatedSkipMatrixActive.value = false
}

const restartAnimatedSkipMatrix = () => {
  animatedSkipMatrixStep.value = 0
  animatedSkipMatrixActive.value = true
}

const selectAnimatedHardResetStep = (index: number) => {
  animatedHardResetStep.value = index
  animatedHardResetActive.value = true
}

const finalizeAnimatedHardReset = () => {
  animatedHardResetActive.value = false
}

const restartAnimatedHardReset = () => {
  animatedHardResetStep.value = 0
  animatedHardResetActive.value = true
}

const streamingParser = markRaw({
  name: 'streaming-test-parser',
  async parse(source: string, options: Parameters<typeof markdownItAdapter.parse>[1]) {
    streamingParseCount.value += 1
    return markdownItAdapter.parse(source, options)
  },
})
</script>

<style scoped>
.markdown-demo {
  display: grid;
  gap: 24px;
}

.markdown-demo__section {
  display: grid;
  gap: 12px;
}

.markdown-demo__citation-sources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.markdown-demo__citation-source-card {
  display: grid;
  gap: 6px;
  min-height: 108px;
  padding: 14px 16px;
  border: 1px solid rgba(22, 119, 255, 0.18);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08), rgba(22, 119, 255, 0.02));
  color: #1f2329;
  text-decoration: none;
}

.markdown-demo__citation-source-card:hover {
  border-color: rgba(22, 119, 255, 0.3);
}

.markdown-demo__citation-source-card strong {
  font-size: 14px;
  line-height: 1.5;
}

.markdown-demo__citation-source-card span {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}

.markdown-demo__citation-source-index {
  color: #1677ff !important;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.markdown-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.markdown-demo__variant-grid {
  display: grid;
  gap: 12px;
}

.markdown-demo__variant-grid--bubble {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.markdown-demo__variant-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #fff;
}

.markdown-demo__variant-card header {
  display: grid;
  gap: 4px;
}

.markdown-demo__variant-card strong,
.markdown-demo__variant-card span {
  margin: 0;
}

.markdown-demo__variant-card strong {
  font-size: 13px;
  text-transform: uppercase;
}

.markdown-demo__variant-card span {
  font-size: 12px;
  color: #666;
}

.markdown-demo__custom-heading {
  display: flex;
  gap: 10px;
  align-items: center;
}

.markdown-demo__custom-heading-badge {
  display: inline-flex;
  padding: 0.18em 0.5em;
  border-radius: 999px;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.markdown-demo__custom-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #1677ff;
  font-weight: 600;
}

.markdown-demo__custom-link-icon {
  font-size: 11px;
  opacity: 0.76;
}

.markdown-demo__custom-inline-code {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0.22em 0.5em;
  border: 1px solid rgba(22, 119, 255, 0.2);
  border-radius: 999px;
  background: rgba(22, 119, 255, 0.08);
}

.markdown-demo__custom-inline-code-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.72;
}

.markdown-demo__custom-paragraph {
  padding-left: 10px;
  border-left: 2px solid rgba(22, 119, 255, 0.18);
}

.markdown-demo__custom-alert {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid rgba(22, 119, 255, 0.18);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08), rgba(22, 119, 255, 0.02));
}

.markdown-demo__custom-alert-header {
  display: grid;
  gap: 4px;
}

.markdown-demo__custom-alert-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1677ff;
}

.markdown-demo__custom-alert-title {
  color: #1f2329;
}

.markdown-demo__custom-alert-body {
  display: grid;
  gap: 8px;
}
</style>
