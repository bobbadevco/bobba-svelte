import { DesktopViewComposer } from '@nitrots/nitro-renderer';
import { SendMessageComposer } from '../../communication';

export function GoToLanding(): void
{
    SendMessageComposer(new DesktopViewComposer());
}