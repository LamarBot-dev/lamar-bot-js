import { storedData } from "./data";
import { Discord } from "./discordclient";

type buttonControlsFunction = (data:storedData, button: Discord.CollectedInteraction)=>void;
export type { buttonControlsFunction };