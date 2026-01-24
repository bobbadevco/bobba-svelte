
import { GetRoomSession, GetRoomSessionManager } from "../room";
import { GoToLanding } from "./GoToLanding";


export const GoToHotelView = () =>
{
    if(!GetRoomSession()) return;

    GoToLanding();
    GetRoomSessionManager().removeSession(-1);
}