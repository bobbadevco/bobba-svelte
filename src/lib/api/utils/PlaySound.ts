import { MouseEventType, NitroSoundEvent } from '@nitrots/nitro-renderer';
import { DispatchMainEvent } from '$lib/events';

let canPlaySound = false;

export const PlaySound = (sampleCode: string) =>
{
	if(!canPlaySound) return;

	DispatchMainEvent(new NitroSoundEvent(NitroSoundEvent.PLAY_SOUND, sampleCode));
}

const eventTypes = [ MouseEventType.MOUSE_CLICK ];

const startListening = () =>
{
	const stopListening = () => eventTypes.forEach(type => window.removeEventListener(type, onEvent));

	// eslint-disable-next-line no-constant-binary-expression
	const onEvent = (_event: Event) => ((canPlaySound = true) && stopListening());

	eventTypes.forEach(type => window.addEventListener(type, onEvent));
}

startListening();
