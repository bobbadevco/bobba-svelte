import { FigureUpdateEvent, RoomUnitChatStyleComposer, UserInfoEvent, UserSettingsEvent, type UserInfoDataParser } from "@nitrots/nitro-renderer";
import { registerLocalStorage } from "./localstorage.svelte";
import { registerMessageEvent } from "./registration";
import { GetLocalStorage, GetSessionDataManager, SendMessageComposer } from "$lib/api";

let avatarInfo = $state<UserInfoDataParser>();
let avatarLook = $state<string>();
let chatStyleId = $state<number>(0);
let avatarRespectsLeft = $state<number>(0);
let petRespectsLeft = $state<number>(0);

const screenSize = registerLocalStorage('nitro.screensize', { width: 0, height: 0 });

export const getUserInfo = () => avatarInfo;
export const getUserLook = () => avatarLook;
export const getChatStyleId = () => chatStyleId;
export const getAvatarRespectsLeft = () => avatarRespectsLeft;
export const getPetRespectsLeft = () => petRespectsLeft;
export const getScreenSize = () => screenSize;

export const initializeSession = () => {
    registerMessageEvent<FigureUpdateEvent>(FigureUpdateEvent, event =>
    {
        const parser = event.getParser();

        avatarLook = parser.figure;
    });

    registerMessageEvent<UserSettingsEvent>(UserSettingsEvent, event =>
    {
        const parser = event.getParser();

        chatStyleId = parser.chatType;
    });

    registerMessageEvent<UserInfoEvent>(UserInfoEvent, event =>
    {
        const parser = event.getParser();

        avatarInfo = parser.userInfo;
        avatarLook = parser.userInfo.figure;
        avatarRespectsLeft = parser.userInfo.respectsRemaining;
        petRespectsLeft = parser.userInfo.respectsPetRemaining;
    });
}

export const updateChatStyleId = (styleId: number) => 
{
    chatStyleId = styleId;

    SendMessageComposer(new RoomUnitChatStyleComposer(styleId));
}

export const respectUser = (avatarId: number) =>
{
    GetSessionDataManager().giveRespect(avatarId);

    avatarRespectsLeft = GetSessionDataManager().respectsLeft;
}

export const respectPet = (petId: number) =>
{
    GetSessionDataManager().giveRespect(petId);

    petRespectsLeft = GetSessionDataManager().respectsPetLeft;
}


export const handleSessionState = () => 
{
    if (typeof window === 'undefined') return;

    const currentScreenSize = <{ width: number, height: number}>GetLocalStorage('nitro.screensize');

    if(currentScreenSize && ((currentScreenSize.width !== window.innerWidth) || (currentScreenSize.height !== window.innerHeight)))
    {
        let i = window.localStorage.length;

        while(i > 0)
        {
            const key = window.localStorage.key(i);

            if(key && key.startsWith('nitro.window')) window.localStorage.removeItem(key);

            i--;
        }
    }

    const onResize = () => screenSize.current = { width: window.innerWidth, height: window.innerHeight };

    window.addEventListener('resize', onResize);
    
    onResize();

    return () => window.removeEventListener('resize', onResize);
}
