import { Discord } from "./discordclient";

type buttonControlsFunction = (button: Discord.CollectedInteraction)=>void;
export type { buttonControlsFunction };