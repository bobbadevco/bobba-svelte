<script lang="ts">
    import { CreateFlatMessageComposer } from '@nitrots/nitro-renderer';
    import { GetConfiguration, LocalizeText, SendMessageComposer } from '$lib/api';
    import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';
    import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
    import { type IRoomModel } from '$lib/api';
    import { onMount } from 'svelte';
    import Flex from '$lib/components/common/Flex.svelte';
    import Select from '$lib/components/common/Select.svelte';
    import Button from '$lib/components/common/Button.svelte';

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

<style>
    @keyframes MoveUpDown {
        0%, 100% {
            top: 1px;
        }
        50% {
            top: 10px;
        }
    }

    .active-arrow {
        animation: MoveUpDown 1.7s linear infinite;
    }
</style>

<BobbaWindow class="min-h-97" unique="room-creator" headerTitle={ LocalizeText('navigator.createroom.title') } onCloseClick={ closeCreator }>
    <Flex class="gap-3 p-2 overflow-hidden">
        <Flex column class="gap-3 w-80 overflow-hidden">
            <Flex column class="gap-2 relative">
                <p class="ms-0.5 text-[14px] font-bold">{ LocalizeText('navigator.createroom.roomnameinfo') }</p>
                <input
                    type="text"
                    class="text-[14px] max-h-6 focus:border-0 focus:outline-0 border-none bg-white rounded-sm text-black p-1"
                    maxlength={60}
                    placeholder={ LocalizeText('navigator.createroom.roomnameinfo') }
                    bind:value={roomName} />
                {#if (!roomName || (roomName.length < 3))}
                    <span class="ms-0.5 right-0 mt-0.5 absolute text-red-500 text-xs">{ LocalizeText('navigator.createroom.nameerr') }</span>
                {/if}
            </Flex>
            <Flex column class="gap-2">
                <p class="ms-0.5 text-[14px] font-bold">{ LocalizeText('navigator.createroom.roomdescinfo') }</p>
                <textarea
                    class="text-[14px] room-creator-form focus:border-0 focus:outline-0 border-none bg-white rounded-sm text-black p-1"
                    maxlength={255}
                    placeholder={ LocalizeText('navigator.createroom.roomdescinfo') }
                    bind:value={description}></textarea>
            </Flex>
            <Flex column class="gap-3">
                <Flex column class="gap-1">
                    <p class="ms-0.5 text-[14px] font-bold">{ LocalizeText('navigator.category') }</p>
                    <Select
                      class="max-h-6 text-[14px] focus:border-0 focus:outline-0 border-none bg-white rounded-sm text-black p-1"
                      value={category ?? ''}
                      fullWidth
                      setValue={(v) => (category = (v === '' ? null : Number(v)))}
                      options={(navigator.categories ?? []).map((cat) => ({
                            value: cat.id,
                            label: LocalizeText(cat.name)
                        }))}
                    />
                </Flex>
                <Flex column class="gap-1">
                    <p class="ms-0.5 text-[14px] font-bold">{ LocalizeText('navigator.maxvisitors') }</p>
                    <Select
                      class="max-h-6 text-[14px] room-creator-form focus:border-0 focus:outline-0 border-none bg-white rounded-sm text-black p-1"
                      value={usersCount ?? maxVisitorsList[0] ?? 0}
                      fullWidth
                      setValue={(v) => (usersCount = Number(v))}
                      options={maxVisitorsList.map((n) => ({ value: n, label: String(n) }))}
                    />
                </Flex>
                <Flex column class="gap-1">
                    <p class="ms-0.5 text-[14px] font-bold">{ LocalizeText('navigator.tradesettings') }</p>
                    <Select
                      class="max-h-6 text-[14px] room-creator-form focus:border-0 focus:outline-0 border-none bg-white rounded-sm text-black p-1"
                      value={tradeSettings}
                      fullWidth
                      setValue={(v) => (tradeSettings = Number(v))}
                      options={[
                        { value: 0, label: LocalizeText('navigator.roomsettings.trade_not_allowed') },
                        { value: 1, label: LocalizeText('navigator.roomsettings.trade_not_with_Controller') },
                        { value: 2, label: LocalizeText('navigator.roomsettings.trade_allowed') }
                      ]}
                    />
                </Flex>
                <Flex class="gap-1 mt-1">
                    <Button class="max-h-6 items-center px-3 text-[14px] rounded-sm border border-success bg-success shadow-[inset_0_-11px_#2e9906] text-white" onclick={createRoom}>
                        { LocalizeText('navigator.createroom.create') }
                    </Button>
                    <Button class="max-h-6 items-center px-3 text-[14px] rounded-sm border border-button-primary bg-button-primary shadow-[inset_0_-11px_#444444] text-white" onclick={closeCreator}>
                        { LocalizeText('cancel') }
                    </Button>
                </Flex>
            </Flex>
        </Flex>
        <Flex column class="gap-2 grow overflow-auto">
            <div class="grid grid-cols-2 gap-2">
                {#each roomModels as model, index (model.name)}
                    <Flex
                        class={`relative items-center justify-center min-h-25 rounded-md p-2 cursor-pointer ${selectedModelName === model.name ? 'bg-primary' : 'bg-secondary'}`}
                        onclick={() => selectModel(model, index)}>
                        <Flex fullHeight class="justify-center items-center overflow-hidden h-32">
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
                            <i class="bg-(image:--navigator-spritesheet) bg-position-[-86px_-2px] w-4.5 h-5 absolute top-1 active-arrow"></i>
                        {/if}
                    </Flex>
                {/each}
            </div>
        </Flex>
    </Flex>
</BobbaWindow>