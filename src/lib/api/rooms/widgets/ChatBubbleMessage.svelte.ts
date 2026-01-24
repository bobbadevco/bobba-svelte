import type { INitroPoint } from '@nitrots/nitro-renderer';

export class ChatBubbleMessage {
	public static BUBBLE_COUNTER: number = 0;

	public id: number = -1;
	public width: number = 0;
	public height: number = 0;
	public skipMovement: boolean = false;

	top: number = $state(0);
	left: number = $state(0);

	constructor(
		public senderId: number = -1,
		public senderCategory: number = -1,
		public roomId: number = -1,
		public text: string = '',
		public formattedText: string = '',
		public username: string = '',
		public location: INitroPoint | undefined = undefined,
		public type: number = 0,
		public styleId: number = 0,
		public imageUrl: string | undefined = undefined,
		public color: string | undefined = undefined
	) {
		this.id = ++ChatBubbleMessage.BUBBLE_COUNTER;
	}
}
