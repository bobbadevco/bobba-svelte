<script lang="ts">
    import { GetConfiguration } from "$lib/api";
    import { getRoomSession, getUserLook, initializeSession, registerRoomSessionManagerEvent } from "$lib/events";
    import { NitroConfiguration, RoomSessionEvent } from "@nitrots/nitro-renderer";
    import { onMount } from "svelte";
    import AvatarImage from "$lib/components/common/layout/AvatarImage.svelte";

    let isVisible = $state(!getRoomSession());
    let avatarLook = $derived(getUserLook());

    const widgetSlotCount = 7;

    const hotelViewConf = GetConfiguration<{ images: { [key: string]: string } }>('hotelview', { images: {} });

    const backgroundColor = hotelViewConf.images['background.colour'];
    const background = NitroConfiguration.interpolate(hotelViewConf.images['background']);
    const sun = NitroConfiguration.interpolate(hotelViewConf.images['sun']);
    const drape = NitroConfiguration.interpolate(hotelViewConf.images['drape']);
    const left = NitroConfiguration.interpolate(hotelViewConf.images['left']);
    const rightRepeat = NitroConfiguration.interpolate(hotelViewConf.images['right.repeat']);
    const right = NitroConfiguration.interpolate(hotelViewConf.images['right']);

    onMount(() => {
      initializeSession();
      registerRoomSessionManagerEvent<RoomSessionEvent>([
          RoomSessionEvent.CREATED,
          RoomSessionEvent.ENDED,], event =>
          {
              switch(event.type)
              {
                  case RoomSessionEvent.CREATED:
                      isVisible = false;
                      break;
                  case RoomSessionEvent.ENDED:
                      isVisible = true;
                      break;
              }
      });
    });
</script>

{#if isVisible}
    <div class="fixed d-block w-full h-full" style={ (backgroundColor && backgroundColor) && `background-color: ${backgroundColor};` }>
        <AvatarImage figure={ avatarLook }/>
    </div>
{/if}