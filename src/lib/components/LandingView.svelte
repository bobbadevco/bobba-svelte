<script lang="ts">
	import { GetConfiguration } from "$lib/api";
	import { getUserLook, initializeSession, registerRoomSessionManagerEvent } from "$lib/events";
	import { NitroConfiguration, RoomSessionEvent } from "@nitrots/nitro-renderer";
	import { onMount } from "svelte";

    let isVisible = $state(true);

    const avatarLook = getUserLook();
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
                        isVisible = true;
                        break;
                    case RoomSessionEvent.ENDED:
                        isVisible = false;
                        break;
                }
        });
    });
</script>

{#if isVisible}
    <div class="absolute top-0 left-0 w-full h-full bg-black/50">asd</div>
{/if}