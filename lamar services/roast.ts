import { commandFunctionType } from "../command-handler";
import { get_account } from "../postgres/account";

const roastPlayer:commandFunctionType = async (interaction)=>{
    const userID = interaction.member?.user.id
    if (!userID) return
    const account = await get_account(userID)
    if (!account) return
    
}

export {roastPlayer}