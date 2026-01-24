import { GetSessionDataManager } from "$lib/api";
import { getRoomSession, getUserLook, registerMainEvent, registerMessageEvent, registerRoomEngineEvent } from "$lib/events";
import { Dispose, DropBounce, EaseOut, JumpBy, Motions, NitroCommunicationDemoEvent, NitroEvent, NitroToolbarAnimateIconEvent, PerkAllowancesMessageEvent, PerkEnum, Queue, Wait } from "@nitrots/nitro-renderer";

class ToolbarListener {
    isInRoom = $state(getRoomSession());
    isMod = GetSessionDataManager().isModerator;
    userFigure = $derived(getUserLook());
    isMeExpanded = $state(false);
    useGuideTool = $state(false);
    getFullCount = $state(0);
    getTotalUnseen = $state(0);
    iconState = null;
    requests = [];

    private static instance: ToolbarListener;

    constructor() {
        registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
        registerRoomEngineEvent(NitroToolbarAnimateIconEvent.ANIMATE_ICON, this.onToolbarAnimateIconEvent.bind(this));
    }

    public init(_e: NitroEvent) {
        registerMessageEvent(PerkAllowancesMessageEvent, this.onPrkAllowances.bind(this));
    }

    public static getInstance(): ToolbarListener {
		if (!ToolbarListener.instance) {
			ToolbarListener.instance = new ToolbarListener();
		}
		return ToolbarListener.instance;
	}

    private onPrkAllowances(event: PerkAllowancesMessageEvent) {
        const parser = event.getParser();

        this.useGuideTool = parser.isAllowed(PerkEnum.USE_GUIDE_TOOL);
    }

    private onToolbarAnimateIconEvent(event: NitroToolbarAnimateIconEvent) {
        const animationIconToToolbar = (iconName: string, image: HTMLImageElement, x: number, y: number) =>
        {
            const target = (document.body.getElementsByClassName(iconName)[0] as HTMLElement);

            if(!target) return;
            
            image.className = 'toolbar-icon-animation';
            image.style.visibility = 'visible';
            image.style.left = (x + 'px');
            image.style.top = (y + 'px');

            document.body.append(image);

            const targetBounds = target.getBoundingClientRect();
            const imageBounds = image.getBoundingClientRect();

            const left = (imageBounds.x - targetBounds.x);
            const top = (imageBounds.y - targetBounds.y);
            const squared = Math.sqrt(((left * left) + (top * top)));
            const wait = (500 - Math.abs(((((1 / squared) * 100) * 500) * 0.5)));
            const height = 20;

            const motionName = (`ToolbarBouncing[${ iconName }]`);

            if(!Motions.getMotionByTag(motionName))
            {
                Motions.runMotion(new Queue(new Wait((wait + 8)), new DropBounce(target, 400, 12))).tag = motionName;
            }

            const motion = new Queue(new EaseOut(new JumpBy(image, wait, ((targetBounds.x - imageBounds.x) + height), (targetBounds.y - imageBounds.y), 100, 1), 1), new Dispose(image));

            Motions.runMotion(motion);
        }

        animationIconToToolbar('icon-inventory', event.image, event.x, event.y);
    }
}

export const getToolbarListener = () => ToolbarListener.getInstance();
