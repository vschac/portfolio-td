<script>
  import LeftPanel from './app/components/LeftPanel.svelte'
  import RightPanel from './app/components/RightPanel.svelte'
  import SectionTwo from './app/components/sections/SectionTwo.svelte'
  import SectionExperience from './app/components/sections/SectionExperience.svelte'
  import SectionProjects from './app/components/sections/SectionProjects.svelte'
  import SectionGallery from './app/components/sections/SectionGallery.svelte'
  import SectionContact from './app/components/sections/SectionContact.svelte'
</script>

<div style="width: 100vw; background: #141413; overflow-x: clip;">

  <!--
    Sections 01–02: two-column layout.
    Left column scrolls (hero + section 2); right panel sticks in place.
    Once the user passes section 2, sticky ends and sections 03+ are full-width.
  -->
  <div style="display: flex; align-items: flex-start;">

    <!-- Left column — sections 01 + 02 -->
    <div style="width: 53%; flex-shrink: 0;">
      <div style="height: 100vh; overflow: hidden; scroll-snap-align: start;">
        <LeftPanel />
      </div>
      <SectionTwo />
    </div>

    <!-- Right column — sticky WebRTC video panel -->
    <div style="width: 47%; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow: hidden;">
      <RightPanel />
    </div>

  </div>

  <!-- Sections 03–06: full-width -->
  <SectionExperience />
  <SectionProjects />
  <SectionGallery />
  <SectionContact />

</div>
