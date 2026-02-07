export default () => {
	let interval: ReturnType<typeof setInterval> | undefined;

	self.onmessage = (message: MessageEvent) => {
		if (!message) return;

		const data: { [index: string]: never } = message.data;

		switch (data.action) {
			case 'START':
				interval = setInterval(() => {postMessage(null);}, data.content);
				break;
			case 'STOP':
				if (interval) {
					clearInterval(interval);
					interval = undefined;
				}
				break;
		}
	};
};
