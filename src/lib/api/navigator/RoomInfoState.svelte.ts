import { RoomDataParser } from '@nitrots/nitro-renderer';

class RoomInfoState {
	roomInfoData = $state<RoomDataParser | null>(null);
	roomInfoId = $state<number | null>(null);
	closeTimeout: ReturnType<typeof setTimeout> | null = null;

	clearCloseDelay() {
		if (this.closeTimeout) {
			clearTimeout(this.closeTimeout);
			this.closeTimeout = null;
		}
	}

	closeWithDelay() {
		this.clearCloseDelay();
		this.closeTimeout = setTimeout(() => {
			this.roomInfoData = null;
			this.roomInfoId = null;
			this.closeTimeout = null;
		}, 300);
	}
}

const roomInfoState = new RoomInfoState();

export const getRoomInfoState = () => roomInfoState;
