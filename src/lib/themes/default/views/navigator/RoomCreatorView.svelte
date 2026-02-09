<script lang="ts">
    import { CreateFlatMessageComposer } from '@nitrots/nitro-renderer';
    import { GetConfiguration, LocalizeText, SendMessageComposer } from '$lib/api';
    import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';
    import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
    import { type IRoomModel } from '$lib/api';
    import { onMount } from 'svelte';
    import Flex from '$lib/components/common/Flex.svelte';

    const navigator = getNavigatorListener();

    let maxVisitorsList = $state<number[]>([]);
    let roomName = $state('');
    let description = $state('');
    let category = $state<number | null>(null);
    let usersCount = $state<number | null>(null);
    let tradeSettings = $state(0);
    let roomModels = $state<IRoomModel[]>([]);
    let selectedModelName = $state('');

    const hcDisabled = GetConfiguration<boolean>('hc.disabled', false);
    const getRoomModelImage = (name: string) => GetConfiguration<string>('images.url') + `/navigator/models/model_${ name }.png`;

    function selectModel(model: IRoomModel, index: number)
    {
        if(!model) return;
        selectedModelName = roomModels[index].name;
    }

    function closeCreator()
    {
        navigator.creatorOpen = false;
    }

    function createRoom()
    {
        if(!roomName || (roomName.length < 3) || !selectedModelName || (category === null) || (usersCount === null)) return;
        const modelName = 'model_' + selectedModelName;
        SendMessageComposer(new CreateFlatMessageComposer(roomName, description, modelName, Number(category), Number(usersCount), tradeSettings));
        navigator.creatorOpen = false;
    }

    $effect(() =>
    {
        if(maxVisitorsList.length === 0)
        {
            const list: number[] = [];
            for(let i = 10; i <= 100; i += 10) list.push(i);
            maxVisitorsList = list;
            usersCount = list[0];
        }
    });

    $effect(() =>
    {
        const cats = navigator.categories;
        if(cats && cats.length) category = cats[0].id;
    });

    onMount(() =>
    {
        const models = GetConfiguration<IRoomModel[]>('navigator.room.models');
        if(models && models.length)
        {
            roomModels = models;
            selectedModelName = models[0].name;
        }
    });
</script>

<BobbaWindow class="min-h-120 min-w-170" unique="room-creator" headerTitle={ LocalizeText('navigator.createroom.title') } onCloseClick={ closeCreator }>
    <Flex class="gap-3 p-2 overflow-hidden">
        <Flex column class="gap-3 w-80 overflow-hidden">
            <Flex column class="gap-2">
                <p class="ms-1 font-bold">{ LocalizeText('navigator.createroom.roomnameinfo') }</p>
                <input
                    type="text"
                    class="room-creator-form border-2 border-black p-1"
                    maxlength={60}
                    placeholder={ LocalizeText('navigator.createroom.roomnameinfo') }
                    bind:value={roomName} />
                {#if (!roomName || (roomName.length < 3))}
                    <span class="text-red-500 text-xs">{ LocalizeText('navigator.createroom.nameerr') }</span>
                {/if}
            </Flex>
            <Flex column class="gap-2">
                <p class="ms-1 font-bold">{ LocalizeText('navigator.createroom.roomdescinfo') }</p>
                <textarea
                    class="room-creator-form border-2 border-black p-1 h-20"
                    maxlength={255}
                    placeholder={ LocalizeText('navigator.createroom.roomdescinfo') }
                    bind:value={description}></textarea>
            </Flex>
            <Flex column class="gap-3">
                <Flex column class="gap-1">
                    <p class="ms-1 font-bold">{ LocalizeText('navigator.category') }</p>
                    <select class="border-2 border-black p-1"
                            bind:value={category}>
                        {#each (navigator.categories || []) as cat (cat.id)}
                            <option value={cat.id}>{ LocalizeText(cat.name) }</option>
                        {/each}
                    </select>
                </Flex>
                <Flex column class="gap-1">
                    <p class="ms-1 font-bold">{ LocalizeText('navigator.maxvisitors') }</p>
                    <select class="border-2 border-black p-1"
                            bind:value={usersCount}>
                        {#each maxVisitorsList as v (v)}
                            <option value={v}>{ v }</option>
                        {/each}
                    </select>
                </Flex>
                <Flex column class="gap-1">
                    <p class="ms-1 font-bold">{ LocalizeText('navigator.tradesettings') }</p>
                    <select class="border-2 border-black p-1" bind:value={tradeSettings}>
                        <option value={0}>{ LocalizeText('navigator.roomsettings.trade_not_allowed') }</option>
                        <option value={1}>{ LocalizeText('navigator.roomsettings.trade_not_with_Controller') }</option>
                        <option value={2}>{ LocalizeText('navigator.roomsettings.trade_allowed') }</option>
                    </select>
                </Flex>
                <Flex class="gap-3 mt-1">
                    <button class="volter-bold-button px-3 py-1 border-2 border-black bg-primary text-white" onclick={createRoom}>
                        { LocalizeText('navigator.createroom.create') }
                    </button>
                    <button class="volter-button px-3 py-1 border-2 border-black bg-[#ddd]" onclick={closeCreator}>
                        { LocalizeText('cancel') }
                    </button>
                </Flex>
            </Flex>
        </Flex>
        <Flex column class="gap-2 grow overflow-auto">
            <div class="grid grid-cols-2 gap-2">
                {#each roomModels as model, index (model.name)}
                    <Flex
                        class={`relative border-2 border-black p-2 cursor-pointer bg-white ${selectedModelName === model.name ? 'selected' : ''}`}
                        onclick={() => selectModel(model, index)}>
                        <Flex fullHeight class="justify-center items-start overflow-hidden h-32">
                            <img src={ getRoomModelImage(model.name) } alt={model.name} />
                        </Flex>
                        <Flex class="absolute bottom-1 left-1 items-center gap-1 text-xs">
                            <span class={ selectedModelName === model.name ? 'icon-tiles_room_selected' : 'icon-tiles' }></span>
                            { model.tileSize } { LocalizeText('navigator.createroom.tilesize') }
                        </Flex>
                        {#if (!hcDisabled && model.clubLevel > 0)}
                            <span class="icon-hc_mini absolute top-1 right-1"></span>
                        {/if}
                        {#if selectedModelName === model.name}
                            <i class="active-arrow"></i>
                        {/if}
                    </Flex>
                {/each}
            </div>
        </Flex>
    </Flex>
</BobbaWindow>